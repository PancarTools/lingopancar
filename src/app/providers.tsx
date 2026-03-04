"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrGetDeck, addCard, getCardsByDeckId } from "@/lib/firebase-service";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
			setUser(currentUser);

			// Create welcome card for new users
			if (currentUser) {
				try {
					const deck = await createOrGetDeck(currentUser.uid);

					// Check if user already has cards (to avoid duplicate welcome cards)
					const existingCards = await getCardsByDeckId(deck.id);

					if (existingCards.length === 0) {
						// Add welcome card
						await addCard(currentUser.uid, deck.id, {
							prefix: "der",
							word: "Erfolg",
							suffix: "",
							meaning: "success",
							description: "positives Ergebnis, das man erreichen wollte",
							examples: [
								{
									sentence: "Sie hatte (mit ihrem Projekt) leider keinen Erfolg.",
									translation: "Unfortunately she wasn't successful (with her project).",
								},
							],
							reviewCount: 0,
						});
					}
				} catch (error) {
					console.error("Error creating welcome card:", error);
				}
			}

			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const signOut = async () => {
		await firebaseSignOut(auth!);
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
