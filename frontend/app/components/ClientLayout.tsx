'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { LanguageProvider } from '@/contexts/LanguageContext'

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isAdminPage = pathname?.startsWith('/admin')

    return (
        <LanguageProvider>
            {!isAdminPage && <Header />}
            <main className={`min-h-screen ${!isAdminPage ? 'pt-32' : ''}`}>
                {children}
            </main>
            {!isAdminPage && <Footer />}
        </LanguageProvider>
    )
}
