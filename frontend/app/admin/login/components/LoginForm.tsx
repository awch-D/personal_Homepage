'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface LoginFormProps {
    onSubmit: (username: string, password: string, captchaCode: string) => void
    isLoading: boolean
    error?: string
    captchaImage: string
    captchaCode: string
    setCaptchaCode: (code: string) => void
    onRefreshCaptcha: () => void
}

export default function LoginForm({
    onSubmit,
    isLoading,
    error,
    captchaImage,
    captchaCode,
    setCaptchaCode,
    onRefreshCaptcha
}: LoginFormProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(username, password, captchaCode)
    }

    return (
        <section className="flex flex-1 flex-col p-8 lg:p-12 border-b border-white/5 md:border-b-0 md:border-r">
            <div className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">shield_with_heart</span>
                </div>
                <h1 className="text-xs font-bold tracking-[0.3em] text-primary uppercase">Secure_OS v1.0</h1>
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-white uppercase font-display">System Login</h2>
                <p className="mt-2 text-sm text-white/50">Enter authorized credentials to decrypt access.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">System Identity</label>
                    <div className="group relative flex items-center rounded-full border border-white/10 bg-white/5 px-5 transition-all focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(160,249,6,0.2)]">
                        <span className="material-symbols-outlined text-white/30 mr-3">person</span>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-14 w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none placeholder:text-white/20 text-sm"
                            placeholder="Enter system ID"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Encrypted Key</label>
                    <div className="group relative flex items-center rounded-full border border-white/10 bg-white/5 px-5 transition-all focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(160,249,6,0.2)]">
                        <span className="material-symbols-outlined text-white/30 mr-3">key</span>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-14 w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none placeholder:text-white/20 text-sm tracking-widest"
                            placeholder="••••••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-white/30 hover:text-primary transition-colors focus:outline-none"
                        >
                            <span className="material-symbols-outlined">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Verification Code</label>
                    <div className="flex gap-4">
                        <div className="group relative flex-1 flex items-center rounded-full border border-white/10 bg-white/5 px-5 transition-all focus-within:border-primary focus-within:shadow-[0_0_15px_rgba(160,249,6,0.2)]">
                            <span className="material-symbols-outlined text-white/30 mr-3">verified_user</span>
                            <input
                                type="text"
                                value={captchaCode}
                                onChange={(e) => setCaptchaCode(e.target.value)}
                                className="h-14 w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none placeholder:text-white/20 text-sm tracking-[0.3em] uppercase"
                                placeholder="Code"
                                required
                            />
                        </div>
                        <button
                            type="button"
                            onClick={onRefreshCaptcha}
                            className="w-32 h-14 rounded-xl overflow-hidden cursor-pointer border border-white/10 bg-white/5 hover:border-primary/40 transition-all flex items-center justify-center relative group"
                            title="Refresh verification code"
                        >
                            {captchaImage ? (
                                <img
                                    src={captchaImage}
                                    alt="Captcha"
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="animate-spin h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full"></div>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-lg text-center animate-shake">
                        {error}
                    </div>
                )}

                <div className="pt-4 text-center">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={clsx(
                            "h-14 w-full rounded-full bg-primary font-bold text-background-dark transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase",
                            !isLoading && "hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(160,249,6,0.4)]"
                        )}
                    >
                        {isLoading ? 'Decrypting Access...' : 'Initialize Uplink'}
                    </button>
                    <p className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest text-primary/40 uppercase">
                        <span className={clsx("h-1.5 w-1.5 rounded-full bg-primary", isLoading && "animate-pulse")}></span>
                        {isLoading ? 'Establishing Secure Link...' : 'Waiting for Authorized User...'}
                    </p>
                </div>
            </form>

            <style jsx>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus {
                    -webkit-text-fill-color: white;
                    -webkit-box-shadow: 0 0 0px 1000px transparent inset;
                    transition: background-color 5000s ease-in-out 0s;
                }
                input {
                    outline: none !important;
                    box-shadow: none !important;
                }
            `}</style>
        </section>
    )
}
