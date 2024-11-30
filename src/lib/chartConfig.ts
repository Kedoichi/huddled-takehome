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

export const chartOptions = {
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
        },
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