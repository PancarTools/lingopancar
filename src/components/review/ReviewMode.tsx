"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Card } from "@/lib/types";

interface ReviewModeProps {
	cards: Card[];
	onExit: () => void;
}

export default function ReviewMode({ cards, onExit }: ReviewModeProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	if (cards.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-screen w-full bg-light dark:bg-dark">
				<div className="text-center">
					<p className="text-secondary dark:text-secondary mb-4 font-light">No cards to study</p>
					<Button
						onClick={onExit}
						className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-light dark:text-light"
					>
						Back to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	const currentCard = cards[currentIndex];
	const progress = `${currentIndex + 1} / ${cards.length}`;

	return (
		<div className="min-h-screen w-full bg-gradient-to-br from-light to-light dark:from-dark dark:to-dark p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-2xl mx-auto">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-primary font-serif">
						Study Mode
					</h2>
					<Button
						onClick={onExit}
						variant="outline"
						className="border-2 border-secondary text-secondary dark:text-secondary hover:bg-secondary hover:bg-opacity-10 dark:hover:bg-opacity-20"
					>
						Exit Study
					</Button>
				</div>

				<div className="bg-light dark:bg-dark border-2 border-primary border-opacity-30 rounded-xl p-4 mb-8">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium text-primary dark:text-primary">Progress</span>
						<span className="text-sm font-medium text-primary dark:text-primary">{progress}</span>
					</div>
					<div className="w-full bg-primary bg-opacity-20 dark:bg-opacity-30 rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all"
							style={{
								width: `${((currentIndex + 1) / cards.length) * 100}%`,
							}}
						></div>
					</div>
				</div>

				<div
					className="bg-light dark:bg-dark rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12 min-h-80 sm:min-h-96 flex flex-col justify-center items-center cursor-pointer transition-transform hover:scale-(--card-hover-scale) border-2 border-secondary border-opacity-20"
					onClick={() => setIsFlipped(!isFlipped)}
				>
					{!isFlipped ? (
						<div className="text-center px-4">
							<p className="text-secondary dark:text-secondary text-xs sm:text-sm mb-4 font-light">
								Front (click to reveal)
							</p>
							<div className="flex items-baseline justify-center gap-2 mb-4 flex-wrap">
								{currentCard.prefix && (
									<span className="text-secondary dark:text-secondary italic text-lg font-light">
										{currentCard.prefix}
									</span>
								)}
								<span className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary dark:text-primary font-serif">
									{currentCard.word}
								</span>
								{currentCard.suffix && (
									<span className="text-secondary dark:text-secondary italic text-lg font-light">
										{currentCard.suffix}
									</span>
								)}
							</div>
						</div>
					) : (
						<div className="text-center w-full">
							<p className="text-secondary dark:text-secondary text-sm mb-4 font-light">Back (click to flip)</p>
							<p className="text-3xl font-semibold text-primary dark:text-primary mb-4 font-serif">
								{currentCard.meaning}
							</p>
							{currentCard.description && (
								<p className="text-dark dark:text-light italic mb-6 font-light">{currentCard.description}</p>
							)}
							{currentCard.examples.length > 0 && (
								<div className="text-left space-y-3 mt-6 pt-6 border-t-2 border-primary border-opacity-20">
									<p className="text-sm font-medium text-secondary dark:text-secondary">Examples:</p>
									{currentCard.examples.map((example, idx) => (
										<div key={idx} className="text-sm text-dark dark:text-light">
											<p className="font-medium">{example.sentence}</p>
											{example.translation && (
												<p className="text-secondary dark:text-secondary italic font-light">{example.translation}</p>
											)}
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
						className="border-2 border-secondary text-secondary dark:text-secondary hover:bg-secondary hover:bg-opacity-10 dark:hover:bg-opacity-20"
					>
						←
					</Button>
					<Button
						onClick={() => {
							setIsFlipped(false);
							if (currentIndex === cards.length - 1) {
								onExit();
							} else {
								setCurrentIndex(currentIndex + 1);
							}
						}}
						className="bg-secondary hover:bg-secondary/90 dark:bg-secondary dark:hover:bg-secondary/80 text-light dark:text-light font-semibold"
					>
						{currentIndex === cards.length - 1 ? "Finish" : "Mark & Next"}
					</Button>
					<Button
						onClick={() => {
							setIsFlipped(false);
							setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1));
						}}
						disabled={currentIndex === cards.length - 1}
						variant="outline"
						className="border-2 border-secondary text-secondary dark:text-secondary hover:bg-secondary hover:bg-opacity-10 dark:hover:bg-opacity-20"
					>
						→
					</Button>
				</div>
			</div>
		</div>
	);
}
