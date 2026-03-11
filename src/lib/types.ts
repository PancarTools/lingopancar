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
}

export interface Deck {
	id: string;
	userId: string;
	name: string;
	createdAt: number;
	cardCount: number;
}
