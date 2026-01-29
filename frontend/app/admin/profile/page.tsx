'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Save, Play, RefreshCw, FileJson } from 'lucide-react'
import Link from 'next/link'
import JsonEditor from '@/components/admin/JsonEditor'
import ProfileUpload from '@/components/admin/ProfileUpload'
import { useTranslation } from '@/hooks/useTranslation'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ProfilePage() {
    const { data: profile, mutate } = useSWR('/api/admin/profile', fetcher)
    const [editedJson, setEditedJson] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const { t } = useTranslation()

    // Initialize editor content when data loads
    if (profile && !editedJson && Object.keys(profile).length > 0) {
        setEditedJson(JSON.stringify(profile, null, 2))
    }

    const handleSave = async () => {
        try {
            setIsSaving(true)
            const parsed = JSON.parse(editedJson)

            const res = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsed),
            })

            if (!res.ok) throw new Error('Save failed')

            setMessage({ type: 'success', text: 'Profile saved successfully' })
            mutate() // Refresh data
        } catch (err) {
            setMessage({ type: 'error', text: 'Invalid JSON or save failed' })
        } finally {
            setIsSaving(false)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    const handleImport = async () => {
        if (!confirm(`${t.common.confirm} ${t.profile.rebuildIndex}?`)) return

        try {
            setIsImporting(true)
            const res = await fetch('/api/admin/profile/import', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: 'Import completed successfully' })
            } else {
                throw new Error(data.message)
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Import failed' })
        } finally {
            setIsImporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">{t.profile.title}</h1>
                    <p className="text-gray-400 mt-1">{t.profile.subtitle}</p>
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/admin/profile/preview"
                        className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                        <Play size={18} className="mr-2" />
                        {t.profile.testChat}
                    </Link>

                    <button
                        onClick={handleImport}
                        disabled={isImporting}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-600 transition-colors"
                    >
                        <RefreshCw size={18} className={`mr-2 ${isImporting ? 'animate-spin' : ''}`} />
                        {isImporting ? t.profile.importing : t.profile.rebuildIndex}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-600 transition-colors"
                    >
                        <Save size={18} className="mr-2" />
                        {isSaving ? t.common.saving : t.profile.saveJson}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {profile ? (
                        <JsonEditor
                            value={editedJson || '{}'}
                            onChange={(val) => setEditedJson(val || '')}
                        />
                    ) : (
                        <div className="h-[600px] bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t.profile.uploadTitle}</h3>
                        <ProfileUpload onUploadSuccess={() => mutate()} />
                        <p className="text-xs text-gray-500 mt-4">
                            {t.profile.uploadDesc}
                        </p>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-semibold text-white mb-4">{t.profile.stats}</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">{t.profile.categories}</span>
                                <span className="text-white font-medium">{Object.keys(profile?.personal_info || {}).length}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">{t.profile.projects}</span>
                                <span className="text-white font-medium">{profile?.projects?.length || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">{t.profile.totalSize}</span>
                                <span className="text-white font-medium">
                                    {editedJson ? (editedJson.length / 1024).toFixed(2) : 0} KB
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
