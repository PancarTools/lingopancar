import type { Metadata, Viewport } from "next";
import { Inter, Merriweather, Vollkorn, Bitter, Playfair_Display, EB_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./providers";
import { ThemeProvider } from "./theme-provider";
import { themeInitScript } from "@/lib/theme";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
	display: "swap",
});

// === Serif candidates for visual comparison ===
// All five are loaded and exposed as CSS variables on <html>.
// To swap the active serif, edit the --font-serif line in globals.css —
// no changes needed here. Trim this list once a winner is picked.

// Sturdy newspaper-style screen serif. Weights: 300 / 400 / 700 / 900 (NO 500 or 600).
// Pair `font-serif` with `font-bold`; `font-semibold` will faux-bold.
const merriweather = Merriweather({
	subsets: ["latin"],
	weight: ["300", "400", "700", "900"],
	style: ["normal", "italic"],
	variable: "--font-merriweather",
	display: "swap",
});

// Warm German book serif. Heavier and earthier than Lora, full weight range.
const vollkorn = Vollkorn({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	variable: "--font-vollkorn",
	display: "swap",
});

// Slab-serif designed for screens. Very heavy and very legible; reads more
// "editorial workhorse" than "vintage book".
const bitter = Bitter({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	variable: "--font-bitter",
	display: "swap",
});

// Dramatic Edwardian display serif. Beautiful for headwords; can feel theatrical
// for the meaning/body lines.
const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800", "900"],
	style: ["normal", "italic"],
	variable: "--font-playfair",
	display: "swap",
});

// Classical Garamond spirit, sturdier than Cormorant. Refined, bookish.
const ebGaramond = EB_Garamond({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	style: ["normal", "italic"],
	variable: "--font-eb-garamond",
	display: "swap",
});

const siteUrl = "https://pancartools.github.io/lingopancar";
const siteTitle = "LingoPancar - Beautiful Language Flashcards That Stick";
const siteDescription =
	"Study vocabulary with elegant flashcards, spaced repetition, and fast review sessions for German, English, and more.";
const ogImageUrl = `${siteUrl}/og-image.png`;

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: siteTitle,
	description: siteDescription,
	icons: {
		icon: `${siteUrl}/lingopancarrr.png`,
		shortcut: `${siteUrl}/lingopancarrr.png`,
		apple: `${siteUrl}/lingopancarrr.png`,
	},
	openGraph: {
		title: siteTitle,
		description: siteDescription,
		url: siteUrl,
		siteName: "LingoPancar",
		images: [
			{
				url: ogImageUrl,
				width: 1200,
				height: 630,
				alt: "LingoPancar - Beautiful language flashcards with spaced repetition",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: siteTitle,
		description: siteDescription,
		images: [ogImageUrl],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`${inter.variable} ${merriweather.variable} ${vollkorn.variable} ${bitter.variable} ${playfair.variable} ${ebGaramond.variable}`}
			suppressHydrationWarning
		>
			<body>
				<Script id="theme-init" strategy="beforeInteractive">
					{themeInitScript}
				</Script>
				<ThemeProvider>
					<AuthProvider>{children}</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
