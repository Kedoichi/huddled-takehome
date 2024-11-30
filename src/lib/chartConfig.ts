export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const colors = [
    '#FF6384', // Sunday - Red
    '#36A2EB', // Monday - Blue  
    '#FFCE56', // Tuesday - Yellow
    '#4BC0C0', // Wednesday - Teal
    '#9966FF', // Thursday - Purple
    '#FF9F40', // Friday - Orange
    '#2ecc71'  // Saturday - Green
];


const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index' as const,
        intersect: false
    },
    plugins: {
        tooltip: {
            mode: 'index' as const,
            intersect: false
        }
    }
};

export const hourlyChartOptions = {
    ...baseChartOptions,
    plugins: {
        ...baseChartOptions.plugins,
        legend: {
            position: 'bottom' as const,
            labels: {
                usePointStyle: true,
                padding: 20
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Engagement Score'
            },
            grid: {
                color: '#e2e8f0'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Hour of Day (Local Time)'
            },
            grid: {
                color: '#e2e8f0'
            }
        }
    }
};

// Daily engagement chart options
export const dailyChartOptions = {
    ...baseChartOptions,
    plugins: {
        ...baseChartOptions.plugins,
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Average Engagement'
            },
            grid: {
                color: '#e2e8f0'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Day of Week'
            },
            grid: {
                color: '#e2e8f0'
            }
        }
    }
};

// Pie chart options for engagement types
export const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'right' as const,
            labels: {
                usePointStyle: true,
                padding: 20
            }
        },
        tooltip: {
            callbacks: {
                label: (context: any) => `${context.label}: ${context.raw} points`
            }
        }
    }
};

// Dataset styles for each chart type
export const chartStyles = {
    daily: {
        backgroundColor: '#e2e8f0',
        borderColor: '#64748b',
        borderWidth: 1
    },
    pie: {
        backgroundColor: colors.slice(0, 4),  // Use first 4 colors for the 4 engagement types
        borderWidth: 1
    }
};