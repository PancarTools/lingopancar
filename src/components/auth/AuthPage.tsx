"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import LoadingText from "@/components/ui/loading-text";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useState } from "react";

export default function AuthPage() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleGoogleSignIn = async () => {
		try {
			setLoading(true);
			setError(null);
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth!, provider);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-dvh w-full bg-background px-4 py-8 text-foreground">
			<div className="mb-4 flex w-full max-w-md justify-end">
				<ThemeToggle />
			</div>
			<div className="bg-surface rounded-md shadow-md p-6 sm:p-8 md:p-12 w-full max-w-md border border-border">
				<h1 className="text-4xl sm:text-5xl font-bold text-center text-primary mb-2 font-serif">LingoPancar</h1>
				<p className="text-center text-muted-foreground mb-8 text-base sm:text-lg">Learn languages with elegance</p>

				{error && (
					<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-6 font-medium">
						{error}
					</div>
				)}

				<Button
					onClick={handleGoogleSignIn}
					disabled={loading}
					className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-md transition-all duration-300 shadow-sm hover:shadow-md"
				>
					{loading ? <LoadingText className="text-primary-foreground" /> : "Sign in with Google"}
				</Button>

				<p className="text-center text-muted-foreground text-sm mt-8">Sign in to create and study flashcards</p>
			</div>
		</div>
	);
}
