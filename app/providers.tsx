// app/providers.tsx
"use client";

import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "./contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </ThemeProvider>
    );
}