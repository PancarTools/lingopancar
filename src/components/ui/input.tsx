import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
	return (
		<input
			type={type}
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
Input.displayName = "Input";

export { Input };
