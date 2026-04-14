"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addCard } from "@/lib/firebase-service";
import { useAuth } from "@/app/providers";
import { CARD_TYPE } from "@/lib/types";
import type { Card, CardExtra, CardType } from "@/lib/types";

interface CardFormProps {
	deckId: string;
	onCardAdded: (card: Card) => void;
	onCancel: () => void;
}

export default function CardForm({ deckId, onCardAdded, onCancel }: CardFormProps) {
	const { user } = useAuth();
	const [cardType, setCardType] = useState<CardType>(CARD_TYPE.DETAILED);
	const [prefix, setPrefix] = useState("");
	const [main, setMain] = useState("");
	const [suffix, setSuffix] = useState("");
	const [meaning, setMeaning] = useState("");
	const [extraInfo, setExtraInfo] = useState("");
	const [extraSubInfo, setExtraSubInfo] = useState("");
	const [examples, setExamples] = useState([{ sentence: "", translation: "" }]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Input validation
		if (!main.trim() || !meaning.trim()) {
			setError("Main and meaning are required");
			return;
		}

		// Sanitize inputs
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
			translation: example.translation.trim().slice(0, 200),
		}));

		if (!user) {
			setError("You must be logged in to create cards");
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const sanitizedExampleItems = sanitizedExamples.filter((ex) => ex.sentence);
			const newCard =
				cardType === CARD_TYPE.SIMPLE
					? await addCard(user.uid, deckId, {
							type: CARD_TYPE.SIMPLE,
							main: sanitizedMain,
							meaning: sanitizedMeaning,
							extra: sanitizedExtra,
							examples: sanitizedExampleItems,
							reviewCount: 0,
						})
					: await addCard(user.uid, deckId, {
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
			className="bg-light dark:bg-dark rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-4 mb-6 sm:mb-8 border-2 border-primary border-opacity-30"
		>
			<div className="flex justify-between items-center">
				<h3 className="text-2xl font-semibold text-primary dark:text-primary font-serif">Add New Card</h3>
				<div className="flex items-center gap-3">
					<span className="text-sm font-medium text-secondary dark:text-secondary">
						{cardType === CARD_TYPE.SIMPLE ? "Simple" : "Detailed"}
					</span>
					<button
						type="button"
						onClick={() => setCardType(cardType === CARD_TYPE.SIMPLE ? CARD_TYPE.DETAILED : CARD_TYPE.SIMPLE)}
						className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-dark ${
							cardType === CARD_TYPE.DETAILED
								? "bg-primary hover:bg-primary/90"
								: "bg-secondary/30 hover:bg-secondary/40"
						}`}
						aria-label="Toggle card type"
					>
						<span
							className={`inline-block h-6 w-6 transform rounded-full bg-light shadow-lg transition-transform ${
								cardType === CARD_TYPE.DETAILED ? "translate-x-7" : "translate-x-1"
							}`}
						/>
					</button>
				</div>
			</div>

			{error && (
				<div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary text-primary dark:text-primary px-4 py-3 rounded-lg font-medium">
					{error}
				</div>
			)}

			{cardType === CARD_TYPE.SIMPLE ? (
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">Main *</label>
						<input
							type="text"
							value={main}
							onChange={(e) => setMain(e.target.value)}
							placeholder="e.g., Haus"
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">Meaning *</label>
						<input
							type="text"
							value={meaning}
							onChange={(e) => setMeaning(e.target.value)}
							placeholder="Translation in your native language"
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
							Definition (German, optional)
						</label>
						<textarea
							value={extraInfo}
							onChange={(e) => setExtraInfo(e.target.value)}
							placeholder="Kurze Erklärung auf Deutsch"
							rows={3}
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						></textarea>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
							Definition Translation (English, optional)
						</label>
						<textarea
							value={extraSubInfo}
							onChange={(e) => setExtraSubInfo(e.target.value)}
							placeholder="English translation of the German definition"
							rows={3}
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						></textarea>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<label className="block text-sm font-medium text-secondary dark:text-secondary">
								Example Sentences (optional)
							</label>
							<button
								type="button"
								onClick={() => setExamples([...examples, { sentence: "", translation: "" }])}
								className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/70 font-medium"
							>
								+ Add Example
							</button>
						</div>

						{examples.map((example, index) => (
							<div
								key={index}
								className="space-y-2 p-3 bg-light border-2 border-secondary border-opacity-20 rounded-lg"
							>
								<input
									type="text"
									value={example.sentence}
									onChange={(e) => {
										const newExamples = [...examples];
										newExamples[index].sentence = e.target.value;
										setExamples(newExamples);
									}}
									placeholder="Example sentence"
									className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
								/>
								<input
									type="text"
									value={example.translation || ""}
									onChange={(e) => {
										const newExamples = [...examples];
										newExamples[index].translation = e.target.value;
										setExamples(newExamples);
									}}
									placeholder="Translation (optional)"
									className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
								/>
								{examples.length > 1 && (
									<button
										type="button"
										onClick={() => setExamples(examples.filter((_, i) => i !== index))}
										className="text-sm text-primary hover:text-primary/80 font-medium"
									>
										Remove
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
								Prefix (optional)
							</label>
							<input
								type="text"
								value={prefix}
								onChange={(e) => setPrefix(e.target.value)}
								placeholder="e.g., der"
								className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">Main *</label>
							<input
								type="text"
								value={main}
								onChange={(e) => setMain(e.target.value)}
								placeholder="e.g., Haus"
								className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
								Suffix (optional)
							</label>
							<input
								type="text"
								value={suffix}
								onChange={(e) => setSuffix(e.target.value)}
								placeholder="e.g., (n)"
								className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">Meaning *</label>
						<input
							type="text"
							value={meaning}
							onChange={(e) => setMeaning(e.target.value)}
							placeholder="Translation in your native language"
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
							Definition (German)
						</label>
						<textarea
							value={extraInfo}
							onChange={(e) => setExtraInfo(e.target.value)}
							placeholder="Erklärung auf Deutsch"
							rows={3}
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						></textarea>
					</div>

					<div>
						<label className="block text-sm font-medium text-secondary dark:text-secondary mb-1">
							Definition Translation (English)
						</label>
						<textarea
							value={extraSubInfo}
							onChange={(e) => setExtraSubInfo(e.target.value)}
							placeholder="English translation"
							rows={3}
							className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 dark:border-opacity-40 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark text-dark dark:text-light"
						></textarea>
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<label className="block text-sm font-medium text-secondary dark:text-secondary">Example Sentences</label>
							<button
								type="button"
								onClick={() => setExamples([...examples, { sentence: "", translation: "" }])}
								className="text-sm text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/70 font-medium"
							>
								+ Add Example
							</button>
						</div>

						{examples.map((example, index) => (
							<div
								key={index}
								className="space-y-2 p-3 bg-light border-2 border-secondary border-opacity-20 rounded-lg"
							>
								<input
									type="text"
									value={example.sentence}
									onChange={(e) => {
										const newExamples = [...examples];
										newExamples[index].sentence = e.target.value;
										setExamples(newExamples);
									}}
									placeholder="Example sentence"
									className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
								/>
								<input
									type="text"
									value={example.translation || ""}
									onChange={(e) => {
										const newExamples = [...examples];
										newExamples[index].translation = e.target.value;
										setExamples(newExamples);
									}}
									placeholder="Translation (optional)"
									className="w-full px-3 py-2 border-2 border-secondary border-opacity-30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white text-dark"
								/>
								{examples.length > 1 && (
									<button
										type="button"
										onClick={() => setExamples(examples.filter((_, i) => i !== index))}
										className="text-sm text-primary hover:text-primary/80 font-medium"
									>
										Remove
									</button>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			<div className="flex gap-3 justify-end">
				<Button
					type="button"
					onClick={onCancel}
					variant="outline"
					className="border-2 border-secondary text-secondary hover:bg-secondary hover:bg-opacity-10"
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
					className="bg-primary hover:bg-primary/90 text-light font-semibold"
				>
					{isSubmitting ? "Creating..." : "Create Card"}
				</Button>
			</div>
		</form>
	);
}
