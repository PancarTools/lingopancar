import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://pancartools.github.io"),
	title: "LingoPancar - Learn Languages with Elegance",
	description:
		"Master vocabulary with beautiful flashcards. Learn German, English, and more with our elegant language learning app.",
	viewport: "width=device-width, initial-scale=1.0, maximum-scale=5.0",
	icons: {
		icon: "/lingopancarrr.png",
		shortcut: "/lingopancarrr.png",
		apple: "/lingopancarrr.png",
	},
	openGraph: {
		title: "LingoPancar - Learn Languages with Elegance",
		description:
			"Master vocabulary with beautiful flashcards. Learn German, English, and more with our elegant language learning app.",
		url: "https://pancartools.github.io/lingopancar/",
		siteName: "LingoPancar",
		images: [
			{
				url: "https://pancartools.github.io/lingopancar/lingoog.png",
				width: 1200,
				height: 630,
				alt: "LingoPancar - Learn Languages with Elegance",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "LingoPancar - Learn Languages with Elegance",
		description:
			"Master vocabulary with beautiful flashcards. Learn German, English, and more with our elegant language learning app.",
		images: ["https://pancartools.github.io/lingopancar/lingoog.png"],
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
