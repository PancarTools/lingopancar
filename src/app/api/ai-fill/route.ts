import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a German vocabulary flashcard assistant.
Given a word, phrase, or natural-language instruction in English or German, return a JSON object for a German vocabulary flashcard.
Always fill all fields. If the input is an English word, find the German equivalent. If the input is a natural-language instruction (e.g. "verb form of gehen", "with an example of während"), interpret it and return the appropriate German word.
Default target language: German.

Return ONLY valid JSON matching this exact schema:
{
  "prefix": "",
  "main": "",
  "suffix": "",
  "meaning": "",
  "extra": { "info": "", "subInfo": "" },
  "examples": [{ "sentence": "", "translation": "" }]
}

Field rules:
- prefix: grammatical article (der/die/das for nouns, empty string for verbs/adjectives/adverbs)
- main: the German headword in its base/dictionary form
- suffix: inflection hint for nouns e.g. "(n)" for plural, conjugation pattern for verbs, or empty string
- meaning: concise English translation
- extra.info: short definition or usage note in German
- extra.subInfo: English translation of extra.info
- examples: 1-2 natural example sentences with translations`;

interface AiFillResponse {
	prefix: string;
	main: string;
	suffix: string;
	meaning: string;
	extra: { info: string; subInfo: string };
	examples: { sentence: string; translation: string }[];
}

export async function POST(req: NextRequest) {
	const body = await req.json().catch(() => null);
	const input: string = body?.input?.trim() ?? "";

	if (!input) {
		return NextResponse.json({ error: "input required" }, { status: 400 });
	}

	try {
		const completion = await client.chat.completions.create({
			model: "gpt-5-mini",
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: input },
			],
		});

		const raw = completion.choices[0]?.message?.content ?? "{}";
		const data = JSON.parse(raw) as AiFillResponse;

		return NextResponse.json(data);
	} catch (err) {
		const message = err instanceof Error ? err.message : "AI request failed";
		console.error("ai-fill error:", err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
