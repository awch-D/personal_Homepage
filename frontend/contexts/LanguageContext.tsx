'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { en, LocaleType } from '../locales/en'
import { zh } from '../locales/zh'

type Language = 'en' | 'zh'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: LocaleType
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('zh')

    // Load saved language preference
    useEffect(() => {
        const saved = localStorage.getItem('admin_language') as Language
        if (saved && (saved === 'en' || saved === 'zh')) {
            setLanguage(saved)
        }
    }, [])

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang)
        localStorage.setItem('admin_language', lang)
    }

    const t = language === 'zh' ? zh : en

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
