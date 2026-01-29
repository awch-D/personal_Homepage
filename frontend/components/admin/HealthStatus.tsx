import { Activity, Database, Server } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

interface HealthStatusProps {
    status: {
        overall: string
        database: string
        redis: string
    }
}

export default function HealthStatus({ status }: HealthStatusProps) {
    const { t } = useTranslation()

    const getStatusColor = (s: string) => {
        if (s === 'healthy') return 'text-green-500'
        if (s === 'degraded') return 'text-yellow-500'
        return 'text-red-500'
    }

    const getStatusBg = (s: string) => {
        if (s === 'healthy') return 'bg-green-500'
        if (s === 'degraded') return 'bg-yellow-500'
        return 'bg-red-500'
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <Activity className="mr-2" size={20} />
                {t.dashboard.systemHealth}
            </h3>

            <div className="space-y-6">
                {/* Overall Status */}
                <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <span className="text-gray-300 font-medium">{t.dashboard.overallStatus}</span>
                    <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${getStatusBg(status.overall)} animate-pulse`}></span>
                        <span className={`capitalize font-medium ${getStatusColor(status.overall)}`}>
                            {status.overall}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Database */}
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-2">
                            <Database size={16} className="text-blue-400 mr-2" />
                            <span className="text-gray-400 text-sm">{t.dashboard.database}</span>
                        </div>
                        <span className={`capitalize font-medium ${getStatusColor(status.database)}`}>
                            {status.database === "healthy" ? "Connected" : "Error"}
                        </span>
                    </div>

                    {/* Redis */}
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-700">
                        <div className="flex items-center mb-2">
                            <Server size={16} className="text-red-400 mr-2" />
                            <span className="text-gray-400 text-sm">{t.dashboard.redis}</span>
                        </div>
                        <span className={`capitalize font-medium ${getStatusColor(status.redis)}`}>
                            {status.redis === "healthy" ? "Connected" : "Error"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
