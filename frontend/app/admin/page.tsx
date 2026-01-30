'use client'

import useSWR from 'swr'
import {
    Users,
    MessageSquare,
    Cpu,
    Zap,
    Globe
} from 'lucide-react'
import StatsCard from '@/components/admin/StatsCard'
import MetricsChart from '@/components/admin/MetricsChart'
import HealthStatus from '@/components/admin/HealthStatus'
import { useTranslation } from '@/hooks/useTranslation'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AdminDashboard() {
    const { t } = useTranslation()

    const { data: fullData } = useSWR('/api/admin/dashboard/full', fetcher, { revalidateOnFocus: false })

    if (!fullData) {
        return <div className="animate-pulse space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
                ))}
            </div>
        </div>
    }

    const { overview, metrics, health } = fullData;

    // Transform metrics for charts
    const requestMetrics = {
        dates: Object.keys(metrics['llm.requests'] || {}),
        values: Object.values(metrics['llm.requests'] || {}) as number[]
    }

    const tokenMetrics = {
        dates: Object.keys(metrics['llm.tokens'] || {}),
        values: Object.values(metrics['llm.tokens'] || {}) as number[]
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-white">{t.dashboard.title}</h1>
                <p className="text-gray-400 mt-1">{t.dashboard.subtitle}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title={t.dashboard.totalRequests}
                    value={overview.total_requests}
                    icon={Globe}
                    color="blue"
                />
                <StatsCard
                    title={t.dashboard.totalCost}
                    value={`$${overview.total_cost.toFixed(4)}`}
                    icon={Zap}
                    color="yellow"
                    description={t.dashboard.queryCost}
                />
                <StatsCard
                    title={t.dashboard.llmTokens}
                    value={overview.total_tokens}
                    icon={MessageSquare}
                    color="purple"
                />
                <StatsCard
                    title={t.dashboard.cacheUsed}
                    value={overview.cache.memory_used}
                    icon={Cpu}
                    color="green"
                    description={`${overview.cache.keys} ${t.dashboard.keys}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Section */}
                <div className="lg:col-span-2 space-y-8">
                    <MetricsChart
                        title={t.dashboard.dailyRequests}
                        data={requestMetrics}
                        color="rgb(59, 130, 246)"
                    />
                    <MetricsChart
                        title={t.dashboard.tokenUsage}
                        data={tokenMetrics}
                        color="rgb(168, 85, 247)"
                    />
                </div>

                {/* Health Section */}
                <div className="lg:col-span-1">
                    <HealthStatus status={health} />
                </div>
            </div>
        </div>
    )
}
