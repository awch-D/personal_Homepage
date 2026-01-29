'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface TechItem {
    name: string
    icon: string
    highlight: boolean
    description: string
}

export default function TechStackCard() {
    const { data: stack } = useSWR<TechItem[]>('/api/profile/tech-stack', fetcher)

    return (
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between group" style={{ gridArea: 'tech' }}>
            <h3 className="text-sm font-bold tracking-widest uppercase opacity-50 mb-8">Base Layer Tech</h3>
            <div className="flex flex-wrap gap-6 justify-center items-center py-4">
                {stack?.map((item, index) => (
                    <div
                        key={item.name}
                        className="flex flex-col items-center gap-2 group/item"
                        style={{ transitionDelay: `${index * 75}ms` }}
                    >
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 group-hover/item:scale-125 group-hover/item:shadow-[0_0_20px_rgba(56,255,20,0.3)] bg-white/5 border-white/10 group-hover/item:border-primary/40 group-hover/item:bg-primary/5"
                        >
                            <span className="material-symbols-outlined transition-colors duration-300 group-hover/item:text-primary">
                                {item.icon}
                            </span>
                        </div>
                        <span className="text-[10px] opacity-40 transition-opacity duration-300 group-hover/item:opacity-100 group-hover/item:text-primary">{item.name}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs italic opacity-60">"Optimizing LLMs for edge-case inference latency..."</p>
            </div>
        </div>
    )
}
