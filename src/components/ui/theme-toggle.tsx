"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/app/theme-provider";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
	const { resolvedTheme, toggleResolvedTheme } = useTheme();
	const ResolvedIcon = resolvedTheme === "dark" ? Moon : Sun;

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onClick={toggleResolvedTheme}
			className="h-10 w-10 rounded-full border border-border bg-surface/85 text-foreground shadow-sm backdrop-blur-sm hover:bg-muted"
			aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
			title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
		>
			<ResolvedIcon className="h-4 w-4" />
		</Button>
	);
}
