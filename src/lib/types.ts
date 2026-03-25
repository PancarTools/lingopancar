export interface Example {
	sentence: string;
	translation?: string;
}

export interface Card {
	id: string;
	userId: string;
	deckId: string;
	prefix: string;
	main: string;
	suffix: string;
	meaning: string;
	description: string;
	examples: Example[];
	createdAt: number;
	updatedAt: number;
	lastReviewedAt?: number;
	reviewCount: number;
	proficiency?: number; // 0-5: 0=new, 1=learning, 2=familiar, 3=proficient, 4=mastered, 5=expert
	nextReviewAt?: number; // timestamp when card should next appear
	interval?: number; // days until next review
	easeFactor?: number; // difficulty multiplier (1.3-2.5)
}

export interface Deck {
	id: string;
	userId: string;
	name: string;
	createdAt: number;
	cardCount: number;
}
