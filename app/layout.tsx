import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shaman - Your AI Assistant',
  description: 'Shaman is an AI assistant that helps you with your tasks, powered by Gemini.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
