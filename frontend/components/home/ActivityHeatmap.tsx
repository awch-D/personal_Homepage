'use client'

import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ActivityHeatmap() {
    const { data: activity } = useSWR('/api/profile/github-activity', fetcher)
    const [heatmapBoxes, setHeatmapBoxes] = useState<number[]>([])

    useEffect(() => {
        // Generate random heatmap data on client-side to match the original effect
        // In a real app this would likely come from the API
        const boxes = Array.from({ length: 52 * 4 }, () => Math.floor(Math.random() * 5))
        setHeatmapBoxes(boxes)
    }, [])

    const colors = ['bg-white/5', 'bg-primary/20', 'bg-primary/40', 'bg-primary/60', 'bg-primary']

    return (
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between" style={{ gridArea: 'activity' }}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold tracking-widest uppercase opacity-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">monitoring</span>
                    Neural Contributions
                </h3>
                <span className="text-[10px] font-mono opacity-40">{activity?.total_commits_year || 2482} TOTAL COMMITS / 2024</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
                {heatmapBoxes.map((level, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${colors[level]}`}></div>
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
