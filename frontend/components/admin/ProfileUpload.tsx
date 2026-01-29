'use client'

import { useState, useRef } from 'react'
import { Upload, FileJson } from 'lucide-react'

interface ProfileUploadProps {
    onUploadSuccess: () => void
}

export default function ProfileUpload({ onUploadSuccess }: ProfileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.json')) {
            setError('Please upload a JSON file')
            return
        }

        setIsUploading(true)
        setError('')

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/admin/profile/upload', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                throw new Error('Upload failed')
            }

            const data = await res.json()
            if (data.success) {
                onUploadSuccess()
            } else {
                setError(data.message || 'Upload failed')
            }
        } catch (err) {
            setError('Upload failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    return (
        <div
            className={`
        border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
        ${isDragging
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'}
      `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            <div className="flex flex-col items-center">
                {isUploading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                ) : (
                    <div className="p-4 bg-gray-800 rounded-full mb-4">
                        <Upload className="text-blue-500" size={32} />
                    </div>
                )}

                <h3 className="text-lg font-medium text-white mb-2">
                    {isUploading ? 'Uploading...' : 'Drop profile.json here'}
                </h3>
                <p className="text-gray-400 text-sm">
                    or click to browse
                </p>

                {error && (
                    <p className="mt-4 text-red-500 text-sm bg-red-500/10 px-3 py-1 rounded-full">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}
