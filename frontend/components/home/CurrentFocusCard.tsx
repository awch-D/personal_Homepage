'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function CurrentFocusCard() {
    const { data: focus } = useSWR('/api/profile/current-focus', fetcher)

    // Calculate width percentage safely
    const progress = focus?.progress || 85
    const widthStyle = { width: `${progress}%` }

    return (
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between" style={{ gridArea: 'stack' }}>
            <h3 className="text-[10px] font-bold tracking-widest uppercase opacity-40 mb-2">Current Focus</h3>
            <div className="flex items-center gap-3">
                <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                </div>
                <div>
                    <p className="text-xs font-bold">{focus?.topic || 'Multi-Agent Systems'}</p>
                    <p className="text-[9px] opacity-40 uppercase">{focus?.subtitle || 'Orchestration & Logic'}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={widthStyle}></div>
                </div>
                <div className="flex justify-between text-[8px] opacity-40 uppercase font-mono">
                    <span>Learning Curve</span>
                    <span>{focus?.efficiency || 85}% Efficient</span>
                </div>
            </div>
        </div>
    )
}
