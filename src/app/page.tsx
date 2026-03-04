"use client";

import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import AuthPage from "@/components/auth/AuthPage";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function Home() {
	const { user, loading } = useAuth();
	const router = useRouter();

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen w-full bg-light dark:bg-dark">
				<LoadingSpinner />
			</div>
		);
	}

	return user ? <Dashboard /> : <AuthPage />;
}
