'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/lib/auth'
import LoginForm from './components/LoginForm'
import LoginVisual from './components/LoginVisual'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [captchaId, setCaptchaId] = useState('')
    const [captchaCode, setCaptchaCode] = useState('')
    const [captchaImage, setCaptchaImage] = useState('')
    const router = useRouter()

    const fetchCaptcha = async () => {
        try {
            const res = await fetch('/api/admin/captcha')
            const data = await res.json()
            setCaptchaId(data.captcha_id)
            setCaptchaImage(data.image)
            setCaptchaCode('')
        } catch (err) {
            console.error('Failed to load captcha')
            setError('CRITICAL: Failed to initialize captcha service.')
        }
    }

    // Load captcha on mount
    useEffect(() => {
        fetchCaptcha()
    }, [])

    const handleLogin = async (username: string, password: string, code: string) => {
        if (!code) {
            setError('VERIFICATION_REQUIRED: Code cannot be empty.')
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const res = await login(username, password, captchaId, code)
            if (res.success) {
                router.push('/admin')
            } else {
                setError(`AUTH_FAILED: ${res.message}`)
                fetchCaptcha() // Refresh captcha on error
            }
        } catch (err) {
            setError('CRITICAL_ERROR: Uplink connection refused.')
            fetchCaptcha()
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 min-h-screen bg-background-dark text-white overflow-hidden selection:bg-primary/30">
            {/* Immersive Neural Background */}
            <div className="absolute inset-0 z-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" fill="#a0f906" opacity="0.2" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path d="M0 100 Q 250 50 500 150 T 1000 100" fill="transparent" stroke="#a0f906" strokeWidth="0.5" opacity="0.1" />
                    <path d="M-100 300 Q 300 150 700 350 T 1200 250" fill="transparent" stroke="#a0f906" strokeWidth="0.5" opacity="0.1" />
                </svg>
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
                <main className="glass-panel flex w-full max-w-5xl flex-col md:flex-row overflow-hidden rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 bg-black/40 backdrop-blur-2xl">
                    <LoginForm
                        onSubmit={handleLogin}
                        isLoading={isLoading}
                        error={error}
                        captchaImage={captchaImage}
                        captchaCode={captchaCode}
                        setCaptchaCode={setCaptchaCode}
                        onRefreshCaptcha={fetchCaptcha}
                    />
                    <LoginVisual />
                </main>
            </div>

            {/* Floating UI Elements */}
            <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-6 pointer-events-none">
                <div className="flex items-center gap-6 pointer-events-auto">
                    <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_#a0f906]"></div>
                    <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase font-mono">Central_Node_Online</span>
                </div>
                <div className="flex items-center gap-8 pointer-events-auto hidden md:flex">
                    <span className="text-[10px] font-bold tracking-widest text-white/20 uppercase font-mono tracking-tighter cursor-help hover:text-primary transition-colors">Emergency_Override</span>
                    <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm text-white/30">settings</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass-panel {
                    border: 1px solid rgba(160, 249, 6, 0.1);
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    )
}
