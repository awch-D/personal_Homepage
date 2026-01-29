'use client'

import Header from '@/components/home/Header'
import Footer from '@/components/home/Footer'
import HeroCard from '@/components/home/HeroCard'
import ActivityHeatmap from '@/components/home/ActivityHeatmap'
import TechStackCard from '@/components/home/TechStackCard'
import AiTerminal from '@/components/home/AiTerminal'
import FeaturedProjectCard from '@/components/home/FeaturedProjectCard'
import CurrentFocusCard from '@/components/home/CurrentFocusCard'

export default function Home() {
    return (
        <>
            <Header />
            <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-20">
                <div className="bento-grid">
                    <HeroCard />
                    <TechStackCard />
                    <ActivityHeatmap />
                    <AiTerminal />
                    <FeaturedProjectCard />
                    <CurrentFocusCard />
                </div>
                <Footer />
            </main>

            {/* Overlay Visuals */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.05] overflow-hidden z-50">
                <div className="scanline h-1/2 w-full animate-pulse top-0"></div>
                <div className="scanline h-1 w-full top-1/4"></div>
                <div className="scanline h-1 w-full top-3/4"></div>
            </div>
        </>
    )
}
