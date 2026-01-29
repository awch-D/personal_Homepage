'use client'

import { useAuth, logout } from '@/lib/auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    User,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from '@/hooks/useTranslation'

function AdminLayoutContent({
    children,
}: {
    children: React.ReactNode
}) {
    const { user, loading } = useAuth()
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { t } = useTranslation()

    const navigation = [
        { name: t.nav.dashboard, href: '/admin', icon: LayoutDashboard },
        { name: t.nav.profile, href: '/admin/profile', icon: User },
        { name: t.nav.settings, href: '/admin/settings', icon: Settings },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // If we are on login page or not logged in (handled by middleware but safe check)
    if (!user && pathname !== '/admin/login') {
        return null // Middleware should handle redirect
    }

    if (pathname === '/admin/login') {
        return <>{children}</>
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Mobile sidebar overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-700">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                            Arno Admin
                        </span>
                        <button
                            className="ml-auto lg:hidden text-gray-400"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                    ${isActive
                                            ? 'bg-blue-600/10 text-blue-400'
                                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'}
                  `}
                                >
                                    <item.icon size={20} className="mr-3" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User & Logout */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center mb-4 px-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{user?.username}</p>
                                <p className="text-xs text-gray-500">{t.settings.adminUser}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={18} className="mr-3" />
                            {t.auth.signOut}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:pl-64 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden flex items-center px-4 border-b border-gray-700 bg-gray-800">
                    <button
                        className="text-gray-400"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>
                    <span className="ml-4 font-bold text-white">{t.nav.dashboard}</span>
                </header>

                <main className="flex-1 p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AdminLayoutContent>{children}</AdminLayoutContent>
    )
}
