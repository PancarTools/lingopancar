import { auth, database } from './firebase';
import { ref, set, get, update, remove, onValue } from 'firebase/database';
import type { Card, Deck } from './types';

export async function createOrGetDeck(userId: string): Promise<Deck> {
	if (!database) throw new Error('Firebase not initialized');

	const deckId = `deck_${userId}`;
	const deckRef = ref(database, `decks/${deckId}`);
	const snapshot = await get(deckRef);

	if (snapshot.exists()) {
		return snapshot.val();
	}

	const newDeck: Deck = {
		id: deckId,
		userId,
		name: 'My Deck',
		createdAt: Date.now(),
		cardCount: 0,
	};

	await set(deckRef, newDeck);
	return newDeck;
}

export async function addCard(userId: string, deckId: string, card: Omit<Card, 'id' | 'userId' | 'deckId' | 'createdAt' | 'updatedAt'>): Promise<Card> {
	if (!database) throw new Error('Firebase not initialized');

	const cardId = `card_${Date.now()}`;
	const newCard: Card = {
		...card,
		id: cardId,
		userId,
		deckId,
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};

	const cardRef = ref(database, `cards/${cardId}`);
	await set(cardRef, newCard);

	// Update deck card count
	const deckRef = ref(database, `decks/${deckId}`);
	const deckSnapshot = await get(deckRef);
	if (deckSnapshot.exists()) {
		const deck = deckSnapshot.val();
		await update(deckRef, { cardCount: (deck.cardCount || 0) + 1 });
	}

	return newCard;
}

export async function getCardsByDeckId(deckId: string): Promise<Card[]> {
	if (!database) throw new Error('Firebase not initialized');

	const cardsRef = ref(database, 'cards');
	const snapshot = await get(cardsRef);

	if (!snapshot.exists()) return [];

	const allCards = snapshot.val() as Record<string, Card>;
	return Object.values(allCards).filter((card) => card.deckId === deckId);
}

export function subscribeToCards(deckId: string, callback: (cards: Card[]) => void) {
	if (!database) {
		console.error('Firebase not initialized');
		return () => {};
	}

	const cardsRef = ref(database, 'cards');
	const unsubscribe = onValue(cardsRef, (snapshot) => {
		if (!snapshot.exists()) {
			callback([]);
			return;
		}

		const allCards = snapshot.val() as Record<string, Card>;
		const deckCards = Object.values(allCards).filter((card) => card.deckId === deckId);
		callback(deckCards);
	});

	return unsubscribe;
}

export async function deleteCard(cardId: string, deckId: string): Promise<void> {
	if (!database) throw new Error('Firebase not initialized');

	const cardRef = ref(database, `cards/${cardId}`);
	await remove(cardRef);

	// Update deck card count
	const deckRef = ref(database, `decks/${deckId}`);
	const deckSnapshot = await get(deckRef);
	if (deckSnapshot.exists()) {
		const deck = deckSnapshot.val();
		await update(deckRef, { cardCount: Math.max(0, (deck.cardCount || 1) - 1) });
	}
}

export async function updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
	if (!database) throw new Error('Firebase not initialized');

	const cardRef = ref(database, `cards/${cardId}`);
	await update(cardRef, {
		...updates,
		updatedAt: Date.now(),
	});
}
