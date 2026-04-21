"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Trash2, Pen } from "lucide-react";
import EditCardForm from "./EditCardForm";

interface CardListProps {
	cards: Card[];
	onCardDeleted: (id: string) => void;
	onCardUpdated: (card: Card) => void;
}

export default function CardList({ cards, onCardDeleted, onCardUpdated }: CardListProps) {
	const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
	const [pendingEditCard, setPendingEditCard] = useState<Card | null>(null);

	if (cards.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground text-lg font-light">No cards yet. Create one to get started!</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid gap-3 sm:gap-4">
				{cards.map((card) => {
					const examples = Array.isArray(card.examples) ? card.examples : [];
					const extra = typeof card.extra === "string" ? { info: card.extra, subInfo: "" } : card.extra;

					return (
						<div
							key={card.id}
							className="bg-surface rounded-xl shadow-md p-4 sm:p-6 hover:shadow-md hover:scale-(--card-hover-scale) transition-all duration-200 border-2 border-border overflow-hidden relative"
						>
							<div className="absolute top-4 right-4 flex gap-2">
								<Button
									onClick={() => setPendingEditCard(card)}
									variant="outline"
									className="text-sm bg-surface border-2 border-secondary text-secondary hover:bg-secondary/10 p-2"
									title="Edit"
								>
									<Pen className="w-4 h-4" />
								</Button>
								<Button
									onClick={() => setPendingDeleteId(card.id)}
									variant="destructive"
									className="text-sm bg-primary hover:bg-primary/90 text-primary-foreground p-2"
									title="Delete"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
							<div>
								<div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 pr-20">
									{card.prefix && <span className="text-secondary italic font-light wrap-anywhere">{card.prefix}</span>}
									<span className="text-3xl font-bold text-primary font-serif wrap-anywhere">{card.main}</span>
									{card.suffix && <span className="text-secondary italic font-light wrap-anywhere">{card.suffix}</span>}
								</div>
								<p className="text-lg text-secondary font-medium mb-3">{card.meaning}</p>

								{extra && (
									<div className="mb-3 space-y-1">
										<p className="text-foreground italic font-light">{extra.info}</p>
										<p className="text-secondary italic font-light">{extra.subInfo}</p>
									</div>
								)}

								{examples.length > 0 && (
									<div className="space-y-2">
										<p className="text-sm font-medium text-secondary">Examples:</p>
										{examples.map((example, idx) => (
											<div
												key={idx}
												className="text-sm text-foreground pl-4 border-l-2 border-primary border-opacity-30"
											>
												<p>{example.sentence}</p>
												{example.translation && (
													<p className="text-secondary italic font-light">{example.translation}</p>
												)}
											</div>
										))}
									</div>
								)}

								<div className="flex gap-4 mt-4 text-xs text-muted-foreground font-light">
									<span>Reviews: {card.reviewCount}</span>
									{card.lastReviewedAt && (
										<span>Last reviewed: {new Date(card.lastReviewedAt).toLocaleDateString()}</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{pendingDeleteId && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
					<div className="w-full max-w-md rounded-xl border-2 border-border bg-surface p-6 shadow-2xl">
						<h3 className="text-xl font-semibold text-primary font-serif mb-2">Confirm Delete</h3>
						<p className="text-sm text-muted-foreground mb-6">
							Are you sure you want to delete this card? This action cannot be undone.
						</p>

						<div className="flex gap-3 justify-end">
							<Button
								onClick={() => setPendingDeleteId(null)}
								variant="outline"
								className="border-2 border-secondary text-secondary hover:bg-secondary/10"
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									if (pendingDeleteId) {
										onCardDeleted(pendingDeleteId);
									}
									setPendingDeleteId(null);
								}}
								variant="destructive"
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								Delete
							</Button>
						</div>
					</div>
				</div>
			)}

			{pendingEditCard && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
					<div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border-2 border-border bg-surface p-4 sm:p-6 shadow-2xl">
						<EditCardForm
							card={pendingEditCard}
							onCardUpdated={(updatedCard) => {
								onCardUpdated(updatedCard);
								setPendingEditCard(null);
							}}
							onCancel={() => setPendingEditCard(null)}
						/>
					</div>
				</div>
			)}
		</>
	);
}
