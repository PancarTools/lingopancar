"use client";

import { useAuth } from "@/app/providers";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import CardList from "@/components/cards/CardList";
import CardForm from "@/components/cards/CardForm";
import ReviewMode from "@/components/review/ReviewMode";
import {
	createOrGetDeck,
	subscribeToCards,
	deleteCard,
	getDemoDeckLoadedState,
	loadDemoDeck,
} from "@/lib/firebase-service";
import type { Card, Deck } from "@/lib/types";
import { getTopReviewCards } from "@/lib/spaced-repetition";
import LoadingSpinner from "@/components/ui/loading-spinner";
import LoadingText from "@/components/ui/loading-text";

export default function Dashboard() {
	const { user, signOut } = useAuth();
	const [deck, setDeck] = useState<Deck | null>(null);
	const [cards, setCards] = useState<Card[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isReviewMode, setIsReviewMode] = useState(false);
	const [showStudyOptions, setShowStudyOptions] = useState(false);
	const [reviewCards, setReviewCards] = useState<Card[]>([]);
	const [demoDeckLoaded, setDemoDeckLoaded] = useState(false);
	const [isLoadingDemoDeck, setIsLoadingDemoDeck] = useState(false);

	const getRandomSessionCards = (allCards: Card[], limit: number = 10) => {
		const shuffled = [...allCards].sort(() => Math.random() - 0.5);
		return shuffled.slice(0, limit);
	};

	const handleStartDueStudy = () => {
		const session = getTopReviewCards(cards, 10);
		setReviewCards(session);
		setShowStudyOptions(false);
		setIsReviewMode(true);
	};

	const handleStartRandomStudy = () => {
		const session = getRandomSessionCards(cards, 10);
		setReviewCards(session);
		setShowStudyOptions(false);
		setIsReviewMode(true);
	};

	const loadDeck = useCallback(async () => {
		try {
			setLoading(true);
			const userDeck = await createOrGetDeck(user!.uid);
			setDeck(userDeck);
			const isLoaded = await getDemoDeckLoadedState(user!.uid);
			setDemoDeckLoaded(isLoaded);

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

	const handleLoadDemoDeck = async () => {
		if (!user || !deck || demoDeckLoaded) return;

		try {
			setIsLoadingDemoDeck(true);
			await loadDemoDeck(user.uid, deck.id);
			setDemoDeckLoaded(true);
		} catch (error) {
			console.error("Error loading demo deck:", error);
		} finally {
			setIsLoadingDemoDeck(false);
		}
	};

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
			<div className="flex items-center justify-center min-h-screen w-full bg-background">
				<LoadingSpinner />
			</div>
		);
	}

	if (isReviewMode) {
		return <ReviewMode cards={reviewCards} userId={user!.uid} onExit={() => setIsReviewMode(false)} />;
	}

	return (
		<div className="min-h-dvh w-full bg-background text-foreground">
			{isLoadingDemoDeck && (
				<div className="fixed inset-0 z-60 flex items-center justify-center bg-overlay backdrop-blur-sm">
					<div className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-surface px-6 py-5 shadow-2xl">
						<LoadingSpinner />
						<LoadingText className="text-sm font-medium text-primary" />
					</div>
				</div>
			)}

			<nav className="bg-linear-to-r from-primary to-primary/80 shadow-lg border-b-4 border-secondary">
				<div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
					<h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground font-serif truncate">LingoPancar</h1>
					<div className="flex items-center gap-2 sm:gap-4">
						<span className="text-xs sm:text-sm text-primary-foreground font-light truncate hidden sm:inline">
							{user?.displayName || user?.email}
						</span>
						<Button
							onClick={signOut}
							variant="destructive"
							className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
						>
							Sign Out
						</Button>
					</div>
				</div>
			</nav>

			<main className="w-full max-w-225 mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
				<div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-serif">
						{deck?.name || "My Deck"}
					</h2>
					<div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
						{!demoDeckLoaded && (
							<Button
								onClick={handleLoadDemoDeck}
								disabled={isLoadingDemoDeck}
								variant="outline"
								className="flex-1 sm:flex-none border-2 border-secondary text-secondary hover:text-secondary hover:bg-secondary/10 font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2"
							>
								{isLoadingDemoDeck ? <LoadingText className="text-xs sm:text-sm" /> : "Load Demo Deck"}
							</Button>
						)}
						<Button
							onClick={() => setShowStudyOptions(true)}
							className="flex-1 sm:flex-none bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2"
						>
							Study ({Math.min(cards.length, 10)})
						</Button>
						<Button
							onClick={() => setShowForm(!showForm)}
							className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2"
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

				<div className="bg-surface rounded-xl shadow-md p-3 sm:p-4 mb-6 sm:mb-8 border-2 border-border">
					<input
						type="text"
						placeholder="Search cards..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full px-4 py-3 border-2 border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground placeholder:text-muted-foreground"
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
					onCardUpdated={(updatedCard: Card) => {
						setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
					}}
				/>

				{showStudyOptions && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4">
						<div className="w-full max-w-md rounded-xl border-2 border-border bg-surface p-6 shadow-2xl">
							<h3 className="text-xl font-semibold text-primary font-serif mb-2">Start Study Session</h3>
							<p className="text-sm text-muted-foreground mb-6">Choose how to select this 10-card batch.</p>

							<div className="space-y-3">
								<Button
									onClick={handleStartDueStudy}
									disabled={cards.length === 0}
									className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
								>
									Study Due ({getTopReviewCards(cards, 10).length})
								</Button>
								<Button
									onClick={handleStartRandomStudy}
									disabled={cards.length === 0}
									className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
								>
									Study Random ({Math.min(cards.length, 10)})
								</Button>
							</div>

							<div className="mt-4 flex justify-end">
								<Button
									onClick={() => setShowStudyOptions(false)}
									variant="outline"
									className="border-2 border-secondary text-secondary hover:bg-secondary/10"
								>
									Cancel
								</Button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
