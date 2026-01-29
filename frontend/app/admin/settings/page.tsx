'use client'

import { useState } from 'react'
import { Trash2, Shield, Database, Layout, MessageSquare, Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function SettingsPage() {
    const [isClearing, setIsClearing] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const { t, language, setLanguage } = useTranslation()

    const handleClearCache = async (type: string) => {
        if (!confirm(`${t.common.confirm} ${type === 'all' ? t.settings.clearAll : type}?`)) return

        setIsClearing(type)
        try {
            const res = await fetch(`/api/admin/cache/clear?cache_type=${type}`, {
                method: 'POST',
            })

            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: data.message })
            } else {
                throw new Error(data.message)
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to clear cache' })
        } finally {
            setIsClearing(null)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const cacheOptions = [
        { id: 'answers', label: t.settings.chatAnswers, desc: 'Cached LLM responses (TTL: 1h)', icon: MessageSquare },
        { id: 'docs', label: t.settings.retrievedDocs, desc: 'Search results (TTL: 1d)', icon: Layout },
        { id: 'embeddings', label: t.settings.embeddings, desc: 'Vector cache (TTL: 7d)', icon: Database },
        { id: 'all', label: t.settings.clearAll, desc: 'Flush entire Redis database', icon: Trash2, danger: true },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{t.settings.title}</h1>
                <p className="text-gray-400 mt-1">{t.settings.subtitle}</p>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {/* Language Settings */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <Globe className="mr-2" size={20} />
                            {t.settings.language}
                        </h3>

                        <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                            <div>
                                <h4 className="text-white font-medium">{language === 'en' ? 'English' : '中文'}</h4>
                                <p className="text-sm text-gray-500">{t.settings.languageDesc}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    EN
                                </button>
                                <button
                                    onClick={() => setLanguage('zh')}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${language === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-white'}`}
                                >
                                    中文
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cache Management */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                            <Database className="mr-2" size={20} />
                            {t.settings.cache}
                        </h3>

                        <div className="space-y-4">
                            {cacheOptions.map((option) => (
                                <div
                                    key={option.id}
                                    className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-700"
                                >
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-lg mr-4 ${option.danger ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                            <option.icon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{option.label}</h4>
                                            <p className="text-sm text-gray-500">{option.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleClearCache(option.id)}
                                        disabled={!!isClearing}
                                        className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${option.danger
                                                ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-900'
                                                : 'bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:bg-gray-800'}
                  `}
                                    >
                                        {isClearing === option.id ? t.settings.clearing : t.settings.clear}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* System Info (Read Only) */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-fit">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                        <Shield className="mr-2" size={20} />
                        {t.settings.systemConfig}
                    </h3>

                    <div className="space-y-4">
                        <InfoItem label={t.settings.environment} value="Production (Docker)" />
                        <InfoItem label={t.settings.llmModel} value="GLM-4-Flash" />
                        <InfoItem label={t.settings.embeddingModel} value="text-embedding-v3" />
                        <InfoItem label={t.settings.rerankModel} value="gte-rerank" />
                        <InfoItem label={t.settings.vectorDb} value="PostgreSQL + pgvector" />
                        <InfoItem label={t.settings.adminUser} value="arno" />
                    </div>
                </div>
            </div>
        </div>
    )
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value}</span>
        </div>
    )
}


