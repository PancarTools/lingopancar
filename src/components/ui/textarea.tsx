import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
	return (
		<textarea
			ref={ref}
			className={cn(
				"w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground transition-colors",
				"focus:outline-none focus:border-brand-brass focus:ring-1 focus:ring-brand-brass",
				className,
			)}
			{...props}
		/>
	);
});
Textarea.displayName = "Textarea";

export { Textarea };
