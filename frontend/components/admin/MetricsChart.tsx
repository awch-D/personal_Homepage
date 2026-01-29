'use client'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface MetricsChartProps {
    data: {
        dates: string[]
        values: number[]
    }
    title: string
    color: string
}

export default function MetricsChart({ data, title, color }: MetricsChartProps) {
    const chartData = {
        labels: data.dates,
        datasets: [
            {
                label: title,
                data: data.values,
                fill: true,
                borderColor: color,
                backgroundColor: color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
                tension: 0.4,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: '#1f2937',
                titleColor: '#f3f4f6',
                bodyColor: '#d1d5db',
                borderColor: '#374151',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false,
                },
                ticks: {
                    color: '#6b7280',
                },
            },
            y: {
                grid: {
                    color: '#374151',
                    drawBorder: false,
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#6b7280',
                },
                beginAtZero: true,
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false,
        },
    }

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 h-[300px]">
            <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
            <div className="h-[220px]">
                <Line options={options} data={chartData} />
            </div>
        </div>
    )
}
