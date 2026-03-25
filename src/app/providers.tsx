"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrGetDeck, ensureWelcomeCard } from "@/lib/firebase-service";

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

			// Create welcome card for new users (idempotent)
			if (currentUser) {
				try {
					const deck = await createOrGetDeck(currentUser.uid);
					await ensureWelcomeCard(currentUser.uid, deck.id);
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
