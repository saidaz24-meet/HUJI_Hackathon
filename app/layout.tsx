// app/layout.tsx
import type React from "react"
import "./globals.css"
import "./components/animations.css"
import { Providers } from "./providers"

export const metadata = {
    title: "Shaman App",
    description: "Your personal assistant for paperwork",
    generator: "v0.dev",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className="transition-colors duration-300 bg-stone-50 dark:bg-stone-900">
        <Providers>
            {children}
        </Providers>
        </body>
        </html>
    )
}