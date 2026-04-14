import demoDeckData1 from "./demo-deck/demo-deck-1.json";
import demoDeckData2 from "./demo-deck/demo-deck-2.json";
import demoDeckData3 from "./demo-deck/demo-deck-3.json";
import demoDeckData4 from "./demo-deck/demo-deck-4.json";
import demoDeckData5 from "./demo-deck/demo-deck-5.json";
import demoDeckData6 from "./demo-deck/demo-deck-6.json";
import demoDeckData7 from "./demo-deck/demo-deck-7.json";
import demoDeckData8 from "./demo-deck/demo-deck-8.json";
import demoDeckData9 from "./demo-deck/demo-deck-9.json";
import demoDeckData10 from "./demo-deck/demo-deck-10.json";
import type { Card, SimpleCard } from "@/lib/types";

export type DemoCardInput =
	| Omit<SimpleCard, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">
	| Omit<Card, "id" | "userId" | "deckId" | "createdAt" | "updatedAt">;

export const DEMO_DECK_CARDS = [
	...demoDeckData1,
	...demoDeckData2,
	...demoDeckData3,
	...demoDeckData4,
	...demoDeckData5,
	...demoDeckData6,
	...demoDeckData7,
	...demoDeckData8,
	...demoDeckData9,
	...demoDeckData10,
] as DemoCardInput[];
