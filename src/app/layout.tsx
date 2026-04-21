import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./providers";
import { ThemeProvider } from "./theme-provider";
import { themeInitScript } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

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
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
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
