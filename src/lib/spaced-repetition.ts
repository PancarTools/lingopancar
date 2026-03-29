import type { Card } from "./types";

/**
 * Spaced Repetition Algorithm based on SM-2
 * Proficiency levels: 0=new, 1=learning, 2=familiar, 3=proficient, 4=mastered, 5=expert
 */

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 2.5;

/**
 * Calculate next review interval based on proficiency and ease factor
 * Returns days until next review
 */
export function calculateNextInterval(
	proficiency: number,
	reviewCount: number,
	easeFactor: number = DEFAULT_EASE_FACTOR,
): number {
	if (proficiency === 0) return 1; // New card: review tomorrow
	if (proficiency === 1) return 3; // Learning: 3 days
	if (proficiency === 2) return 7; // Familiar: 1 week
	if (proficiency === 3) return 14; // Proficient: 2 weeks
	if (proficiency === 4) return 30; // Mastered: 1 month
	if (proficiency === 5) return 90; // Expert: 3 months

	// Fallback: use exponential growth
	return Math.ceil(Math.pow(easeFactor, reviewCount));
}

/**
 * Update card proficiency and scheduling based on review quality
 * quality: 0-5 where 5 is perfect recall, 0 is complete failure
 */
export function updateCardAfterReview(card: Card, quality: number): Partial<Card> {
	const currentProficiency = card.proficiency ?? 0;
	const currentEaseFactor = card.easeFactor ?? DEFAULT_EASE_FACTOR;

	// Validate quality
	const validQuality = Math.max(0, Math.min(5, quality));

	// Calculate new ease factor (SM-2 algorithm)
	const newEaseFactor = Math.max(
		MIN_EASE_FACTOR,
		Math.min(MAX_EASE_FACTOR, currentEaseFactor + 0.1 - (5 - validQuality) * (0.08 + (5 - validQuality) * 0.02)),
	);

	// Determine new proficiency based on quality
	let newProficiency = currentProficiency;
	if (validQuality >= 4) {
		// Good recall - increase proficiency
		newProficiency = Math.min(5, currentProficiency + 1);
	} else if (validQuality >= 2) {
		// Partial recall - maintain proficiency
		newProficiency = currentProficiency;
	} else {
		// Poor recall - reset to learning
		newProficiency = 1;
	}

	// Calculate next interval
	const newInterval = calculateNextInterval(newProficiency, (card.reviewCount || 0) + 1, newEaseFactor);
	const now = Date.now();
	const nextReviewAt = now + newInterval * 24 * 60 * 60 * 1000; // Convert days to milliseconds

	return {
		proficiency: newProficiency,
		easeFactor: newEaseFactor,
		interval: newInterval,
		nextReviewAt,
		reviewCount: (card.reviewCount || 0) + 1,
		lastReviewedAt: now,
		updatedAt: now,
	};
}

/**
 * Get cards that are due for review (nextReviewAt <= now)
 */
export function getCardsForReview(cards: Card[]): Card[] {
	const now = Date.now();
	return cards.filter((card) => {
		const nextReviewAt = card.nextReviewAt ?? card.createdAt;
		return nextReviewAt <= now;
	});
}

export function getTopReviewCards(cards: Card[], limit: number = 10): Card[] {
	return [...cards]
		.sort((a, b) => {
			const aReviewAt = a.nextReviewAt ?? a.createdAt;
			const bReviewAt = b.nextReviewAt ?? b.createdAt;
			return aReviewAt - bReviewAt;
		})
		.slice(0, limit);
}

/**
 * Get cards sorted by review priority
 * Priority: overdue > due today > new cards > future reviews
 */
export function sortCardsByReviewPriority(cards: Card[]): Card[] {
	const now = Date.now();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const tomorrowStart = today.getTime() + 24 * 60 * 60 * 1000;

	return [...cards].sort((a, b) => {
		const aNextReview = a.nextReviewAt ?? a.createdAt;
		const bNextReview = b.nextReviewAt ?? b.createdAt;

		// Overdue cards first (nextReviewAt < today)
		const aIsOverdue = aNextReview < today.getTime();
		const bIsOverdue = bNextReview < today.getTime();
		if (aIsOverdue && !bIsOverdue) return -1;
		if (!aIsOverdue && bIsOverdue) return 1;

		// Then due today (today <= nextReviewAt < tomorrow)
		const aIsDueToday = aNextReview >= today.getTime() && aNextReview < tomorrowStart;
		const bIsDueToday = bNextReview >= today.getTime() && bNextReview < tomorrowStart;
		if (aIsDueToday && !bIsDueToday) return -1;
		if (!aIsDueToday && bIsDueToday) return 1;

		// Then new cards (proficiency 0)
		const aIsNew = (a.proficiency ?? 0) === 0;
		const bIsNew = (b.proficiency ?? 0) === 0;
		if (aIsNew && !bIsNew) return -1;
		if (!aIsNew && bIsNew) return 1;

		// Finally by next review date
		return aNextReview - bNextReview;
	});
}

/**
 * Get statistics for a deck
 */
export function getDeckStats(cards: Card[]) {
	const now = Date.now();
	const today = new Date(now);
	today.setHours(0, 0, 0, 0);
	const tomorrowStart = today.getTime() + 24 * 60 * 60 * 1000;

	const stats = {
		total: cards.length,
		new: 0,
		learning: 0,
		familiar: 0,
		proficient: 0,
		mastered: 0,
		expert: 0,
		overdue: 0,
		dueToday: 0,
		dueTomorrow: 0,
		totalReviews: 0,
	};

	cards.forEach((card) => {
		const proficiency = card.proficiency ?? 0;
		const nextReviewAt = card.nextReviewAt ?? card.createdAt;

		// Count by proficiency
		if (proficiency === 0) stats.new++;
		else if (proficiency === 1) stats.learning++;
		else if (proficiency === 2) stats.familiar++;
		else if (proficiency === 3) stats.proficient++;
		else if (proficiency === 4) stats.mastered++;
		else if (proficiency === 5) stats.expert++;

		// Count by review schedule
		if (nextReviewAt < today.getTime()) stats.overdue++;
		else if (nextReviewAt < tomorrowStart) stats.dueToday++;
		else if (nextReviewAt < tomorrowStart + 24 * 60 * 60 * 1000) stats.dueTomorrow++;

		// Total reviews
		stats.totalReviews += card.reviewCount || 0;
	});

	return stats;
}

/**
 * Initialize a new card with spaced repetition defaults
 */
export function initializeCardForSpacedRepetition(
	card: Omit<Card, "proficiency" | "nextReviewAt" | "interval" | "easeFactor">,
): Card {
	return {
		...card,
		proficiency: 0, // New card
		nextReviewAt: Date.now(), // Available for review immediately
		interval: 0,
		easeFactor: DEFAULT_EASE_FACTOR,
	};
}
