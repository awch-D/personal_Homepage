import HeroCard from './components/HeroCard'
import ActivityHeatmap from './components/ActivityHeatmap'
import TechStackCard from './components/TechStackCard'
import AiTerminal from './components/AiTerminal'
import FeaturedProjectCard from './components/FeaturedProjectCard'
import CurrentFocusCard from './components/CurrentFocusCard'

export default function Home() {
    return (
        <div className="max-w-[1200px] mx-auto px-6 pb-20">
            <div className="bento-grid">
                <HeroCard />
                <TechStackCard />
                <ActivityHeatmap />
                <AiTerminal />
                <FeaturedProjectCard />
                <CurrentFocusCard />
            </div>
        </div>
    )
}
