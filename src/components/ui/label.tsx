import * as React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => {
	return (
		<label
			ref={ref}
			className={cn("label-vintage block text-sm font-medium text-secondary mb-1", className)}
			{...props}
		/>
	);
});
Label.displayName = "Label";

export { Label };
