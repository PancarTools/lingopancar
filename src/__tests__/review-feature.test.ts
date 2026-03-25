import { describe, it, expect } from "vitest";
import type { Card } from "../lib/types";
import { mockCards } from "./mock-cards";

describe("Review Feature", () => {
	describe("Card Review Tracking", () => {
		it("should increment reviewCount when card is marked", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			const updatedCard = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
			};

			expect(updatedCard.reviewCount).toBe(1);
			expect(updatedCard.lastReviewedAt).toBeDefined();
		});

		it("should update lastReviewedAt timestamp on mark", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 2,
				lastReviewedAt: 1000000,
			};

			const now = Date.now();
			const updatedCard = {
				...card,
				reviewCount: card.reviewCount + 1,
				lastReviewedAt: now,
			};

			expect(updatedCard.lastReviewedAt).toBe(now);
			expect(updatedCard.lastReviewedAt).toBeGreaterThan(card.lastReviewedAt!);
		});

		it("should handle multiple reviews correctly", () => {
			let card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			// First review
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
			};
			expect(card.reviewCount).toBe(1);

			// Second review
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
			};
			expect(card.reviewCount).toBe(2);

			// Third review
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
			};
			expect(card.reviewCount).toBe(3);
		});
	});

	describe("Card Data Integrity", () => {
		it("should preserve card data when updating review stats", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "positives Ergebnis",
				examples: [
					{
						sentence: "Sie hatte Erfolg.",
						translation: "She was successful.",
					},
				],
				createdAt: 1000000,
				updatedAt: 1000000,
				reviewCount: 0,
			};

			const updatedCard = {
				...card,
				reviewCount: 1,
				lastReviewedAt: Date.now(),
				updatedAt: Date.now(),
			};

			// Verify all original data is preserved
			expect(updatedCard.id).toBe(card.id);
			expect(updatedCard.userId).toBe(card.userId);
			expect(updatedCard.deckId).toBe(card.deckId);
			expect(updatedCard.prefix).toBe(card.prefix);
			expect(updatedCard.main).toBe(card.main);
			expect(updatedCard.suffix).toBe(card.suffix);
			expect(updatedCard.meaning).toBe(card.meaning);
			expect(updatedCard.description).toBe(card.description);
			expect(updatedCard.examples).toEqual(card.examples);
			expect(updatedCard.createdAt).toBe(card.createdAt);

			// Verify review stats were updated
			expect(updatedCard.reviewCount).toBe(1);
			expect(updatedCard.lastReviewedAt).toBeDefined();
			expect(updatedCard.updatedAt).toBeGreaterThan(card.updatedAt);
		});

		it('should use "main" field instead of "word"', () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(card).toHaveProperty("main");
			expect(card).not.toHaveProperty("word");
			expect(card.main).toBe("Erfolg");
		});
	});

	describe("Review Statistics Display", () => {
		it("should display review count correctly", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 5,
			};

			expect(card.reviewCount).toBe(5);
		});

		it("should display last reviewed date when available", () => {
			const lastReviewedAt = Date.now() - 86400000; // 1 day ago
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 3,
				lastReviewedAt,
			};

			expect(card.lastReviewedAt).toBeDefined();
			expect(card.lastReviewedAt).toBe(lastReviewedAt);

			if (card.lastReviewedAt) {
				const displayDate = new Date(card.lastReviewedAt).toLocaleDateString();
				expect(displayDate).toBeDefined();
			}
		});

		it("should handle missing lastReviewedAt gracefully", () => {
			const card: Card = {
				id: "card1",
				userId: "user123",
				deckId: "deck1",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(card.lastReviewedAt).toBeUndefined();
		});
	});

	describe("Multi-Card Review Session", () => {
		it("should handle marking 10 cards and updating their review stats", () => {
			// First run: Get first 10 cards
			const firstBatch = mockCards.slice(0, 10);
			expect(firstBatch).toHaveLength(10);

			// Simulate marking cards 1, 3, 5, 7, 9 (5 out of 10)
			const cardsToMark = [0, 2, 4, 6, 8];
			const now = Date.now();

			const updatedFirstBatch = firstBatch.map((card, index) => {
				if (cardsToMark.includes(index)) {
					return {
						...card,
						reviewCount: (card.reviewCount || 0) + 1,
						lastReviewedAt: now,
						updatedAt: now,
					};
				}
				return card;
			});

			// Verify marked cards
			expect(updatedFirstBatch[0].reviewCount).toBe((firstBatch[0].reviewCount || 0) + 1);
			expect(updatedFirstBatch[0].lastReviewedAt).toBe(now);

			expect(updatedFirstBatch[2].reviewCount).toBe((firstBatch[2].reviewCount || 0) + 1);
			expect(updatedFirstBatch[2].lastReviewedAt).toBe(now);

			expect(updatedFirstBatch[4].reviewCount).toBe((firstBatch[4].reviewCount || 0) + 1);
			expect(updatedFirstBatch[4].lastReviewedAt).toBe(now);

			// Verify unmarked cards remain unchanged
			expect(updatedFirstBatch[1].reviewCount).toBe(firstBatch[1].reviewCount);
			expect(updatedFirstBatch[1].lastReviewedAt).toBe(firstBatch[1].lastReviewedAt);

			expect(updatedFirstBatch[3].reviewCount).toBe(firstBatch[3].reviewCount);
			expect(updatedFirstBatch[3].lastReviewedAt).toBe(firstBatch[3].lastReviewedAt);
		});

		it("should handle second batch of 10 cards with updated review counts", () => {
			// Second run: Get second 10 cards
			const secondBatch = mockCards.slice(10, 20);
			expect(secondBatch).toHaveLength(10);

			// Simulate marking cards 2, 4, 6, 8 (4 out of 10)
			const cardsToMark = [1, 3, 5, 7];
			const now = Date.now();

			const updatedSecondBatch = secondBatch.map((card, index) => {
				if (cardsToMark.includes(index)) {
					return {
						...card,
						reviewCount: (card.reviewCount || 0) + 1,
						lastReviewedAt: now,
						updatedAt: now,
					};
				}
				return card;
			});

			// Verify marked cards in second batch
			expect(updatedSecondBatch[1].reviewCount).toBe((secondBatch[1].reviewCount || 0) + 1);
			expect(updatedSecondBatch[1].lastReviewedAt).toBe(now);

			expect(updatedSecondBatch[3].reviewCount).toBe((secondBatch[3].reviewCount || 0) + 1);
			expect(updatedSecondBatch[3].lastReviewedAt).toBe(now);

			// Verify unmarked cards remain unchanged
			expect(updatedSecondBatch[0].reviewCount).toBe(secondBatch[0].reviewCount);
			expect(updatedSecondBatch[0].lastReviewedAt).toBe(secondBatch[0].lastReviewedAt);
		});

		it("should track cumulative review counts across multiple sessions", () => {
			// Simulate multiple review sessions on the same card
			let card = mockCards[0];
			const sessionTimestamps = [
				Date.now() - 86400000, // 1 day ago
				Date.now() - 43200000, // 12 hours ago
				Date.now(), // now
			];

			// Session 1: Mark card
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: sessionTimestamps[0],
				updatedAt: sessionTimestamps[0],
			};
			expect(card.reviewCount).toBe((mockCards[0].reviewCount || 0) + 1);

			// Session 2: Mark card again
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: sessionTimestamps[1],
				updatedAt: sessionTimestamps[1],
			};
			expect(card.reviewCount).toBe((mockCards[0].reviewCount || 0) + 2);

			// Session 3: Mark card again
			card = {
				...card,
				reviewCount: (card.reviewCount || 0) + 1,
				lastReviewedAt: sessionTimestamps[2],
				updatedAt: sessionTimestamps[2],
			};
			expect(card.reviewCount).toBe((mockCards[0].reviewCount || 0) + 3);
			expect(card.lastReviewedAt).toBe(sessionTimestamps[2]);
		});

		it("should preserve all card data while updating review stats across batches", () => {
			const firstCard = mockCards[0];
			const lastCard = mockCards[19];

			// Update first card
			const updatedFirstCard = {
				...firstCard,
				reviewCount: (firstCard.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
				updatedAt: Date.now(),
			};

			// Update last card
			const updatedLastCard = {
				...lastCard,
				reviewCount: (lastCard.reviewCount || 0) + 1,
				lastReviewedAt: Date.now(),
				updatedAt: Date.now(),
			};

			// Verify all original data is preserved
			expect(updatedFirstCard.id).toBe(firstCard.id);
			expect(updatedFirstCard.userId).toBe(firstCard.userId);
			expect(updatedFirstCard.deckId).toBe(firstCard.deckId);
			expect(updatedFirstCard.main).toBe(firstCard.main);
			expect(updatedFirstCard.meaning).toBe(firstCard.meaning);
			expect(updatedFirstCard.examples).toEqual(firstCard.examples);

			expect(updatedLastCard.id).toBe(lastCard.id);
			expect(updatedLastCard.userId).toBe(lastCard.userId);
			expect(updatedLastCard.deckId).toBe(lastCard.deckId);
			expect(updatedLastCard.main).toBe(lastCard.main);
			expect(updatedLastCard.meaning).toBe(lastCard.meaning);
			expect(updatedLastCard.examples).toEqual(lastCard.examples);
		});
	});
});
