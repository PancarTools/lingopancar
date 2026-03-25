"use client";

import { useAuth } from "@/app/providers";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import CardList from "@/components/cards/CardList";
import CardForm from "@/components/cards/CardForm";
import ReviewMode from "@/components/review/ReviewMode";
import { createOrGetDeck, subscribeToCards, deleteCard } from "@/lib/firebase-service";
import type { Card, Deck } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Dashboard() {
	const { user, signOut } = useAuth();
	const [deck, setDeck] = useState<Deck | null>(null);
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isReviewMode, setIsReviewMode] = useState(false);

	const loadDeck = useCallback(async () => {
		try {
			setLoading(true);
			const userDeck = await createOrGetDeck(user!.uid);
			setDeck(userDeck);

			const unsubscribe = subscribeToCards(user!.uid, userDeck.id, (updatedCards: Card[]) => {
				setCards(updatedCards);
			});

			setLoading(false);
			return unsubscribe;
		} catch (error) {
			console.error("Error loading deck:", error);
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) {
			loadDeck();
		}
	}, [user, loadDeck]);

	const filteredCards = cards.filter((card) => {
		const query = searchQuery.toLowerCase();
		return card.main.toLowerCase().includes(query) || card.meaning.toLowerCase().includes(query);
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen w-full bg-light dark:bg-dark">
				<LoadingSpinner />
			</div>
		);
	}

	if (isReviewMode) {
		return <ReviewMode cards={cards} userId={user!.uid} onExit={() => setIsReviewMode(false)} />;
	}

	return (
		<div className="min-h-screen w-full bg-light dark:bg-dark">
			<nav className="bg-gradient-to-r from-primary to-primary/80 dark:from-primary dark:to-primary/70 shadow-lg border-b-4 border-secondary">
				<div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-light dark:text-light font-serif truncate">LingoPancar</h1>
					<div className="flex items-center gap-2 sm:gap-4">
						<span className="text-xs sm:text-sm text-light dark:text-light font-light truncate hidden sm:inline">
							{user?.displayName || user?.email}
						</span>
						<Button
							onClick={signOut}
							variant="destructive"
							className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 bg-secondary hover:bg-secondary/90 dark:bg-secondary dark:hover:bg-secondary/80 text-light dark:text-light"
						>
							Sign Out
						</Button>
					</div>
				</div>
			</nav>

			<main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary dark:text-primary font-serif">
						{deck?.name || "My Deck"}
					</h2>
					<div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
						<Button
							onClick={() => setIsReviewMode(true)}
							className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 dark:bg-secondary dark:hover:bg-secondary/80 text-light dark:text-light font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2"
						>
							Study ({cards.length})
						</Button>
						<Button
							onClick={() => setShowForm(!showForm)}
							className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/80 text-light dark:text-light font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2"
						>
							{showForm ? "Cancel" : "+ Add"}
						</Button>
					</div>
				</div>

				{showForm && deck && (
					<CardForm
						deckId={deck.id}
						onCardAdded={(card: Card) => {
							setCards([...cards, card]);
							setShowForm(false);
						}}
						onCancel={() => setShowForm(false)}
					/>
				)}

				<div className="bg-light dark:bg-dark rounded-xl shadow-md p-3 sm:p-4 mb-6 sm:mb-8 border-2 border-primary border-opacity-20">
					<input
						type="text"
						placeholder="Search cards..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-4 py-3 border-2 border-secondary border-opacity-30 dark:border-secondary dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light placeholder-secondary placeholder-opacity-50 dark:placeholder-opacity-60"
					/>
				</div>

				<CardList
					cards={filteredCards}
					onCardDeleted={async (id: string) => {
						if (deck && user) {
							try {
								await deleteCard(user.uid, id, deck.id);
								setCards(cards.filter((c) => c.id !== id));
							} catch (error) {
								console.error("Error deleting card:", error);
							}
						}
					}}
				/>
			</main>
		</div>
	);
}
