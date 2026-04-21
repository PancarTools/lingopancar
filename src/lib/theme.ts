export type ResolvedTheme = "light" | "dark";
export type ThemePreference = ResolvedTheme | "system";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;
export const THEME_STORAGE_KEY = "lingopancar-theme";
export const SYSTEM_THEME_MEDIA_QUERY = "(prefers-color-scheme: dark)";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const DEFAULT_RESOLVED_THEME: ResolvedTheme = "light";

export function isThemePreference(value: string | null): value is ThemePreference {
	return value !== null && THEME_PREFERENCES.includes(value as ThemePreference);
}

export function getSystemTheme(): ResolvedTheme {
	if (typeof window === "undefined") {
		return DEFAULT_RESOLVED_THEME;
	}

	return window.matchMedia(SYSTEM_THEME_MEDIA_QUERY).matches ? "dark" : DEFAULT_RESOLVED_THEME;
}

export function resolveTheme(themePreference: ThemePreference): ResolvedTheme {
	return themePreference === "system" ? getSystemTheme() : themePreference;
}

export function getStoredThemePreference(): ThemePreference | null {
	if (typeof window === "undefined") {
		return null;
	}

	const storedThemePreference = window.localStorage.getItem(THEME_STORAGE_KEY);
	return isThemePreference(storedThemePreference) ? storedThemePreference : null;
}

export function getInitialThemePreference(): ThemePreference {
	return getStoredThemePreference() ?? DEFAULT_THEME_PREFERENCE;
}

export function applyResolvedTheme(theme: ResolvedTheme) {
	if (typeof document === "undefined") {
		return;
	}

	document.documentElement.dataset.theme = theme;
}

export function persistThemePreference(themePreference: ThemePreference) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
}

export const themeInitScript = `
(function () {
	var defaultResolvedTheme = "${DEFAULT_RESOLVED_THEME}";
	var defaultThemePreference = "${DEFAULT_THEME_PREFERENCE}";
	var mediaQuery = "${SYSTEM_THEME_MEDIA_QUERY}";
	var getSystemTheme = function () {
		return window.matchMedia(mediaQuery).matches ? "dark" : defaultResolvedTheme;
	};
	var setTheme = function (theme) {
		document.documentElement.dataset.theme = theme;
	};

	try {
		var storageKey = "${THEME_STORAGE_KEY}";
		var storedThemePreference = window.localStorage.getItem(storageKey);
		var themePreference =
			storedThemePreference === "light" || storedThemePreference === "dark" || storedThemePreference === "system"
				? storedThemePreference
				: defaultThemePreference;

		setTheme(themePreference === "system" ? getSystemTheme() : themePreference);
	} catch {
		setTheme(getSystemTheme());
	}
})();
`;
