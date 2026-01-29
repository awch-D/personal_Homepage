'use client'

import Link from 'next/link'

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 px-6 py-4 flex justify-center">
            <nav className="max-w-[1200px] w-full flex items-center justify-between glass-card px-6 py-3 rounded-full border-white/5 bg-black/40">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">terminal</span>
                    <span className="font-bold tracking-tighter text-lg uppercase">ARCHITECT_V2</span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-medium opacity-80">
                    <Link href="#" className="hover:text-primary transition-colors">Nodes</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Neural Assets</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Logs</Link>
                    <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-[10px] font-bold text-primary tracking-widest uppercase">System Online</span>
                    </div>
                </div>
            </nav>
        </header>
    )
}
