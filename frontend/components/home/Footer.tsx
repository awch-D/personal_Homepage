'use client'

import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="mt-12 flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-8 pb-8">
            <div className="flex items-center gap-6">
                <Link href="#" className="opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">public</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Twitter</span>
                </Link>
                <Link href="#" className="opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">terminal</span>
                    <span className="text-xs font-bold uppercase tracking-widest">GitHub</span>
                </Link>
                <Link href="#" className="opacity-40 hover:opacity-100 hover:text-primary transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">link</span>
                    <span className="text-xs font-bold uppercase tracking-widest">LinkedIn</span>
                </Link>
            </div>
            <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
                <p className="text-[10px] opacity-30 font-mono">BUILT_ON_SUBSTRATE_V2.0 // © 2026 STEVE_ARNO_ARCHITECT</p>
                <p className="text-[10px] text-primary font-mono tracking-tighter uppercase">Available for architectural consultation & strategic AI development</p>
                <a
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-primary/60 hover:text-primary transition-colors font-mono tracking-widest mt-2 border-b border-transparent hover:border-primary"
                >
                    赣ICP备2026001626号-1
                </a>
            </div>
        </footer>
    )
}
