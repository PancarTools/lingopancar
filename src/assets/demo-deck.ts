import demoDeckData from "./demo-deck.json";
import type { Card, SimpleCard } from "@/lib/types";

export type DemoCardInput =
	| Omit<SimpleCard, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">
	| Omit<Card, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">;

export const DEMO_DECK_CARDS = demoDeckData as DemoCardInput[];
