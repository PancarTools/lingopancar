import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTopReviewCards } from "../lib/spaced-repetition";
import { getNextReviewStep, getReviewCardUpdates, type ReviewFeedback } from "../lib/review-session";
import type { Card } from "../lib/types";
import { mockCards } from "./mock-cards";

function createDeck(cardCount: number): Card[] {
	const baseCreatedAt = Date.now() - 24 * 60 * 60 * 1000;
	return Array.from({ length: cardCount }, (_, index) => {
		const baseCard = mockCards[index % mockCards.length];
		const createdAt = baseCreatedAt + index * 1000;
		return {
			...baseCard,
			id: `${baseCard.id}-seed-${index + 1}`,
			createdAt,
			updatedAt: createdAt,
			nextReviewAt: undefined,
			interval: undefined,
			proficiency: undefined,
			easeFactor: undefined,
			lastReviewedAt: undefined,
		};
	});
}

function applyCardUpdates(cards: Card[], cardId: string, updates: Partial<Card>): Card[] {
	return cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card));
}

function runDueSession(
	cards: Card[],
	feedbackPlan: ReviewFeedback[],
): {
	nextCards: Card[];
	reviewedIds: string[];
} {
	const selectedCards = getTopReviewCards(cards, 10);
	const reviewedIds: string[] = [];
	let nextCards = cards;
	let currentIndex = 0;

	while (true) {
		const currentCard = selectedCards[currentIndex];
		const feedback = feedbackPlan[currentIndex] ?? feedbackPlan[feedbackPlan.length - 1];
		const updates = getReviewCardUpdates(currentCard, feedback);
		nextCards = applyCardUpdates(nextCards, currentCard.id, updates);
		reviewedIds.push(currentCard.id);

		const { nextIndex, shouldExit } = getNextReviewStep(currentIndex, selectedCards.length);
		if (shouldExit) break;
		currentIndex = nextIndex;
	}

	return { nextCards, reviewedIds };
}

function summarizeDeckState(cards: Card[]) {
	const dueTop10 = getTopReviewCards(cards, 10).map((card) => ({
		id: card.id,
		interval: card.interval ?? null,
		nextReviewAt: card.nextReviewAt ?? card.createdAt,
		reviewCount: card.reviewCount,
	}));

	const byInterval = cards.reduce<Record<string, number>>((acc, card) => {
		const key = card.interval === undefined ? "unset" : String(card.interval);
		acc[key] = (acc[key] ?? 0) + 1;
		return acc;
	}, {});

	return {
		total: cards.length,
		dueTop10,
		byInterval,
	};
}

function logSessionState(label: string, reviewedIds: string[], cards: Card[]) {
	console.log(
		label,
		JSON.stringify(
			{
				reviewedIds,
				state: summarizeDeckState(cards),
			},
			null,
			2,
		),
	);
}

describe("Review integration sessions", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-26T20:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("reviews first 20 cards from a 43-card deck over two due sessions", () => {
		const initialDeck = createDeck(43);
		let cards = initialDeck;
		const baseReviewCounts = new Map(cards.map((card) => [card.id, card.reviewCount]));

		const session1 = runDueSession(cards, ["again", "meh", "yay"]);
		cards = session1.nextCards;

		expect(session1.reviewedIds).toHaveLength(10);
		expect(new Set(session1.reviewedIds).size).toBe(10);
		expect(session1.reviewedIds).toEqual(initialDeck.slice(0, 10).map((card) => card.id));

		const session2 = runDueSession(cards, ["yay", "meh", "again"]);
		cards = session2.nextCards;

		expect(session2.reviewedIds).toHaveLength(10);
		expect(new Set(session2.reviewedIds).size).toBe(10);
		expect(session2.reviewedIds).toEqual(initialDeck.slice(10, 20).map((card) => card.id));

		const reviewedIds = new Set([...session1.reviewedIds, ...session2.reviewedIds]);

		for (const card of cards) {
			const baseCount = baseReviewCounts.get(card.id) ?? 0;
			if (reviewedIds.has(card.id)) {
				expect(card.reviewCount).toBe(baseCount + 1);
				expect(card.lastReviewedAt).toBeDefined();
				expect(card.nextReviewAt).toBeDefined();
				expect(card.interval).toBeDefined();
				expect(card.proficiency).toBeDefined();
				expect(card.easeFactor).toBeDefined();
			} else {
				expect(card.reviewCount).toBe(baseCount);
				expect(card.lastReviewedAt).toBeUndefined();
				expect(card.nextReviewAt).toBeUndefined();
				expect(card.interval).toBeUndefined();
				expect(card.proficiency).toBeUndefined();
				expect(card.easeFactor).toBeUndefined();
			}
		}
	});

	it("continues with untouched cards before rescheduled cards in a 43-card deck", () => {
		const initialDeck = createDeck(43);
		const initialReviewCounts = new Map(initialDeck.map((card) => [card.id, card.reviewCount]));
		let cards = initialDeck;

		const session1 = runDueSession(cards, Array(10).fill("meh"));
		cards = session1.nextCards;

		const session2 = runDueSession(cards, Array(10).fill("yay"));
		cards = session2.nextCards;

		const session3Selection = getTopReviewCards(cards, 10).map((card) => card.id);

		expect(session3Selection).toEqual(initialDeck.slice(20, 30).map((card) => card.id));

		const session3 = runDueSession(cards, Array(10).fill("again"));
		cards = session3.nextCards;

		expect(session3.reviewedIds).toEqual(session3Selection);

		for (const card of cards.slice(0, 10)) {
			expect(card.reviewCount).toBe((initialReviewCounts.get(card.id) ?? 0) + 1);
		}
		for (const card of cards.slice(10, 20)) {
			expect(card.reviewCount).toBe((initialReviewCounts.get(card.id) ?? 0) + 1);
		}
		for (const card of cards.slice(20, 30)) {
			expect(card.reviewCount).toBe((initialReviewCounts.get(card.id) ?? 0) + 1);
		}
		for (const card of cards.slice(30)) {
			expect(card.reviewCount).toBe(initialReviewCounts.get(card.id));
		}
	});

	it("simulates complex mixed feedback on a 23-card deck across repeated sessions", () => {
		const initialDeck = createDeck(23);
		const initialReviewCounts = new Map(initialDeck.map((card) => [card.id, card.reviewCount]));
		const sessionHitCounts = new Map(initialDeck.map((card) => [card.id, 0]));
		let cards = initialDeck;

		const sessionPlans: ReviewFeedback[][] = [
			["meh", "again", "yay", "meh", "again", "yay", "meh", "again", "yay", "meh"],
			["again", "yay", "meh", "again", "yay", "meh", "again", "yay", "meh", "again"],
			["yay", "meh", "again", "again", "meh", "yay", "again", "meh", "yay", "again"],
			["again", "meh", "yay", "again", "yay", "meh", "again", "yay", "again", "meh"],
		];

		const sessionResults = [
			[
				"card1-seed-1",
				"card2-seed-2",
				"card3-seed-3",
				"card4-seed-4",
				"card5-seed-5",
				"card6-seed-6",
				"card7-seed-7",
				"card8-seed-8",
				"card9-seed-9",
				"card10-seed-10",
			],
			[
				"card11-seed-11",
				"card12-seed-12",
				"card13-seed-13",
				"card14-seed-14",
				"card15-seed-15",
				"card16-seed-16",
				"card17-seed-17",
				"card18-seed-18",
				"card19-seed-19",
				"card20-seed-20",
			],
			[
				"card1-seed-21",
				"card2-seed-22",
				"card3-seed-23",
				"card1-seed-1",
				"card4-seed-4",
				"card7-seed-7",
				"card10-seed-10",
				"card13-seed-13",
				"card16-seed-16",
				"card19-seed-19",
			],
			[
				"card4-seed-4",
				"card13-seed-13",
				"card2-seed-22",
				"card1-seed-1",
				"card2-seed-2",
				"card3-seed-3",
				"card5-seed-5",
				"card6-seed-6",
				"card7-seed-7",
				"card8-seed-8",
			],
		] as const;

		sessionPlans.forEach((feedbackPlan, index) => {
			const expectedSelection = sessionResults[index];
			const beforeSessionCardsById = new Map(cards.map((card) => [card.id, card]));
			const session = runDueSession(cards, feedbackPlan);
			cards = session.nextCards;
			const afterSessionCardsById = new Map(cards.map((card) => [card.id, card]));
			logSessionState(`[complex-23] after session ${index + 1}`, session.reviewedIds, cards);

			expect(session.reviewedIds).toHaveLength(10);
			expect(new Set(session.reviewedIds).size).toBe(10);
			expect(session.reviewedIds).toEqual(expectedSelection);

			const intervalsByProficiencyAndFeedback = new Map<number, Record<ReviewFeedback, number[]>>();

			session.reviewedIds.forEach((id, reviewIndex) => {
				const beforeCard = beforeSessionCardsById.get(id);
				const afterCard = afterSessionCardsById.get(id);
				expect(beforeCard).toBeDefined();
				expect(afterCard).toBeDefined();

				if (!beforeCard || !afterCard || afterCard.interval === undefined) {
					return;
				}

				const proficiencyBefore = beforeCard.proficiency ?? 0;
				const feedback = feedbackPlan[reviewIndex];

				if (!intervalsByProficiencyAndFeedback.has(proficiencyBefore)) {
					intervalsByProficiencyAndFeedback.set(proficiencyBefore, {
						again: [],
						meh: [],
						yay: [],
					});
				}

				intervalsByProficiencyAndFeedback.get(proficiencyBefore)?.[feedback].push(afterCard.interval);
			});

			for (const [proficiencyBefore, intervalsByFeedback] of intervalsByProficiencyAndFeedback) {
				const againIntervals = intervalsByFeedback.again;
				const mehIntervals = intervalsByFeedback.meh;
				const yayIntervals = intervalsByFeedback.yay;

				if (proficiencyBefore === 0) {
					if (mehIntervals.length > 0 && againIntervals.length > 0) {
						expect(Math.max(...mehIntervals)).toBeLessThanOrEqual(Math.min(...againIntervals));
					}
					if (mehIntervals.length > 0 && yayIntervals.length > 0) {
						expect(Math.max(...mehIntervals)).toBeLessThanOrEqual(Math.min(...yayIntervals));
					}
					if (againIntervals.length > 0 && yayIntervals.length > 0) {
						expect(Math.max(...againIntervals)).toBeLessThanOrEqual(Math.min(...yayIntervals));
						expect(Math.max(...yayIntervals)).toBeLessThanOrEqual(Math.min(...againIntervals));
					}
				} else {
					if (againIntervals.length > 0 && mehIntervals.length > 0) {
						expect(Math.max(...againIntervals)).toBeLessThanOrEqual(Math.min(...mehIntervals));
					}
					if (mehIntervals.length > 0 && yayIntervals.length > 0) {
						expect(Math.max(...mehIntervals)).toBeLessThanOrEqual(Math.min(...yayIntervals));
					}
					if (againIntervals.length > 0 && yayIntervals.length > 0) {
						expect(Math.max(...againIntervals)).toBeLessThanOrEqual(Math.min(...yayIntervals));
					}
				}
			}

			session.reviewedIds.forEach((id) => {
				sessionHitCounts.set(id, (sessionHitCounts.get(id) ?? 0) + 1);
			});

			for (const card of cards) {
				const expectedBase = initialReviewCounts.get(card.id) ?? 0;
				const expectedHits = sessionHitCounts.get(card.id) ?? 0;
				expect(card.reviewCount).toBe(expectedBase + expectedHits);
			}

			const expectedUnset = Math.max(23 - (index + 1) * 10, 0);
			const actualUnset = cards.filter((card) => card.interval === undefined).length;
			expect(actualUnset).toBe(expectedUnset);
		});
	});
});
