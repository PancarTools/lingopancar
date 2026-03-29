import { updateCardAfterReview } from "@/lib/spaced-repetition";
import type { Card } from "@/lib/types";

export const REVIEW_QUALITY = {
	AGAIN: 1,
	MEH: 2,
	YAY: 4,
} as const;

export type ReviewFeedback = "again" | "meh" | "yay";

const FEEDBACK_TO_QUALITY: Record<ReviewFeedback, number> = {
	again: REVIEW_QUALITY.AGAIN,
	meh: REVIEW_QUALITY.MEH,
	yay: REVIEW_QUALITY.YAY,
};

export function getReviewQuality(feedback: ReviewFeedback): number {
	return FEEDBACK_TO_QUALITY[feedback];
}

export function getReviewCardUpdates(card: Card, feedback: ReviewFeedback): Partial<Card> {
	return updateCardAfterReview(card, getReviewQuality(feedback));
}

export function getNextReviewStep(currentIndex: number, totalCards: number): {
	nextIndex: number;
	shouldExit: boolean;
} {
	if (totalCards <= 0) {
		return { nextIndex: 0, shouldExit: true };
	}

	const isLastCard = currentIndex >= totalCards - 1;
	if (isLastCard) {
		return { nextIndex: totalCards - 1, shouldExit: true };
	}

	return {
		nextIndex: currentIndex + 1,
		shouldExit: false,
	};
}
