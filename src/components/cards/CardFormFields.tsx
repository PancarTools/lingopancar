"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Example } from "@/lib/types";

export interface CardFormFieldsProps {
	title: string;
	allowAi?: boolean;

	prefix: string;
	onPrefixChange: (prefix: string) => void;
	main: string;
	onMainChange: (main: string) => void;
	suffix: string;
	onSuffixChange: (suffix: string) => void;
	meaning: string;
	onMeaningChange: (meaning: string) => void;
	extraInfo: string;
	onExtraInfoChange: (extraInfo: string) => void;
	extraSubInfo: string;
	onExtraSubInfoChange: (extraSubInfo: string) => void;

	examples: Example[];
	onExamplesChange: (examples: Example[]) => void;

	error: string | null;
}

export default function CardFormFields({
	title,
	allowAi,
	prefix,
	onPrefixChange,
	main,
	onMainChange,
	suffix,
	onSuffixChange,
	meaning,
	onMeaningChange,
	extraInfo,
	onExtraInfoChange,
	extraSubInfo,
	onExtraSubInfoChange,
	examples,
	onExamplesChange,
	error,
}: CardFormFieldsProps) {
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState<string | null>(null);
	const [aiPrompt, setAiPrompt] = useState("");

	const handleExampleChange = (index: number, key: keyof Example, value: string) => {
		const next = examples.map((example, i) => (i === index ? { ...example, [key]: value } : example));
		onExamplesChange(next);
	};

	const handleAddExample = () => {
		onExamplesChange([...examples, { sentence: "", translation: "" }]);
	};

	const handleRemoveExample = (index: number) => {
		onExamplesChange(examples.filter((_, i) => i !== index));
	};

	const handleAiFill = async () => {
		const base = main.trim();
		if (!base) return;
		const input = aiPrompt.trim() ? `${base} — ${aiPrompt.trim()}` : base;

		setAiLoading(true);
		setAiError(null);

		try {
			const res = await fetch("/api/ai-fill", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ input }),
			});

			if (!res.ok) throw new Error(`Request failed: ${res.status}`);

			const data = await res.json();

			if (data.prefix !== undefined) onPrefixChange(data.prefix);
			if (data.main) onMainChange(data.main);
			if (data.suffix !== undefined) onSuffixChange(data.suffix);
			if (data.meaning) onMeaningChange(data.meaning);
			if (data.extra?.info !== undefined) onExtraInfoChange(data.extra.info);
			if (data.extra?.subInfo !== undefined) onExtraSubInfoChange(data.extra.subInfo);
			if (Array.isArray(data.examples) && data.examples.length > 0) {
				onExamplesChange(data.examples);
			}
		} catch (err) {
			setAiError(err instanceof Error ? err.message : "AI fill failed");
		} finally {
			setAiLoading(false);
		}
	};

	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="flex justify-between items-center">
					<h3 className="text-2xl font-bold text-primary font-serif">{title}</h3>
				</div>
				{allowAi && (
					<div className="flex items-center gap-2">
						<Input
							type="text"
							value={aiPrompt}
							onChange={(e) => setAiPrompt(e.target.value)}
							placeholder="Extra instructions… (e.g. adverb form, 2 examples, one with 'dabei')"
							className="text-sm h-9"
							onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
						/>
						<Button
							type="button"
							onClick={handleAiFill}
							disabled={aiLoading || !main.trim()}
							variant="outline"
							size="sm"
							className="shrink-0 border-brand-brass text-brand-brass hover:bg-brand-brass/10 font-semibold"
						>
							{aiLoading ? "Filling…" : "✦ Fill with AI"}
						</Button>
					</div>
				)}
			</div>

			{error && (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md font-medium">
					{error}
				</div>
			)}

			{aiError && (
				<div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md font-medium">
					AI error: {aiError}
				</div>
			)}

			<div className="space-y-4">
				<div className="grid grid-cols-3 gap-4">
					<div>
						<Label htmlFor="card-prefix">Prefix (optional)</Label>
						<Input
							id="card-prefix"
							type="text"
							value={prefix}
							onChange={(e) => onPrefixChange(e.target.value)}
							placeholder="e.g., der"
						/>
					</div>
					<div>
						<Label htmlFor="card-main">Main *</Label>
						<Input
							id="card-main"
							type="text"
							value={main}
							onChange={(e) => onMainChange(e.target.value)}
							placeholder="e.g., Haus"
						/>
					</div>
					<div>
						<Label htmlFor="card-suffix">Suffix (optional)</Label>
						<Input
							id="card-suffix"
							type="text"
							value={suffix}
							onChange={(e) => onSuffixChange(e.target.value)}
							placeholder="e.g., (n)"
						/>
					</div>
				</div>

				<div>
					<Label htmlFor="card-meaning">Meaning *</Label>
					<Input
						id="card-meaning"
						type="text"
						value={meaning}
						onChange={(e) => onMeaningChange(e.target.value)}
						placeholder="Translation in your native language"
					/>
				</div>

				<div>
					<Label htmlFor="card-extra-info">Definition (German, optional)</Label>
					<Textarea
						id="card-extra-info"
						value={extraInfo}
						onChange={(e) => onExtraInfoChange(e.target.value)}
						placeholder="Erklärung auf Deutsch"
						rows={3}
					/>
				</div>

				<div>
					<Label htmlFor="card-extra-sub-info">Definition Translation (English, optional)</Label>
					<Textarea
						id="card-extra-sub-info"
						value={extraSubInfo}
						onChange={(e) => onExtraSubInfoChange(e.target.value)}
						placeholder="English translation"
						rows={3}
					/>
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex justify-between items-center">
					<span className="label-vintage block text-sm font-medium text-secondary">Example Sentences</span>
					<button
						type="button"
						onClick={handleAddExample}
						className="text-sm text-primary hover:text-primary/80 font-medium"
					>
						+ Add Example
					</button>
				</div>

				{examples.map((example, index) => (
					<div key={index} className="space-y-2 p-3 bg-muted/60 border border-border rounded-md">
						<Input
							type="text"
							value={example.sentence}
							onChange={(e) => handleExampleChange(index, "sentence", e.target.value)}
							placeholder="Example sentence"
						/>
						<Input
							type="text"
							value={example.translation || ""}
							onChange={(e) => handleExampleChange(index, "translation", e.target.value)}
							placeholder="Translation (optional)"
						/>
						{examples.length > 1 && (
							<button
								type="button"
								onClick={() => handleRemoveExample(index)}
								className="text-sm text-primary hover:text-primary/80 font-medium"
							>
								Remove
							</button>
						)}
					</div>
				))}
			</div>
		</>
	);
}
