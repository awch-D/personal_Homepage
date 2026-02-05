'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function FeaturedProjectCard() {
    const { data: project } = useSWR('/api/profile/featured-project', fetcher)

    return (
        <div className="glass-card p-0 rounded-xl overflow-hidden relative group" style={{ gridArea: 'project' }}>
            <div className="absolute inset-0 bg-deep-sea opacity-40"></div>
            <div className="h-48 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent z-10"></div>
                <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${project?.image_url}')` }}
                >
                </div>
            </div>
            <div className="p-6 relative z-20 -mt-10">
                <div className="bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-3 uppercase tracking-tighter">Featured Lab</div>
                <h4 className="text-xl font-bold mb-2">{project?.title || 'DeepSea Vision'}</h4>
                <p className="text-xs text-white/60 mb-4 line-clamp-2">
                    {project?.description || 'Real-time object detection model for autonomous underwater vehicles.'}
                </p>
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">code</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[16px]">analytics</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-primary hover:translate-x-1 transition-transform cursor-pointer">arrow_forward</span>
                </div>
            </div>
        </div>
    )
}
