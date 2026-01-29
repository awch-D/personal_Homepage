'use client'

import { useState } from 'react'
import { ArrowLeft, Send, Search } from 'lucide-react'
import Link from 'next/link'

interface Source {
    content: string
    score: number
}

interface PreviewResult {
    query: string
    response: string
    sources: Source[]
}

export default function PreviewPage() {
    const [query, setQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<PreviewResult | null>(null)

    const handlePreview = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/profile/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })

            const data = await res.json()
            setResult(data)
        } catch (err) {
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/profile"
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-white">Chat Preview</h1>
                    <p className="text-gray-400 mt-1">Test RAG retrieval and generation</p>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <form onSubmit={handlePreview} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question about the profile..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-xl text-white font-medium flex items-center transition-colors"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2" />
                        ) : (
                            <Send size={18} className="mr-2" />
                        )}
                        Test
                    </button>
                </form>
            </div>

            {result && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Response */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">AI Response</h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                                {result.response}
                            </p>
                        </div>
                    </div>

                    {/* Retrieved Sources */}
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">Retrieved Context</h3>
                        <div className="space-y-4">
                            {result.sources.map((source, i) => (
                                <div key={i} className="bg-gray-900 p-4 rounded-lg text-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-mono text-gray-500">Source #{i + 1}</span>
                                        <span className="text-xs font-mono text-emerald-400">
                                            Score: {source.score.toFixed(4)}
                                        </span>
                                    </div>
                                    <p className="text-gray-300 line-clamp-4 hover:line-clamp-none transition-all">
                                        {source.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
