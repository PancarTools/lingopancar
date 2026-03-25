import { database } from "./firebase";
import {
	ref,
	set,
	get,
	update,
	remove,
	onValue,
	query,
	orderByChild,
	equalTo,
	runTransaction,
} from "firebase/database";
import type { Card, Deck, SimpleCard } from "./types";
import { CARD_TYPE } from "./types";
import { DEMO_DECK_CARDS } from "../assets/demo-deck";

export async function createOrGetDeck(userId: string): Promise<Deck> {
	if (!database) throw new Error("Firebase not initialized");

	const deckId = `deck_${userId}`;
	const deckRef = ref(database, `users/${userId}/decks/${deckId}`);
	const snapshot = await get(deckRef);

	if (snapshot.exists()) {
		return snapshot.val();
	}

	const newDeck: Deck = {
		id: deckId,
		userId,
		name: "My Deck",
		createdAt: Date.now(),
		cardCount: 0,
	};

	await set(deckRef, newDeck);
	return newDeck;
}

export async function ensureWelcomeCard(userId: string, deckId: string): Promise<void> {
	if (!database) throw new Error("Firebase not initialized");

	const cardId = "welcome-card-erfolg";
	const now = Date.now();
	const welcomeCardRef = ref(database, `users/${userId}/cards/${cardId}`);

	const tx = await runTransaction(welcomeCardRef, (current) => {
		if (current) {
			return;
		}

		return {
			id: cardId,
			userId,
			deckId,
			type: CARD_TYPE.DETAILED,
			prefix: "der",
			main: "Erfolg",
			suffix: "",
			meaning: "success",
			description: "positives Ergebnis, das man erreichen wollte",
			examples: [
				{
					sentence: "Sie hatte (mit ihrem Projekt) leider keinen Erfolg.",
					translation: "Unfortunately she wasn't successful (with her project).",
				},
			],
			createdAt: now,
			updatedAt: now,
			reviewCount: 0,
		};
	});

	if (!tx.committed) {
		return;
	}

	const deckCardCountRef = ref(database, `users/${userId}/decks/${deckId}/cardCount`);
	await runTransaction(deckCardCountRef, (count) => (typeof count === "number" ? count : 0) + 1);
}

export async function getDemoDeckLoadedState(userId: string): Promise<boolean> {
	if (!database) throw new Error("Firebase not initialized");

	const demoStateRef = ref(database, `users/${userId}/meta/demoDeckLoaded`);
	const snapshot = await get(demoStateRef);

	return snapshot.exists() ? Boolean(snapshot.val()) : false;
}

export async function loadDemoDeck(userId: string, deckId: string): Promise<number> {
	if (!database) throw new Error("Firebase not initialized");

	const isAlreadyLoaded = await getDemoDeckLoadedState(userId);
	if (isAlreadyLoaded) {
		return 0;
	}

	const existingCards = await getCardsByDeckId(userId, deckId);
	const existingKeys = new Set(existingCards.map((card) => `${card.type}:${card.main.toLowerCase()}`));

	let addedCount = 0;
	for (const demoCard of DEMO_DECK_CARDS) {
		const key = `${demoCard.type}:${demoCard.main.toLowerCase()}`;
		if (existingKeys.has(key)) {
			continue;
		}

		await addCard(userId, deckId, demoCard as CardInput);
		existingKeys.add(key);
		addedCount++;
	}

	const demoStateRef = ref(database, `users/${userId}/meta/demoDeckLoaded`);
	await set(demoStateRef, true);

	return addedCount;
}

type CardInput =
	| Omit<SimpleCard, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">
	| Omit<Card, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">;

export async function addCard(userId: string, deckId: string, card: CardInput): Promise<Card> {
	if (!database) throw new Error("Firebase not initialized");

	const cardId = `card_${Date.now()}`;
	const now = Date.now();

	const newCard: Card = {
		...(card as Record<string, unknown>),
		id: cardId,
		userId,
		deckId,
		createdAt: now,
		updatedAt: now,
	} as Card;

	const cardRef = ref(database, `users/${userId}/cards/${cardId}`);
	await set(cardRef, newCard);

	// Update deck card count
	const deckRef = ref(database, `users/${userId}/decks/${deckId}`);
	const deckSnapshot = await get(deckRef);
	if (deckSnapshot.exists()) {
		const deck = deckSnapshot.val();
		await update(deckRef, { cardCount: (deck.cardCount || 0) + 1 });
	}

	return newCard;
}

export async function getCardsByDeckId(userId: string, deckId: string): Promise<Card[]> {
	if (!database) throw new Error("Firebase not initialized");

	const cardsQuery = query(ref(database, `users/${userId}/cards`), orderByChild("deckId"), equalTo(deckId));
	const snapshot = await get(cardsQuery);

	if (!snapshot.exists()) return [];

	const allCards = snapshot.val() as Record<string, Card>;
	return Object.values(allCards);
}

export function subscribeToCards(userId: string, deckId: string, callback: (cards: Card[]) => void) {
	if (!database) {
		console.error("Firebase not initialized");
		return () => {};
	}

	const cardsQuery = query(ref(database, `users/${userId}/cards`), orderByChild("deckId"), equalTo(deckId));
	const unsubscribe = onValue(cardsQuery, (snapshot) => {
		if (!snapshot.exists()) {
			callback([]);
			return;
		}

		const allCards = snapshot.val() as Record<string, Card>;
		callback(Object.values(allCards));
	});

	return unsubscribe;
}

export async function deleteCard(userId: string, cardId: string, deckId: string): Promise<void> {
	if (!database) throw new Error("Firebase not initialized");

	const cardRef = ref(database, `users/${userId}/cards/${cardId}`);
	await remove(cardRef);

	// Update deck card count
	const deckRef = ref(database, `users/${userId}/decks/${deckId}`);
	const deckSnapshot = await get(deckRef);
	if (deckSnapshot.exists()) {
		const deck = deckSnapshot.val();
		await update(deckRef, { cardCount: Math.max(0, (deck.cardCount || 1) - 1) });
	}
}

export async function updateCard(userId: string, cardId: string, updates: Partial<Card>): Promise<void> {
	if (!database) throw new Error("Firebase not initialized");

	const cardRef = ref(database, `users/${userId}/cards/${cardId}`);
	await update(cardRef, {
		...updates,
		updatedAt: Date.now(),
	});
}
