import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Arno - AI Engineer',
    description: 'Personal homepage with AI-powered chat assistant',
}

import { LanguageProvider } from '@/contexts/LanguageContext'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" className="dark">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen">
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </body>
        </html>
    )
}
