'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const LOG_LINES = [
    "> ATTACHING NEURAL_LINK_PROT_V4...",
    "> HANDSHAKE SUCCESSFUL [TOKEN: 0x8F22...]",
    "> VALIDATING HARDWARE SIGNATURE...",
    "> SCANNING BIOMETRIC OVERLAY...",
    "> REMOTE_ADDR: 192.168.1.254",
    "> ACCESSING ENCRYPTED VAULT [ZONE_A1]",
    "> SYSTEM READY. AWAITING INPUT."
]

export default function LoginVisual() {
    const [visibleLogs, setVisibleLogs] = useState<string[]>([])

    useEffect(() => {
        let current = 0
        const interval = setInterval(() => {
            if (current <= LOG_LINES.length) {
                setVisibleLogs(LOG_LINES.slice(0, current))
                current++
            } else {
                clearInterval(interval)
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <section className="flex flex-1 flex-col bg-black/30 p-8 lg:p-12 relative overflow-hidden">
            <div className="flex flex-1 flex-col items-center justify-center py-12">
                {/* Geometric Lock Visual */}
                <div className="relative mb-12 flex h-48 w-48 items-center justify-center">
                    {/* Outer slow spinning ring */}
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Middle reverse spinning ring */}
                    <motion.div
                        className="absolute inset-4 rounded-full border border-primary/10"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Inner pulse ring */}
                    <motion.div
                        className="absolute inset-8 rounded-full border-2 border-primary/5"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />

                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-primary/5 shadow-[0_0_40px_rgba(160,249,6,0.1)] border border-primary/10">
                        <motion.span
                            className="material-symbols-outlined text-7xl text-primary font-light"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            lock
                        </motion.span>
                    </div>

                    {/* Floating Data Points */}
                    <div className="absolute top-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                        01
                    </div>
                    <div className="absolute bottom-4 left-0 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">
                        XY
                    </div>
                </div>

                {/* Scrolling Terminal Text */}
                <div className="w-full font-mono text-[10px] leading-relaxed text-white/30 h-32 overflow-hidden flex flex-col justify-end">
                    <div className="space-y-1 transition-all duration-500">
                        {visibleLogs.map((log, i) => (
                            <p key={i} className={i === visibleLogs.length - 1 ? "text-primary/60 font-bold" : ""}>
                                {log}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto border-t border-white/5 pt-6">
                <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-white/20 uppercase">
                    <span>Authorized Personnel Only</span>
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></span>
                        <span>Secure Link Established</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
