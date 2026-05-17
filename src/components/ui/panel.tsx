import * as React from "react";

import { cn } from "@/lib/utils";

export type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
	as?: "div" | "section" | "article" | "form";
	padding?: "none" | "sm" | "md" | "lg";
};

const paddingClasses: Record<NonNullable<PanelProps["padding"]>, string> = {
	none: "",
	sm: "p-3 sm:p-4",
	md: "p-4 sm:p-6",
	lg: "p-4 sm:p-6 md:p-8",
};

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
	({ className, as: As = "div", padding = "md", ...props }, ref) => {
		const Component = As as React.ElementType;
		return (
			<Component
				ref={ref}
				className={cn("bg-surface rounded-md shadow-sm border border-border", paddingClasses[padding], className)}
				{...props}
			/>
		);
	},
);
Panel.displayName = "Panel";

export { Panel };
