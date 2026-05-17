"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
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
				<p className="text-muted-foreground text-lg">No cards yet. Create one to get started!</p>
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
							className="bg-surface rounded-md shadow-sm p-4 sm:p-6 hover:shadow-md hover:scale-(--card-hover-scale) transition-all duration-200 border border-border overflow-hidden relative"
						>
							<div className="absolute top-4 right-4 flex gap-2">
								<Button
									onClick={() => setPendingEditCard(card)}
									variant="outline"
									className="text-sm bg-surface border-secondary text-secondary hover:bg-secondary/10 p-2"
									title="Edit"
								>
									<Pen className="w-4 h-4" />
								</Button>
								<Button
									onClick={() => setPendingDeleteId(card.id)}
									variant="destructive"
									className="text-sm p-2"
									title="Delete"
								>
									<Trash2 className="w-4 h-4" />
								</Button>
							</div>
							<div>
								<div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 pr-20">
									{card.prefix && <span className="text-secondary italic wrap-anywhere">{card.prefix}</span>}
									<span className="text-3xl font-bold text-primary font-serif wrap-anywhere">{card.main}</span>
									{card.suffix && <span className="text-secondary italic wrap-anywhere">{card.suffix}</span>}
								</div>
								<p className="text-lg text-secondary font-medium mb-3">{card.meaning}</p>

								{extra && (
									<div className="mb-3 space-y-1">
										<p className="text-foreground italic">{extra.info}</p>
										<p className="text-secondary italic">{extra.subInfo}</p>
									</div>
								)}

								{examples.length > 0 && (
									<div className="space-y-2">
										<p className="label-vintage text-sm font-medium text-secondary">Examples:</p>
										{examples.map((example, idx) => (
											<div
												key={idx}
												className="text-sm text-foreground pl-4 border-l-2 border-primary border-opacity-30"
											>
												<p>{example.sentence}</p>
												{example.translation && <p className="text-secondary italic">{example.translation}</p>}
											</div>
										))}
									</div>
								)}

								<div className="flex gap-4 mt-4 text-xs text-muted-foreground label-vintage nums-oldstyle">
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

			<Modal open={pendingDeleteId !== null} onClose={() => setPendingDeleteId(null)} size="md">
				<h3 className="text-xl font-bold text-primary font-serif mb-2">Confirm Delete</h3>
				<p className="text-sm text-muted-foreground mb-6">
					Are you sure you want to delete this card? This action cannot be undone.
				</p>

				<div className="flex gap-3 justify-end">
					<Button
						onClick={() => setPendingDeleteId(null)}
						variant="outline"
						className="border-secondary text-secondary hover:bg-secondary/10"
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
					>
						Delete
					</Button>
				</div>
			</Modal>

			<Modal open={pendingEditCard !== null} onClose={() => setPendingEditCard(null)} size="xl" scrollable>
				{pendingEditCard && (
					<EditCardForm
						card={pendingEditCard}
						onCardUpdated={(updatedCard) => {
							onCardUpdated(updatedCard);
							setPendingEditCard(null);
						}}
						onCancel={() => setPendingEditCard(null)}
					/>
				)}
			</Modal>
		</>
	);
}
