"use client";

import type { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CardListProps {
	cards: Card[];
	onCardDeleted: (id: string) => void;
}

export default function CardList({ cards, onCardDeleted }: CardListProps) {
	if (cards.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-secondary dark:text-secondary text-lg font-light">
					No cards yet. Create one to get started!
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-3 sm:gap-4">
			{cards.map((card) => (
				<div
					key={card.id}
					className="bg-light dark:bg-dark rounded-xl shadow-md p-4 sm:p-6 hover:shadow-md hover:scale-(--card-hover-scale) transition-all duration-200 border-2 border-primary border-opacity-20"
				>
					<div className="flex justify-between items-start gap-4">
						<div className="flex-1">
							<div className="flex items-baseline gap-2 mb-2">
								{card.prefix && (
									<span className="text-secondary dark:text-secondary italic font-light">{card.prefix}</span>
								)}
								<span className="text-3xl font-bold text-primary dark:text-primary font-serif">{card.word}</span>
								{card.suffix && (
									<span className="text-secondary dark:text-secondary italic font-light">{card.suffix}</span>
								)}
							</div>
							<p className="text-lg text-secondary dark:text-secondary font-medium mb-3">{card.meaning}</p>

							{card.description && (
								<p className="text-dark dark:text-light mb-3 italic font-light">{card.description}</p>
							)}

							{card.examples.length > 0 && (
								<div className="space-y-2">
									<p className="text-sm font-medium text-secondary dark:text-secondary">Examples:</p>
									{card.examples.map((example, idx) => (
										<div
											key={idx}
											className="text-sm text-dark dark:text-light pl-4 border-l-2 border-primary border-opacity-30"
										>
											<p>{example.sentence}</p>
											{example.translation && (
												<p className="text-secondary dark:text-secondary italic font-light">{example.translation}</p>
											)}
										</div>
									))}
								</div>
							)}

							<div className="flex gap-4 mt-4 text-xs text-secondary dark:text-secondary font-light">
								<span>Reviews: {card.reviewCount}</span>
								{card.lastReviewedAt && (
									<span>Last reviewed: {new Date(card.lastReviewedAt).toLocaleDateString()}</span>
								)}
							</div>
						</div>

						<Button
							onClick={() => onCardDeleted(card.id)}
							variant="destructive"
							className="text-sm bg-primary hover:bg-primary/90 text-light"
						>
							Delete
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}
