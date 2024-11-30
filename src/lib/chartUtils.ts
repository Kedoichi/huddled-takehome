import { dayNames, colors, chartOptions } from './chartConfig';
import type { Chart, ChartData, ChartOptions } from 'chart.js';

// Interfaces
interface EngagementData {
    artist_id: number;
    artist_name: string;
    local_hour: number;
    day_of_week: string;
    total_engagement: number;
    event_count: number;
}

interface DayAggregation {
    weekday: number[];   // 24 hours data for weekdays (avg)
    weekend: number[];   // 24 hours data for weekends (avg)
    allDays: number[];   // 24 hours data for all days (avg)
}

interface HourlyStats {
    weekday: { sum: number; count: number; };
    weekend: { sum: number; count: number; };
    all: { sum: number; count: number; };
}

// Utility functions
export function aggregateHourlyData(artistData: EngagementData[]): DayAggregation {
    const hourlyData: HourlyStats[] = Array(24).fill(0).map(() => ({
        weekday: { sum: 0, count: 0 },
        weekend: { sum: 0, count: 0 },
        all: { sum: 0, count: 0 }
    }));

    artistData.forEach(entry => {
        const hour = Number(entry.local_hour);
        const dayOfWeek = Number(entry.day_of_week);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) {
            hourlyData[hour].weekend.sum += entry.total_engagement;
            hourlyData[hour].weekend.count++;
        } else {
            hourlyData[hour].weekday.sum += entry.total_engagement;
            hourlyData[hour].weekday.count++;
        }
        hourlyData[hour].all.sum += entry.total_engagement;
        hourlyData[hour].all.count++;
    });

    return {
        weekday: hourlyData.map(h => h.weekday.sum / (h.weekday.count || 1)),
        weekend: hourlyData.map(h => h.weekend.sum / (h.weekend.count || 1)),
        allDays: hourlyData.map(h => h.all.sum / (h.all.count || 1))
    };
}

export function createEngagementChartConfig(
    selectedArtist: string,
    aggregatedData: DayAggregation,
    mode: 'all' | 'split' = 'all'
): { data: ChartData; options: ChartOptions } {
    const datasets = mode === 'split' 
        ? [
            {
                label: 'Weekdays',
                data: aggregatedData.weekday,
                borderColor: colors[1],
                backgroundColor: `${colors[1]}33`,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: 'Weekends',
                data: aggregatedData.weekend,
                borderColor: colors[0],
                backgroundColor: `${colors[0]}33`,
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }
        ]
        : [{
            label: 'All',
            data: aggregatedData.allDays,
            borderColor: colors[2],
            backgroundColor: `${colors[2]}33`,
            borderWidth: 2,
            tension: 0.4,
            fill: false
        }];

    return {
        data: {
            labels: Array.from({ length: 24 }, (_, i) => 
                `${i.toString().padStart(2, '0')}:00`
            ),
            datasets
        },
        options: {
            ...chartOptions,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                ...chartOptions.plugins,
                title: {
                    display: true,
                    text: `Hourly Engagement Pattern for ${selectedArtist}`,
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} points`;
                        }
                    }
                }
            }
        }
    };
}

export function sortArtists(artists: { name: string }[]): { name: string }[] {
    return [...artists].sort((a, b) => {
        const numA = parseInt(a.name.replace('Artist ', ''));
        const numB = parseInt(b.name.replace('Artist ', ''));
        return numA - numB;
    });
}

export function processWeekdayData(data: EngagementData[]): number[] {
    const weekdayData = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);

    data.forEach(entry => {
        const day = Number(entry.day_of_week);
        if (!isNaN(day) && day >= 0 && day < 7) {
            weekdayData[day] += entry.total_engagement;
            weekdayCounts[day]++;
        }
    });

    return weekdayData.map((sum, index) => 
        sum / (weekdayCounts[index] || 1)
    );
}