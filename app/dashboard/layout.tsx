// app/dashboard/layout.tsx
"use client";

import { useAuth } from "../contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-900">
                <Loader2 className="h-8 w-8 animate-spin text-stone-700 dark:text-stone-300" />
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect in the useEffect
    }

    return <>{children}</>;
}