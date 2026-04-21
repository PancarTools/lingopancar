"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
	applyResolvedTheme,
	getInitialThemePreference,
	getSystemTheme,
	persistThemePreference,
	SYSTEM_THEME_MEDIA_QUERY,
	type ResolvedTheme,
	type ThemePreference,
} from "@/lib/theme";

interface ThemeContextValue {
	themePreference: ThemePreference;
	resolvedTheme: ResolvedTheme;
	setThemePreference: (themePreference: ThemePreference) => void;
	toggleResolvedTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => getInitialThemePreference());
	const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

	const resolvedTheme = themePreference === "system" ? systemTheme : themePreference;

	useEffect(() => {
		applyResolvedTheme(resolvedTheme);
	}, [resolvedTheme]);

	useEffect(() => {
		const mediaQueryList = window.matchMedia(SYSTEM_THEME_MEDIA_QUERY);

		const updateSystemTheme = () => {
			setSystemTheme(getSystemTheme());
		};

		mediaQueryList.addEventListener("change", updateSystemTheme);

		return () => {
			mediaQueryList.removeEventListener("change", updateSystemTheme);
		};
	}, []);

	const setThemePreference = useCallback((nextThemePreference: ThemePreference) => {
		setThemePreferenceState(nextThemePreference);
		persistThemePreference(nextThemePreference);
	}, []);

	const toggleResolvedTheme = useCallback(() => {
		setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
	}, [resolvedTheme, setThemePreference]);

	const value = useMemo(
		() => ({
			themePreference,
			resolvedTheme,
			setThemePreference,
			toggleResolvedTheme,
		}),
		[themePreference, resolvedTheme, setThemePreference, toggleResolvedTheme],
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (context === undefined) {
		throw new Error("useTheme must be used within ThemeProvider");
	}

	return context;
}
