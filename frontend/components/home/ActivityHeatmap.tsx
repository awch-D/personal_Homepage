'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ActivityHeatmap() {
    const { data: activity, error, isLoading } = useSWR('/api/profile/github-activity', fetcher)

    // Define the type for our heatmap request
    type ContributionDay = {
        level: number
        count: number
        date: string
    }

    const [heatmapBoxes, setHeatmapBoxes] = useState<ContributionDay[]>([])

    useEffect(() => {
        if (activity?.heatmap && activity.heatmap.length > 0) {
            setHeatmapBoxes(activity.heatmap)
        } else if (activity) {
            // Fallback if activity loaded but heatmap is empty (shouldn't happen with updated backend but good for safety)
            const emptyBoxes: ContributionDay[] = Array.from({ length: 32 * 7 }).map((_, i) => ({
                level: 1,
                count: 0,
                date: 'N/A'
            }))
            setHeatmapBoxes(emptyBoxes)
        }
    }, [activity])

    // Level 1-5: 1=Empty, 2-5=Colors
    // Level 1-5: 1=Empty, 2-5=Colors
    // Using explicit hex values to ensure Tailwind JIT works correctly regardless of theme config
    const colors = [
        '', // 0 index unused
        'bg-white/5',                 // Level 1 (NONE)
        'bg-[#38ff14]/20',            // Level 2
        'bg-[#38ff14]/40',            // Level 3
        'bg-[#38ff14]/70',            // Level 4
        'bg-[#38ff14]'                // Level 5 (Cyber Lime)
    ]

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === 'N/A') return 'N/A'
        const date = new Date(dateString)
        const day = date.getDate()
        const suffix = (day >= 11 && day <= 13) ? 'th' :
            (day % 10 === 1) ? 'st' :
                (day % 10 === 2) ? 'nd' :
                    (day % 10 === 3) ? 'rd' : 'th'
        return date.toLocaleDateString('en-US', { month: 'long' }) + ` ${day}${suffix}`
    }

    if (error) return <div className="glass-card p-6 text-red-500">Failed to load GitHub data</div>
    if (isLoading) return <div className="glass-card p-6 animate-pulse">Loading contributions...</div>

    return (
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between" style={{ gridArea: 'activity' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold tracking-widest uppercase opacity-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">monitoring</span>
                    GitHub Contributions
                </h3>
                <span className="text-[10px] font-mono opacity-40">{activity?.total_commits_year || 0} TOTAL CONTRIBUTIONS</span>
            </div>

            {/* Debug Info (Only shows if empty) */}
            {heatmapBoxes.length === 0 && (
                <div className="text-xs text-yellow-500">
                    No contribution data found. (Data Length: {heatmapBoxes.length})
                </div>
            )}

            {/* Heatmap Grid: 32 columns x 7 rows. */}
            <div className="grid gap-[3px] w-full min-h-[100px]" style={{
                gridTemplateRows: 'repeat(7, 1fr)',
                gridAutoFlow: 'column',
                gridTemplateColumns: 'repeat(32, 1fr)'
            }}>
                {heatmapBoxes.map((day, i) => (
                    <div
                        key={i}
                        className={`w-full h-full min-w-[6px] min-h-[6px] rounded-[2px] ${colors[day.level] || 'bg-white/10'} group relative cursor-pointer hover:scale-125 transition-transform duration-200 z-0 hover:z-10`}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-black/90 text-white text-[10px] px-2 py-1 rounded shadow-lg z-20 pointer-events-none border border-white/10 backdrop-blur-sm whitespace-nowrap">
                            <span className="font-bold">{day.count}</span> contributions on <span className="opacity-75">{formatDate(day.date)}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between items-end">
                <div>
                    <p className="text-2xl font-bold">{activity?.uptime_reliability || 98.4}%</p>
                    <p className="text-[10px] uppercase opacity-40">Uptime Reliability</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{activity?.active_sprint || 'Active'}</p>
                    <p className="text-[10px] uppercase opacity-40">Current Sprint</p>
                </div>
            </div>
        </div>
    )
}
