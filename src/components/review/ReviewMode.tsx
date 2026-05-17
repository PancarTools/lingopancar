"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateCard } from "@/lib/firebase-service";
import { getNextReviewStep, getReviewCardUpdates, type ReviewFeedback } from "@/lib/review-session";
import type { Card } from "@/lib/types";

interface ReviewModeProps {
	cards: Card[];
	userId: string;
	onExit: () => void;
}

export default function ReviewMode({ cards, userId, onExit }: ReviewModeProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const handleFeedbackAndNext = async (feedback: ReviewFeedback) => {
		const currentCard = cards[currentIndex];

		// Update card review stats
		try {
			const updates = getReviewCardUpdates(currentCard, feedback);
			await updateCard(userId, currentCard.id, updates);
		} catch (error) {
			console.error("Error updating card review stats:", error);
		}

		// Move to next card or exit
		setIsFlipped(false);
		const { nextIndex, shouldExit } = getNextReviewStep(currentIndex, cards.length);
		if (shouldExit) {
			onExit();
		} else {
			setCurrentIndex(nextIndex);
		}
	};

	if (cards.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-dvh w-full bg-background text-foreground">
				<div className="text-center">
					<p className="text-muted-foreground mb-4">No cards to study</p>
					<Button onClick={onExit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	const currentCard = cards[currentIndex];
	const currentExamples = Array.isArray(currentCard.examples) ? currentCard.examples : [];
	const currentExtra =
		typeof currentCard.extra === "string" ? { info: currentCard.extra, subInfo: "" } : currentCard.extra;
	const progress = `${currentIndex + 1} / ${cards.length}`;

	return (
		<div className="min-h-dvh w-full bg-background text-foreground p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-2xl mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-serif">Study Mode</h2>
					<Button onClick={onExit} variant="outline" className="border-secondary text-secondary hover:bg-secondary/10">
						Exit Study
					</Button>
				</div>

				<div className="bg-surface border border-border rounded-md p-4 mb-8 shadow-sm">
					<div className="flex justify-between items-center mb-2">
						<span className="label-vintage text-sm font-medium text-primary">Progress</span>
						<span className="nums-oldstyle text-sm font-medium text-primary">{progress}</span>
					</div>
					<div className="w-full bg-muted rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all"
							style={{
								width: `${((currentIndex + 1) / cards.length) * 100}%`,
							}}
						></div>
					</div>
				</div>

				<div
					className="bg-surface rounded-md shadow-md p-6 sm:p-8 md:p-12 min-h-80 sm:min-h-96 flex flex-col justify-center items-center cursor-pointer transition-transform hover:scale-(--card-hover-scale) border border-border overflow-hidden"
					onClick={() => setIsFlipped(!isFlipped)}
				>
					{!isFlipped ? (
						<div className="w-full max-w-full text-center px-4">
							<p className="label-vintage text-muted-foreground text-xs sm:text-sm mb-4">Front (click to reveal)</p>
							<div className="mb-4 flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
								{currentCard.prefix && (
									<span className="text-secondary italic text-lg wrap-anywhere">{currentCard.prefix}</span>
								)}
								<span className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary font-serif wrap-anywhere">
									{currentCard.main}
								</span>
								{currentCard.suffix && (
									<span className="text-secondary italic text-lg wrap-anywhere">{currentCard.suffix}</span>
								)}
							</div>
						</div>
					) : (
						<div className="text-center w-full">
							<p className="label-vintage text-muted-foreground text-sm mb-4">Back (click to flip)</p>
							<p className="text-3xl font-bold text-primary mb-4 font-serif">{currentCard.meaning}</p>
							{currentExtra && (
								<div className="mb-6 space-y-1">
									<p className="text-foreground italic">{currentExtra.info}</p>
									<p className="text-secondary italic">{currentExtra.subInfo}</p>
								</div>
							)}
							{currentExamples.length > 0 && (
								<div className="text-left space-y-3 mt-6 pt-6 border-t border-brand-brass/60">
									<p className="label-vintage text-sm font-medium text-secondary">Examples:</p>
									{currentExamples.map((example, idx) => (
										<div key={idx} className="text-sm text-foreground">
											<p className="font-medium">{example.sentence}</p>
											{example.translation && <p className="text-secondary italic">{example.translation}</p>}
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>

				<div className="flex gap-3 justify-center mt-8">
					<Button
						onClick={() => {
							setIsFlipped(false);
							setCurrentIndex(Math.max(0, currentIndex - 1));
						}}
						disabled={currentIndex === 0}
						variant="outline"
						className="border-secondary text-secondary hover:bg-secondary/10"
					>
						←
					</Button>
					<div className="flex flex-wrap gap-2 justify-center">
						<Button
							onClick={() => handleFeedbackAndNext("again")}
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
						>
							Again
						</Button>
						<Button
							onClick={() => handleFeedbackAndNext("meh")}
							variant="outline"
							className="border-secondary text-secondary hover:text-secondary hover:bg-secondary/10 font-semibold"
						>
							Meh
						</Button>
						<Button
							onClick={() => handleFeedbackAndNext("yay")}
							className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
						>
							{currentIndex === cards.length - 1 ? "Yay & Finish" : "Yay"}
						</Button>
					</div>
					<Button
						onClick={() => {
							setIsFlipped(false);
							setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
						}}
						disabled={currentIndex === cards.length - 1}
						variant="outline"
						className="border-secondary text-secondary hover:bg-secondary/10"
					>
						→
					</Button>
				</div>
			</div>
		</div>
	);
}
