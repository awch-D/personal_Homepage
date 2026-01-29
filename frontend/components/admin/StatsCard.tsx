import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: string
    trendUp?: boolean
    description?: string
    color?: string
}

export default function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    description,
    color = "blue"
}: StatsCardProps) {
    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-${color}-500/10 text-${color}-500`}>
                    <Icon size={24} />
                </div>
            </div>
            {(trend || description) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className={`font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
                            {trendUp ? '↑' : '↓'} {trend}
                        </span>
                    )}
                    {description && (
                        <span className="text-gray-500 ml-2">{description}</span>
                    )}
                </div>
            )}
        </div>
    )
}
