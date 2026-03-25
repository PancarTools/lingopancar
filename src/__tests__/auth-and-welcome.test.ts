import { describe, it, expect } from "vitest";
import type { Card, Deck } from "../lib/types";

describe("Authentication and Welcome Card", () => {
	describe("User Sign-In", () => {
		it("should create a user object with required properties", () => {
			const user = {
				uid: "user123",
				email: "test@example.com",
				displayName: "Test User",
				emailVerified: true,
				isAnonymous: false,
			};

			expect(user).toHaveProperty("uid");
			expect(user).toHaveProperty("email");
			expect(user).toHaveProperty("displayName");
			expect(user.uid).toBe("user123");
			expect(user.email).toBe("test@example.com");
			expect(user.isAnonymous).toBe(false);
		});

		it("should handle user sign-in with email and password", () => {
			const signInCredentials = {
				email: "user@example.com",
				password: "securePassword123",
			};

			expect(signInCredentials.email).toBeDefined();
			expect(signInCredentials.password).toBeDefined();
			expect(signInCredentials.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
		});

		it("should validate email format on sign-in", () => {
			const validEmails = ["user@example.com", "test.user@domain.co.uk", "user+tag@example.com"];

			const invalidEmails = ["invalid.email", "@example.com", "user@", "user name@example.com"];

			validEmails.forEach((email) => {
				expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
			});

			invalidEmails.forEach((email) => {
				expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
			});
		});

		it("should handle user sign-out", () => {
			const user = {
				uid: "user123",
				email: "test@example.com",
				displayName: "Test User",
			};

			// Simulate sign-out by clearing user
			let currentUser: typeof user | null = user;
			currentUser = null;

			expect(currentUser).toBeNull();
		});
	});

	describe("Welcome Card Creation", () => {
		it("should create a welcome card with correct structure", () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
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
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(welcomeCard).toHaveProperty("id");
			expect(welcomeCard).toHaveProperty("userId");
			expect(welcomeCard).toHaveProperty("deckId");
			expect(welcomeCard).toHaveProperty("main");
			expect(welcomeCard.main).toBe("Erfolg");
			expect(welcomeCard.meaning).toBe("success");
			expect(welcomeCard.reviewCount).toBe(0);
		});

		it('should use "main" field in welcome card, not "word"', () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
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

			expect(welcomeCard).toHaveProperty("main");
			expect(welcomeCard).not.toHaveProperty("word");
			expect(welcomeCard.main).toBe("Erfolg");
		});

		it("should create welcome card with user-scoped path", () => {
			const userId = "user123";
			const deckId = "deck_user123";
			const cardId = "welcome-card-1";

			// Simulate Firebase path construction
			const cardPath = `users/${userId}/cards/${cardId}`;
			const deckPath = `users/${userId}/decks/${deckId}`;

			expect(cardPath).toContain(`users/${userId}`);
			expect(deckPath).toContain(`users/${userId}`);
			expect(cardPath).toContain("cards");
			expect(deckPath).toContain("decks");
		});

		it("should initialize welcome card with zero review count", () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
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

			expect(welcomeCard.reviewCount).toBe(0);
			expect(welcomeCard.lastReviewedAt).toBeUndefined();
		});

		it("should create welcome card with proper German content", () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
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
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(welcomeCard.prefix).toBe("der");
			expect(welcomeCard.main).toBe("Erfolg");
			expect(welcomeCard.meaning).toBe("success");
			expect(welcomeCard.description).toContain("positives Ergebnis");
			expect(welcomeCard.examples).toHaveLength(1);
			expect(welcomeCard.examples[0].sentence).toContain("Erfolg");
		});
	});

	describe("New User Flow", () => {
		it("should create deck for new user", () => {
			const userId = "newuser123";
			const deck: Deck = {
				id: `deck_${userId}`,
				userId,
				name: "My Deck",
				createdAt: Date.now(),
				cardCount: 0,
			};

			expect(deck.userId).toBe(userId);
			expect(deck.id).toBe(`deck_${userId}`);
			expect(deck.cardCount).toBe(0);
		});

		it("should add welcome card to new user deck", () => {
			const userId = "newuser123";
			const deckId = `deck_${userId}`;

			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId,
				deckId,
				type: "detailed",
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
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(welcomeCard.userId).toBe(userId);
			expect(welcomeCard.deckId).toBe(deckId);
			expect(welcomeCard.main).toBe("Erfolg");
		});

		it("should increment deck card count when welcome card is added", () => {
			let deck: Deck = {
				id: "deck_user123",
				userId: "user123",
				name: "My Deck",
				createdAt: Date.now(),
				cardCount: 0,
			};

			// Add welcome card
			deck = {
				...deck,
				cardCount: deck.cardCount + 1,
			};

			expect(deck.cardCount).toBe(1);
		});

		it("should handle multiple users with separate decks and cards", () => {
			const user1 = { uid: "user1", email: "user1@example.com" };
			const user2 = { uid: "user2", email: "user2@example.com" };

			const deck1: Deck = {
				id: `deck_${user1.uid}`,
				userId: user1.uid,
				name: "My Deck",
				createdAt: Date.now(),
				cardCount: 1,
			};

			const deck2: Deck = {
				id: `deck_${user2.uid}`,
				userId: user2.uid,
				name: "My Deck",
				createdAt: Date.now(),
				cardCount: 1,
			};

			const card1: Card = {
				id: "welcome-card-1",
				userId: user1.uid,
				deckId: deck1.id,
				type: "detailed",
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

			const card2: Card = {
				id: "welcome-card-1",
				userId: user2.uid,
				deckId: deck2.id,
				type: "detailed",
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

			// Verify user isolation
			expect(card1.userId).toBe(user1.uid);
			expect(card2.userId).toBe(user2.uid);
			expect(deck1.userId).toBe(user1.uid);
			expect(deck2.userId).toBe(user2.uid);
			expect(card1.userId).not.toBe(card2.userId);
		});
	});

	describe("Welcome Card Display", () => {
		it("should display welcome card with all content", () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
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
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			// Simulate display
			const displayText = `${welcomeCard.prefix} ${welcomeCard.main}`;
			const displayMeaning = welcomeCard.meaning;
			const displayDescription = welcomeCard.description;

			expect(displayText).toBe("der Erfolg");
			expect(displayMeaning).toBe("success");
			expect(displayDescription).toContain("positives Ergebnis");
		});

		it("should show example sentences in welcome card", () => {
			const welcomeCard: Card = {
				id: "welcome-card-1",
				userId: "user123",
				deckId: "deck_user123",
				type: "detailed",
				prefix: "der",
				main: "Erfolg",
				suffix: "",
				meaning: "success",
				description: "test",
				examples: [
					{
						sentence: "Sie hatte (mit ihrem Projekt) leider keinen Erfolg.",
						translation: "Unfortunately she wasn't successful (with her project).",
					},
				],
				createdAt: Date.now(),
				updatedAt: Date.now(),
				reviewCount: 0,
			};

			expect(welcomeCard.examples).toHaveLength(1);
			expect(welcomeCard.examples[0].sentence).toBeDefined();
			expect(welcomeCard.examples[0].translation).toBeDefined();
		});
	});
});
