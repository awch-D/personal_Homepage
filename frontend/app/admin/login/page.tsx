'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [captchaId, setCaptchaId] = useState('')
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaImage, setCaptchaImage] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { t } = useTranslation()

    const fetchCaptcha = async () => {
        try {
            const res = await fetch('/api/admin/captcha')
            const data = await res.json()
            setCaptchaId(data.captcha_id)
            setCaptchaImage(data.image)
            setCaptchaCode('')
        } catch (err) {
            console.error('Failed to load captcha')
        }
    }

    // Load captcha on mount
    useEffect(() => {
        fetchCaptcha()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const res = await login(username, password, captchaId, captchaCode)
            if (res.success) {
                router.push('/admin')
            } else {
                setError(res.message)
                fetchCaptcha() // Refresh captcha on error
            }
        } catch (err) {
            setError('An unexpected error occurred')
            fetchCaptcha()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl">
                        🔒
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-white">
                        {t.auth.loginTitle}
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        {t.auth.loginSubtitle}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="username" className="sr-only">{t.auth.username}</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                                placeholder={t.auth.username}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">{t.auth.password}</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                                placeholder={t.auth.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label htmlFor="captcha" className="sr-only">{t.auth.verificationCode}</label>
                                <input
                                    id="captcha"
                                    name="captcha"
                                    type="text"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 border border-gray-700 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                                    placeholder={t.auth.verificationCode}
                                    value={captchaCode}
                                    onChange={(e) => setCaptchaCode(e.target.value)}
                                />
                            </div>
                            <div
                                className="w-32 h-[46px] rounded-xl overflow-hidden cursor-pointer border border-gray-700 relative bg-gray-600"
                                onClick={fetchCaptcha}
                                title={t.auth.refreshCaptcha}
                            >
                                {captchaImage ? (
                                    <img
                                        src={captchaImage}
                                        alt="Captcha"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-white"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-500/10 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? t.auth.signingIn : t.auth.signIn}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
