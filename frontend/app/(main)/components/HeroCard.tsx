'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function HeroCard() {
    const { data: profile } = useSWR('/api/profile/info', fetcher)

    return (
        <div className="glass-card p-10 rounded-xl flex flex-col justify-end min-h-[440px] relative overflow-hidden group" style={{ gridArea: 'hero' }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50"></div>
            <div className="relative z-10">
                <p className="text-primary font-mono mb-4 text-sm tracking-[0.2em]">&lt;{profile?.title || 'ROOT_USER'} /&gt;</p>
                <h1 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter mb-6 uppercase">
                    {profile?.name ? (
                        <>
                            {profile.name.split(' ')[0]}<br />{profile.name.split(' ').slice(1).join(' ')}
                        </>
                    ) : (
                        <>STEVE<br />ARNO</>
                    )}
                </h1>
                <p className="text-xl text-white/60 max-w-md font-light leading-relaxed">
                    Engineering the next generation of <span className="text-white font-medium">neural interfaces</span> and high-performance decentralized systems.
                </p>
                <div className="mt-8 flex gap-4">
                    <button className="bg-primary text-black font-bold py-3 px-8 rounded-lg hover:shadow-[0_0_20px_rgba(56,255,20,0.4)] transition-all flex items-center gap-2">
                        <span>Initialize Manifest</span>
                        <span className="material-symbols-outlined text-sm">arrow_outward</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
