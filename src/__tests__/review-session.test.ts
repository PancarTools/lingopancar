import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getNextReviewStep,
	getReviewCardUpdates,
	getReviewQuality,
	REVIEW_QUALITY,
	type ReviewFeedback,
} from "../lib/review-session";
import type { Card } from "../lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

function buildCard(overrides: Partial<Card> = {}): Card {
	const now = Date.now();
	return {
		id: "card-1",
		userId: "user-1",
		deckId: "deck-1",
		type: "detailed",
		prefix: "der",
		main: "Test",
		suffix: "",
		meaning: "test",
		description: "test card",
		examples: [],
		createdAt: now,
		updatedAt: now,
		reviewCount: 4,
		proficiency: 2,
		easeFactor: 2.5,
		...overrides,
	};
}

describe("review-session", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-03-26T20:00:00.000Z"));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("getReviewQuality", () => {
		it("maps each feedback to the expected quality score", () => {
			expect(getReviewQuality("again")).toBe(REVIEW_QUALITY.AGAIN);
			expect(getReviewQuality("meh")).toBe(REVIEW_QUALITY.MEH);
			expect(getReviewQuality("yay")).toBe(REVIEW_QUALITY.YAY);
		});
	});

	describe("getReviewCardUpdates", () => {
		it.each([
			["again", 1, 3],
			["meh", 2, 7],
			["yay", 3, 14],
		] as const)(
			"produces deterministic scheduling fields for %s feedback",
			(feedback: ReviewFeedback, expectedProficiency: number, expectedInterval: number) => {
				const card = buildCard();
				const now = Date.now();

				const updates = getReviewCardUpdates(card, feedback);

				expect(updates.proficiency).toBe(expectedProficiency);
				expect(updates.interval).toBe(expectedInterval);
				expect(updates.reviewCount).toBe(5);
				expect(updates.lastReviewedAt).toBe(now);
				expect(updates.updatedAt).toBe(now);
				expect(updates.nextReviewAt).toBe(now + expectedInterval * DAY_MS);
				expect(updates.easeFactor).toBeGreaterThanOrEqual(1.3);
				expect(updates.easeFactor).toBeLessThanOrEqual(2.5);
			},
		);
	});

	describe("getNextReviewStep", () => {
		it("advances to next index before the last card", () => {
			expect(getNextReviewStep(2, 5)).toEqual({
				nextIndex: 3,
				shouldExit: false,
			});
		});

		it("exits when current card is the last card", () => {
			expect(getNextReviewStep(4, 5)).toEqual({
				nextIndex: 4,
				shouldExit: true,
			});
		});

		it("returns exit for empty sessions", () => {
			expect(getNextReviewStep(0, 0)).toEqual({
				nextIndex: 0,
				shouldExit: true,
			});
		});
	});
});
