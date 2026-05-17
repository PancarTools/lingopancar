import * as React from "react";

import { cn } from "@/lib/utils";

export type ModalProps = {
	open: boolean;
	onClose?: () => void;
	children: React.ReactNode;
	className?: string;
	size?: "sm" | "md" | "lg" | "xl";
	scrollable?: boolean;
	zIndex?: number;
};

const sizeClasses: Record<NonNullable<ModalProps["size"]>, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-2xl",
};

export function Modal({
	open,
	onClose,
	children,
	className,
	size = "md",
	scrollable = false,
	zIndex = 50,
}: ModalProps) {
	if (!open) return null;

	const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if (event.target === event.currentTarget) {
			onClose?.();
		}
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-overlay p-4"
			style={{ zIndex }}
			onClick={handleBackdropClick}
			role="dialog"
			aria-modal="true"
		>
			<div
				className={cn(
					"w-full rounded-md border border-border bg-surface p-4 sm:p-6 shadow-lg",
					sizeClasses[size],
					scrollable && "max-h-[90vh] overflow-y-auto",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
}
