import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: "class",
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		colors: {
			white: "#ffffff",
			black: "#000000",
			victorian: {
				burgundy: "#a63446",
				cream: "#fbfef9",
				teal: "#0c6291",
				dark: "#080f0f",
				green: "#3D7B46",
			},
			primary: "#a63446",
			secondary: "#0c6291",
			accent: "#3D7B46",
			light: "#fbfef9",
			dark: "#080f0f",
		},
		extend: {
			backgroundColor: {
				primary: "#a63446",
				secondary: "#0c6291",
				accent: "#3D7B46",
				light: "#fbfef9",
				dark: "#080f0f",
			},
			textColor: {
				primary: "#a63446",
				secondary: "#0c6291",
				accent: "#3D7B46",
				dark: "#080f0f",
				light: "#fbfef9",
			},
			borderColor: {
				primary: "#a63446",
				secondary: "#0c6291",
				accent: "#3D7B46",
			},
		},
	},
	plugins: [],
} satisfies Config;

export default config;
