"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createOrGetDeck, ensureWelcomeCard, getAllowAiState } from "@/lib/firebase-service";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	allowAi: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [allowAi, setAllowAi] = useState(false);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth!, async (currentUser) => {
			setUser(currentUser);

			if (currentUser) {
				try {
					const deck = await createOrGetDeck(currentUser.uid);
					await ensureWelcomeCard(currentUser.uid, deck.id);
					const aiEnabled = await getAllowAiState(currentUser.uid);
					setAllowAi(aiEnabled);
				} catch (error) {
					console.error("Error during auth bootstrap:", error);
				}
			} else {
				setAllowAi(false);
			}

			setLoading(false);
		});

		return unsubscribe;
	}, []);

	const signOut = async () => {
		await firebaseSignOut(auth!);
		setUser(null);
		setAllowAi(false);
	};

	return <AuthContext.Provider value={{ user, loading, allowAi, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}
