import { describe, it, expect } from "vitest";
import {
	calculateNextInterval,
	updateCardAfterReview,
	getCardsForReview,
	getTopReviewCards,
	sortCardsByReviewPriority,
	getDeckStats,
	initializeCardForSpacedRepetition,
} from "../lib/spaced-repetition";
import type { Card } from "../lib/types";
import { mockCards } from "./mock-cards";

describe("Spaced Repetition System", () => {
	describe("calculateNextInterval", () => {
		it("should return 1 day for new cards (proficiency 0)", () => {
			const interval = calculateNextInterval(0, 1);
			expect(interval).toBe(1);
		});

		it("should return 3 days for learning cards (proficiency 1)", () => {
			const interval = calculateNextInterval(1, 1);
			expect(interval).toBe(3);
		});

		it("should return 7 days for familiar cards (proficiency 2)", () => {
			const interval = calculateNextInterval(2, 1);
			expect(interval).toBe(7);
		});

		it("should return 14 days for proficient cards (proficiency 3)", () => {
			const interval = calculateNextInterval(3, 1);
			expect(interval).toBe(14);
		});

		it("should return 30 days for mastered cards (proficiency 4)", () => {
			const interval = calculateNextInterval(4, 1);
			expect(interval).toBe(30);
		});

		it("should return 90 days for expert cards (proficiency 5)", () => {
			const interval = calculateNextInterval(5, 1);
			expect(interval).toBe(90);
		});
	});

	describe("updateCardAfterReview", () => {
		it("should increase proficiency on perfect recall (quality 5)", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				type: "detailed",
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
				proficiency: 0,
				easeFactor: 2.0, // Start below max
			};

			const updated = updateCardAfterReview(card, 5);

			expect(updated.proficiency).toBe(1); // 0 -> 1
			expect(updated.reviewCount).toBe(1);
			expect(updated.nextReviewAt).toBeDefined();
			expect(updated.easeFactor).toBeGreaterThan(2.0); // Increased from 2.0
			expect(updated.easeFactor).toBeLessThanOrEqual(2.5); // Capped at max
		});

		it("should reset proficiency on poor recall (quality 0)", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				type: "detailed",
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 3,
				proficiency: 3,
				easeFactor: 2.5,
			};

			const updated = updateCardAfterReview(card, 0);

			expect(updated.proficiency).toBe(1); // Reset to learning
			expect(updated.reviewCount).toBe(4);
			expect(updated.easeFactor).toBeLessThan(2.5);
		});

		it("should maintain proficiency on partial recall (quality 2-3)", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				type: "detailed",
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 2,
				proficiency: 2,
				easeFactor: 2.5,
			};

			const updated = updateCardAfterReview(card, 2);

			expect(updated.proficiency).toBe(2); // Maintain
			expect(updated.reviewCount).toBe(3);
		});

		it("should calculate correct nextReviewAt timestamp", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				type: "detailed",
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
				proficiency: 0,
			};

			const now = Date.now();
			const updated = updateCardAfterReview(card, 5);

			expect(updated.nextReviewAt).toBeGreaterThan(now);
			// Should be approximately 3 days from now (proficiency 1 = 3 days)
			const expectedTime = now + 3 * 24 * 60 * 60 * 1000;
			const diff = Math.abs((updated.nextReviewAt || 0) - expectedTime);
			expect(diff).toBeLessThan(1000); // Within 1 second
		});
	});

	describe("getCardsForReview", () => {
		it("should return cards that are due for review", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Test1",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					nextReviewAt: now - 1000, // Overdue
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Test2",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					nextReviewAt: now + 86400000, // Tomorrow
				},
			];

			const dueCards = getCardsForReview(cards);

			expect(dueCards).toHaveLength(1);
			expect(dueCards[0].id).toBe("card1");
		});

		it("should include new cards (no nextReviewAt)", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Test",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now - 86400000, // Created yesterday
					updatedAt: now - 86400000,
					reviewCount: 0,
					// No nextReviewAt - should use createdAt
				},
			];

			const dueCards = getCardsForReview(cards);

			expect(dueCards).toHaveLength(1);
		});
	});

	describe("getTopReviewCards", () => {
		it("should return top cards ordered by nextReviewAt ascending", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Late",
					suffix: "",
					meaning: "late",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					nextReviewAt: now + 5000,
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Soon",
					suffix: "",
					meaning: "soon",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					nextReviewAt: now + 1000,
				},
				{
					id: "card3",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Now",
					suffix: "",
					meaning: "now",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					nextReviewAt: now,
				},
			];

			const top = getTopReviewCards(cards, 2);

			expect(top).toHaveLength(2);
			expect(top[0].id).toBe("card3");
			expect(top[1].id).toBe("card2");
		});

		it("should use createdAt fallback when nextReviewAt is missing", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Older",
					suffix: "",
					meaning: "older",
					description: "test",
					examples: [],
					createdAt: now - 10000,
					updatedAt: now,
					reviewCount: 0,
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Newer",
					suffix: "",
					meaning: "newer",
					description: "test",
					examples: [],
					createdAt: now - 1000,
					updatedAt: now,
					reviewCount: 0,
				},
			];

			const top = getTopReviewCards(cards, 1);

			expect(top).toHaveLength(1);
			expect(top[0].id).toBe("card1");
		});
	});

	describe("sortCardsByReviewPriority", () => {
		it("should prioritize overdue cards first", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Overdue",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 1,
					nextReviewAt: now - 86400000, // 1 day overdue
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "New",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					proficiency: 0,
				},
			];

			const sorted = sortCardsByReviewPriority(cards);

			expect(sorted[0].id).toBe("card1"); // Overdue first
			expect(sorted[1].id).toBe("card2"); // New second
		});

		it("should prioritize new cards before future reviews", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Future",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 1,
					nextReviewAt: now + 86400000 * 7, // 7 days away
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "New",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					proficiency: 0,
				},
			];

			const sorted = sortCardsByReviewPriority(cards);

			expect(sorted[0].id).toBe("card2"); // New first
			expect(sorted[1].id).toBe("card1"); // Future second
		});
	});

	describe("getDeckStats", () => {
		it("should calculate correct deck statistics", () => {
			const now = Date.now();
			const cards: Card[] = [
				{
					id: "card1",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "New",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 0,
					proficiency: 0,
				},
				{
					id: "card2",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Learning",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 1,
					proficiency: 1,
				},
				{
					id: "card3",
					userId: "user123",
					deckId: "deck1",
					type: "detailed",
					prefix: "der",
					main: "Mastered",
					suffix: "",
					meaning: "test",
					description: "test",
					examples: [],
					createdAt: now,
					updatedAt: now,
					reviewCount: 5,
					proficiency: 4,
				},
			];

			const stats = getDeckStats(cards);

			expect(stats.total).toBe(3);
			expect(stats.new).toBe(1);
			expect(stats.learning).toBe(1);
			expect(stats.mastered).toBe(1);
			expect(stats.totalReviews).toBe(6); // 0 + 1 + 5
		});
	});

	describe("initializeCardForSpacedRepetition", () => {
		it("should initialize new card with spaced repetition defaults", () => {
			const baseCard = {
				id: "card1",
				userId: "user123",
				deckId: "card1",
				type: "detailed" as const,
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			const initialized = initializeCardForSpacedRepetition(baseCard);

			expect(initialized.proficiency).toBe(0);
			expect(initialized.nextReviewAt).toBeDefined();
			expect(initialized.interval).toBe(0);
			expect(initialized.easeFactor).toBe(2.5);
		});
	});

	describe("10-Card Review Session with Spaced Repetition", () => {
		it("should handle marking 10 cards with proficiency progression", () => {
			const firstBatch = mockCards.slice(0, 10);

			// Initialize cards with spaced repetition (reset reviewCount to 0)
			const initializedCards = firstBatch.map(
				(card) =>
					({
						...initializeCardForSpacedRepetition(card),
						reviewCount: 0, // Reset for this test
					}) as Card,
			);

			// Simulate marking cards with different quality scores
			const markedCards = initializedCards.map((card, index) => {
				let quality = 5; // Default: perfect recall
				if (index === 1) quality = 0; // Card 2: complete failure
				if (index === 3) quality = 2; // Card 4: partial recall

				return {
					...card,
					...updateCardAfterReview(card, quality),
				};
			});

			// Verify proficiency progression
			expect(markedCards[0].proficiency).toBe(1); // Perfect recall: 0 -> 1
			expect(markedCards[1].proficiency).toBe(1); // Failure: 0 -> 1 (reset)
			expect(markedCards[3].proficiency).toBe(0); // Partial: 0 -> 0 (maintain)

			// Verify review counts incremented by 1
			expect(markedCards[0].reviewCount).toBe(1);
			expect(markedCards[1].reviewCount).toBe(1);

			// Verify nextReviewAt is set
			markedCards.forEach((card) => {
				expect(card.nextReviewAt).toBeDefined();
				expect(card.nextReviewAt).toBeGreaterThan(0);
			});
		});

		it("should filter cards for next review session correctly", () => {
			const firstBatch = mockCards.slice(0, 10);

			// Initialize and mark cards
			let cards = firstBatch.map((card) => initializeCardForSpacedRepetition(card));

			// Mark 8 cards with perfect recall
			cards = cards.map((card, index) => {
				if (index < 8) {
					return {
						...card,
						...updateCardAfterReview(card, 5),
					};
				}
				return card;
			});

			// 2 cards remain unreviewed (proficiency 0)
			const unreviewed = cards.filter((c) => (c.proficiency ?? 0) === 0);
			expect(unreviewed).toHaveLength(2);

			// Get cards due for review (should be the 2 unreviewed + any overdue)
			const dueCards = getCardsForReview(cards);
			expect(dueCards.length).toBeGreaterThanOrEqual(2);

			// Get second batch (10 new cards)
			const secondBatch = mockCards.slice(10, 20);
			const newCards = secondBatch.map((card) => ({
				...initializeCardForSpacedRepetition(card),
				type: "detailed",
			}));

			// Combine: 2 unreviewed from first batch + 10 new from second batch
			const nextSession = [...unreviewed, ...newCards];
			expect(nextSession).toHaveLength(12);
		});
	});

	describe("Cumulative Review Progression", () => {
		it("should track proficiency progression across multiple reviews", () => {
			let card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				type: "detailed",
				prefix: "der",
				main: "Test",
				suffix: "",
				meaning: "test",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
				proficiency: 0,
			};

			// Review 1: Perfect recall
			card = {
				...card,
				...updateCardAfterReview(card, 5),
			};
			expect(card.proficiency).toBe(1);
			expect(card.reviewCount).toBe(1);

			// Review 2: Perfect recall
			card = {
				...card,
				...updateCardAfterReview(card, 5),
			};
			expect(card.proficiency).toBe(2);
			expect(card.reviewCount).toBe(2);

			// Review 3: Perfect recall
			card = {
				...card,
				...updateCardAfterReview(card, 5),
			};
			expect(card.proficiency).toBe(3);
			expect(card.reviewCount).toBe(3);

			// Review 4: Failure - reset to learning
			card = {
				...card,
				...updateCardAfterReview(card, 0),
			};
			expect(card.proficiency).toBe(1);
			expect(card.reviewCount).toBe(4);

			// Review 5: Perfect recall - progress again
			card = {
				...card,
				...updateCardAfterReview(card, 5),
			};
			expect(card.proficiency).toBe(2);
			expect(card.reviewCount).toBe(5);
		});
	});
});
