"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addCard } from "@/lib/firebase-service";
import { useAuth } from "@/app/providers";
import { CARD_TYPE } from "@/lib/types";
import type { Card, CardExtra, Example } from "@/lib/types";
import CardFormFields from "./CardFormFields";

interface CardFormProps {
	deckId: string;
	onCardAdded: (card: Card) => void;
	onCancel: () => void;
}

export default function CardForm({ deckId, onCardAdded, onCancel }: CardFormProps) {
	const { user, allowAi } = useAuth();
	const [prefix, setPrefix] = useState("");
	const [main, setMain] = useState("");
	const [suffix, setSuffix] = useState("");
	const [meaning, setMeaning] = useState("");
	const [extraInfo, setExtraInfo] = useState("");
	const [extraSubInfo, setExtraSubInfo] = useState("");
	const [examples, setExamples] = useState<Example[]>([{ sentence: "", translation: "" }]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!main.trim() || !meaning.trim()) {
			setError("Main and meaning are required");
			return;
		}

		const sanitizedMain = main.trim().slice(0, 100);
		const sanitizedMeaning = meaning.trim().slice(0, 200);
		const sanitizedPrefix = prefix.trim().slice(0, 50);
		const sanitizedSuffix = suffix.trim().slice(0, 50);
		const sanitizedExtra: CardExtra = {
			info: extraInfo.trim().slice(0, 300),
			subInfo: extraSubInfo.trim().slice(0, 300),
		};

		const sanitizedExamples = examples.map((example) => ({
			sentence: example.sentence.trim().slice(0, 200),
			translation: (example.translation ?? "").trim().slice(0, 200),
		}));

		if (!user) {
			setError("You must be logged in to create cards");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const sanitizedExampleItems = sanitizedExamples.filter((ex) => ex.sentence);
			const newCard = await addCard(user.uid, deckId, {
				type: CARD_TYPE.DETAILED,
				prefix: sanitizedPrefix,
				main: sanitizedMain,
				suffix: sanitizedSuffix,
				meaning: sanitizedMeaning,
				extra: sanitizedExtra,
				examples: sanitizedExampleItems,
				reviewCount: 0,
			});

			onCardAdded(newCard);
			setPrefix("");
			setMain("");
			setSuffix("");
			setMeaning("");
			setExtraInfo("");
			setExtraSubInfo("");
			setExamples([{ sentence: "", translation: "" }]);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create card");
			console.error("Error creating card:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-surface rounded-md shadow-sm p-4 sm:p-6 md:p-8 space-y-4 mb-6 sm:mb-8 border border-border"
		>
			<CardFormFields
				title="Add New Card"
				allowAi={allowAi}
				prefix={prefix}
				onPrefixChange={setPrefix}
				main={main}
				onMainChange={setMain}
				suffix={suffix}
				onSuffixChange={setSuffix}
				meaning={meaning}
				onMeaningChange={setMeaning}
				extraInfo={extraInfo}
				onExtraInfoChange={setExtraInfo}
				extraSubInfo={extraSubInfo}
				onExtraSubInfoChange={setExtraSubInfo}
				examples={examples}
				onExamplesChange={setExamples}
				error={error}
			/>

			<div className="flex gap-3 justify-end">
				<Button
					type="button"
					onClick={onCancel}
					variant="outline"
					className="border-secondary text-secondary hover:bg-secondary/10"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
					className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
				>
					{isSubmitting ? "Creating..." : "Create Card"}
				</Button>
			</div>
		</form>
	);
}
