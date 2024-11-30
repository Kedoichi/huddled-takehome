<script lang="ts">
   import type { PageData } from "./$types";
   import { onMount } from 'svelte';
   import { Chart } from 'chart.js/auto';
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
   
   // Props and Data
   let { data }: PageData = $props();
   const { data: engagements, eventTypes, artists } = data;

   // Chart Elements
   let chartCanvas: HTMLCanvasElement;
   let weekdayChartCanvas: HTMLCanvasElement;
   let pieChartCanvas: HTMLCanvasElement;

   // State Management
   let selectedArtist = $state('Artist 1');
   let viewMode = $state<'all' | 'split'>('all');
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

   const sortedArtists = sortArtists(artists);
   
   // Update charts when artist changes
   $effect(() => {
       if (selectedArtist) {
           updateCharts();
       }
   });

   function updateCharts() {
       if (!selectedArtist || !chartCanvas) return;

       const artistData = engagements.filter(d => d.artist_name === selectedArtist);
       const filteredEventTypes = eventTypes.filter(event => event.artist_name === selectedArtist);
       
       updateEventTypeCounts(filteredEventTypes);
       updateHourlyChart(artistData);
       updateDailyChart(artistData);
       updatePieChart(filteredEventTypes);
   }

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
       const config = createEngagementChartConfig(selectedArtist, aggregatedData, viewMode);

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

<div class="flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
   <h1 class="text-3xl font-bold mb-8 text-gray-800">Artist Engagement Analysis</h1>
   
   <div class="w-full max-w-7xl bg-white rounded-xl shadow-lg p-8 space-y-8">
       <!-- Artist Selection & View Mode -->
       <div class="flex gap-4 items-end">
           <div class="flex-1">
               <label for="artist-select" class="block text-sm font-medium text-gray-700 mb-2">
                   Select Artist to View Engagement Patterns
               </label>
               <select
                   id="artist-select"
                   bind:value={selectedArtist}
                   class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500"
               >
                   {#each sortedArtists as artist}
                       <option value={artist.name}>{artist.name}</option>
                   {/each}
               </select>
           </div>
           
           <div class="flex gap-2">
               {#each ['all', 'split'] as mode}
                   <button
                       class="px-4 py-2 rounded-md transition-colors"
                       class:bg-indigo-600={viewMode === mode}
                       class:text-white={viewMode === mode}
                       class:bg-gray-100={viewMode !== mode}
                       class:text-gray-700={viewMode !== mode}
                       onclick={() => viewMode = mode}
                   >
                       {mode === 'all' ? 'All' : 'Weekday vs Weekend'}
                   </button>
               {/each}
           </div>
       </div>

       <!-- Charts -->
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

       <!-- Note -->
       <div class="bg-blue-50 p-4 rounded-lg">
           <p class="text-blue-800">
               Note: Times are shown in local timezone for each user's region. 
               Data is aggregated to show patterns across different time periods.
           </p>
       </div>
   </div>
</div>