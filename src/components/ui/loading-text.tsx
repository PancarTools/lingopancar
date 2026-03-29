"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const LOADING_MESSAGES = [
	{ lang: "en", text: "Loading..." },
	{ lang: "tr", text: "Yükleniyor..." },
	{ lang: "de", text: "Wird geladen..." },
	{ lang: "nl", text: "Laden..." },
	{ lang: "jp", text: "読み込み中..." },
	{ lang: "es", text: "Cargando..." },
	{ lang: "pt", text: "Carregando..." },
] as const;

interface LoadingTextProps {
	className?: string;
	intervalMs?: number;
}

export default function LoadingText({ className, intervalMs = 1400 }: LoadingTextProps) {
	const [messageIndex, setMessageIndex] = useState(0);

	useEffect(() => {
		const interval = window.setInterval(() => {
			setMessageIndex((index) => (index + 1) % LOADING_MESSAGES.length);
		}, intervalMs);

		return () => {
			window.clearInterval(interval);
		};
	}, [intervalMs]);

	const message = LOADING_MESSAGES[messageIndex];

	return (
		<span className={cn(className)} title={message.lang}>
			{message.text}
		</span>
	);
}
