<script lang="ts">
   import type { PageData } from "./$types";
   import { onMount } from 'svelte';
   import Chart from 'chart.js/auto';
   import { goto } from '$app/navigation';
   import { 
     aggregateHourlyData, 
     createEngagementChartConfig, 
     createDailyChartConfig,
     createEngagementTypesConfig,
     sortArtists,
     processWeekdayData 
   } from '$lib/chartUtils';
   import { 
    dayNames, 
    colors, 
    hourlyChartOptions, 
    dailyChartOptions, 
    pieChartOptions,
    chartStyles 
   } from '$lib/chartConfig';
   import ViewModeToggle from '$lib/components/ViewModeToggle.svelte';
   
   // Props and Data
   let { data }: PageData = $props();
   const { data: engagements, eventTypes, artists, metadata } = data;

   // Chart Elements
   let chartCanvas: HTMLCanvasElement;
   let weekdayChartCanvas: HTMLCanvasElement;
   let pieChartCanvas: HTMLCanvasElement;
   let historicalChartCanvas: HTMLCanvasElement;

   // State Management
   let selectedArtist = $state('Artist 1');
   let displayMode = $state<'all' | 'split'>('all');
   let viewMode = $state<'average' | 'historical'>(metadata.viewMode);
   let timeRange = $state<'day' | 'week' | 'month' | 'year'>(metadata.timeRange);
   let currentDate = $state(new Date(metadata.date));
   
   let isLoading = $state(true);
   let isNavigating = $state(false);


   let engagementTypes = $state([
       { label: 'Share Track', value: 0, color: colors[0] },
       { label: 'Like Track', value: 0, color: colors[1] },
       { label: 'Add to Playlist', value: 0, color: colors[2] },
       { label: 'Play Track', value: 0, color: colors[3] }
   ]);

   // Chart Instances
   let chart: Chart | null = null;
   let weekdayChart: Chart | null = null;
   let pieChart: Chart | null = null;
   let historicalChart: Chart | null = null;

   const sortedArtists = sortArtists(artists);
   
   // Navigation functions with loading state
   async function handleViewModeChange(event: CustomEvent<{ mode: 'average' | 'historical' }>) {
    if (isNavigating) return;
    try {
      isNavigating = true;
      viewMode = event.detail.mode;
      await updateURL();
    } finally {
      isNavigating = false;
    }
   }

   async function handleTimeRangeChange(event: CustomEvent<{ range: 'day' | 'week' | 'month' | 'year' }>) {
    if (isNavigating) return;
    try {
      isNavigating = true;
      timeRange = event.detail.range;
      await updateURL();
    } finally {
      isNavigating = false;
    }
   }

   async function handleDateChange(event: CustomEvent<{ date: Date }>) {
    if (isNavigating) return;
    try {
      isNavigating = true;
      currentDate = event.detail.date;
      await updateURL();
    } finally {
      isNavigating = false;
    }
   }

   async function updateURL() {
    const searchParams = new URLSearchParams({
      viewMode,
      timeRange,
      date: currentDate.toISOString().split('T')[0]
    });
    await goto(`?${searchParams.toString()}`, { keepfocus: true });
   }

   function updateHistoricalChart(artistData: any[]) {
    
       // Filter data based on the selected time range and date
       const filteredData = artistData.filter(d => {
           const eventDate = new Date(d.event_date);
           const start = new Date(currentDate);
           const end = new Date(currentDate);

           switch(timeRange) {
        case 'day':
            console.log("Checking 'day' range...");
            console.log("Current Date (Day):", currentDate.toDateString());
            console.log("Event Date (Day):", eventDate.toDateString());
            return eventDate.toDateString() === currentDate.toDateString();
            
        case 'week':
            console.log("Checking 'week' range...");
            start.setDate(currentDate.getDate() - currentDate.getDay());
            end.setDate(start.getDate() + 6);
            console.log("Start of the week:", start);
            console.log("End of the week:", end);
            return eventDate >= start && eventDate <= end;
            
        case 'month':
            console.log("Checking 'month' range...");
            console.log("Current Month:", currentDate.getMonth(), "Event Month:", eventDate.getMonth());
            return eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear();
            
        case 'year':
            console.log("Checking 'year' range...");
            console.log("Current Year:", currentDate.getFullYear(), "Event Year:", eventDate.getFullYear());
            return eventDate.getFullYear() === currentDate.getFullYear();
            
        default:
            console.log("No filtering applied for the selected time range.");
            return true;
    }
       });
console.log(artistData,filteredData)
       const historicalConfig = {
           type: 'line' as const,
           data: {
               labels: filteredData.map(d => new Date(d.event_date).toLocaleDateString()),
               datasets: [{
                   label: 'Engagement Score',
                   data: filteredData.map(d => d.total_engagement),
                   borderColor: colors[0],
                   backgroundColor: `${colors[0]}33`,
                   fill: false,
                   tension: 0.4
               }]
           },
           options: {
               responsive: true,
               maintainAspectRatio: false,
               plugins: {
                   title: {
                       display: true,
                       text: `Historical Engagement for ${selectedArtist}`,
                       font: { size: 16, weight: 'bold' }
                   }
               }
           }
       };

       if (historicalChart) historicalChart.destroy();
       historicalChart = new Chart(historicalChartCanvas, historicalConfig);
   }

   // Update charts when artist changes
   $effect(() => {
       if (selectedArtist) {
           const artistData = engagements.filter(d => d.artist_name === selectedArtist);
           const filteredEventTypes = eventTypes.filter(event => event.artist_name === selectedArtist);

           if (viewMode === 'average') {
            updateEventTypeCounts(filteredEventTypes);
               updateHourlyChart(artistData);
               updateDailyChart(artistData);
               updatePieChart(filteredEventTypes);
           } else {
               updateHistoricalChart(artistData);
           }
       }
   });
   onMount(() => {
    const initializeCharts = async () => {
      try {
        if (selectedArtist) {
          const artistData = engagements.filter(d => d.artist_name === selectedArtist);
          const filteredEventTypes = eventTypes.filter(event => event.artist_name === selectedArtist);

          if (viewMode === 'average') {
            await Promise.all([
              updateEventTypeCounts(filteredEventTypes),
              updateHourlyChart(artistData),
              updateDailyChart(artistData),
              updatePieChart(filteredEventTypes)
            ]);
          } else {
            await updateHistoricalChart(artistData);
          }
        }
      } finally {
        isLoading = false;
      }
    };

    initializeCharts();
   });


   function updateEventTypeCounts(filteredEvents: any[]) {
       const eventTypeMap = {
           'share_track': 0,
           'like_track': 1,
           'add_track_to_playlist': 2,
           'play_track': 3
       };

       filteredEvents.forEach(event => {
           const index = eventTypeMap[event.event_type];
           if (index !== undefined) {
               engagementTypes[index].value = event.count;
           }
       });
   }

   function updateHourlyChart(artistData: any[]) {
       const aggregatedData = aggregateHourlyData(artistData);
       const config = createEngagementChartConfig(selectedArtist, aggregatedData, displayMode);

       if (chart) chart.destroy();
       chart = new Chart(chartCanvas, { type: 'line', ...config });
   }

   function updateDailyChart(artistData: any[]) {
       const weekdayData = processWeekdayData(artistData);
       const dailyConfig = createDailyChartConfig(selectedArtist, weekdayData);

       if (weekdayChart) weekdayChart.destroy();
       weekdayChart = new Chart(weekdayChartCanvas, dailyConfig);
   }

   function updatePieChart(filteredEvents: any[]) {
       const pieConfig = createEngagementTypesConfig(selectedArtist, filteredEvents);
       if (pieChart) pieChart.destroy();
       pieChart = new Chart(pieChartCanvas, pieConfig);
   }
</script>


{#if isLoading || isNavigating}
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-lg font-medium text-gray-700">
            {isLoading ? 'Loading data...' : 'Updating view...'}
        </p>
    </div>
</div>
{/if}

<div class="flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
   <h1 class="text-3xl font-bold mb-8 text-gray-800">Artist Engagement Analysis</h1>
   
   <div class="w-full max-w-7xl space-y-8">
        <ViewModeToggle
            {viewMode}
            {timeRange}
            {currentDate}
            on:viewModeChange={handleViewModeChange}
            on:timeRangeChange={handleTimeRangeChange}
            on:dateChange={handleDateChange}
            disabled={isLoading || isNavigating}
        />

        <div class="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <!-- Artist Selection -->
            <div class="flex gap-4 items-end">
                <div class="flex-1">
                    <label for="artist-select" class="block text-sm font-medium text-gray-700 mb-2">
                        Select Artist to View Engagement Patterns
                    </label>
                    <select
                        id="artist-select"
                        bind:value={selectedArtist}
                        class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
                            disabled={isLoading || isNavigating}
                    >
                        {#each sortedArtists as artist}
                            <option value={artist.name}>{artist.name}</option>
                        {/each}
                    </select>
                </div>
                
            {#if viewMode === 'average'}
                <div class="flex gap-2">
                    {#each ['all', 'split'] as mode}
                        <button
                            class="px-4 py-2 rounded-md transition-colors"
                            class:bg-indigo-600={displayMode === mode}
                            class:text-white={displayMode === mode}
                            class:bg-gray-100={displayMode !== mode}
                            class:text-gray-700={displayMode !== mode}
                            disabled={isLoading || isNavigating}
                            onclick={() => displayMode = mode}
                        >
                            {mode === 'all' ? 'All' : 'Weekday vs Weekend'}
                        </button>
                    {/each}
                </div>
            {/if}
            </div>

            <!-- Charts -->

            {#if viewMode === 'average'}
            <div class="space-y-8">
                <div class="bg-white rounded-xl shadow-lg p-8">
                    <h2 class="text-2xl font-bold mb-6">Engagement Types Distribution</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div class="h-[400px] relative bg-white p-4 rounded-lg border border-gray-100">
                            <canvas bind:this={pieChartCanvas}></canvas>
                        </div>
                        <div class="grid grid-cols-2 gap-4 content-center">
                            {#each engagementTypes as type}
                                <div class="bg-white p-4 rounded-lg border border-gray-100">
                                    <div class="flex items-center gap-2">
                                        <div class="w-4 h-4 rounded" style="background-color: {type.color}"></div>
                                        <span class="font-medium">{type.label}</span>
                                    </div>
                                    <div class="text-2xl font-bold mt-2" style="color: {type.color}">
                                        {type.value} events
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                </div>
                
                <div class="h-[600px] relative bg-white p-4 rounded-lg border border-gray-100">
                    <canvas bind:this={chartCanvas}></canvas>
                </div>

                <div class="bg-white rounded-xl shadow-lg p-8">
                    <h2 class="text-2xl font-bold mb-6">Daily Engagement Pattern</h2>
                    <div class="h-[400px] relative bg-white p-4 rounded-lg border border-gray-100">
                        <canvas bind:this={weekdayChartCanvas}></canvas>
                    </div>
                </div>
            </div>
            {:else}
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-blue-800">
                    Note: Data mostly at 2022.
                </p>
            </div>
            <div class="space-y-8">
                <div class="h-[600px] relative bg-white p-4 rounded-lg border border-gray-100">
                    <canvas bind:this={historicalChartCanvas}></canvas>
                </div>
            </div>
        {/if}
            

            <!-- Note -->
            <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-blue-800">
                    Note: Times are shown in local timezone for each user's region. 
                    Data is aggregated to show patterns across different time periods.
                </p>
            </div>
        </div>
   </div>
</div>