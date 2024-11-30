<script lang="ts">
   import type { PageData } from "./$types";
   import { onMount } from 'svelte';
   import { Chart } from 'chart.js/auto';
   import { 
     aggregateHourlyData, 
     createEngagementChartConfig, 
     sortArtists,
     processWeekdayData 
   } from '$lib//chartUtils';
   
   let { data }: { data: PageData } = $props();
   const engagements = data.data;
   let chartCanvas: HTMLCanvasElement;
   let selectedArtist = $state('Artist 1');
   let viewMode = $state<'all' | 'split'>('all');
   let chart: Chart | null = null;

   const sortedArtists = sortArtists(data.artists);
   
   $effect(() => {
       if (selectedArtist) {
           updateChart();
       }
   });

   function updateChart() {
       if (!selectedArtist || !chartCanvas) return;

       // Filter data for selected artist
       const artistData = engagements.filter(d => d.artist_name === selectedArtist);
       
       // Aggregate data
       const aggregatedData = aggregateHourlyData(artistData);
       
       // Create chart config based on view mode
       const config = createEngagementChartConfig(selectedArtist, aggregatedData, viewMode);

       if (chart) chart.destroy();
       
       chart = new Chart(chartCanvas, {
           type: 'line',
           ...config
       });

       
   }
</script>

<div class="flex flex-col items-center justify-center p-6 bg-gray-50 min-h-screen">
   <h1 class="text-3xl font-bold mb-8 text-gray-800">Artist Engagement Analysis</h1>
   
   <div class="w-full max-w-7xl bg-white rounded-xl shadow-lg p-8">
       <!-- Artist Selection & View Mode -->
       <div class="mb-8 flex gap-4 items-end">
           <div class="flex-1">
               <label for="artist-select" class="block text-sm font-medium text-gray-700 mb-2">
                   Select Artist to View Engagement Patterns
               </label>
               <select
                   id="artist-select"
                   bind:value={selectedArtist}
                   class="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
               >
                   {#each sortedArtists as artist}
                       <option value={artist.name}>{artist.name}</option>
                   {/each}
               </select>
           </div>
           
           <div class="flex gap-2">
               <button
                   class="px-4 py-2 rounded-md transition-colors {viewMode === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}"
                   on:click={() => viewMode = 'all'}
               >
                   All
               </button>
               <button
                   class="px-4 py-2 rounded-md transition-colors {viewMode === 'split' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}"
                   on:click={() => viewMode = 'split'}
               >
                   Weekday vs Weekend
               </button>
           </div>
       </div>

       <!-- Chart Container -->
       <div class="h-[600px] relative bg-white p-4 rounded-lg border border-gray-100">
           <canvas bind:this={chartCanvas}></canvas>
       </div>

       <!-- Analysis Details -->
       <div class="mt-8 space-y-6">
           <div class="bg-gray-50 p-6 rounded-lg">
               <h3 class="text-lg font-semibold mb-4 text-gray-800">Engagement Score Weights</h3>
               <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div class="bg-white p-3 rounded shadow-sm">
                       <span class="font-medium">Share Track:</span> 3 points
                   </div>
                   <div class="bg-white p-3 rounded shadow-sm">
                       <span class="font-medium">Like Track:</span> 2 points
                   </div>
                   <div class="bg-white p-3 rounded shadow-sm">
                       <span class="font-medium">Add to Playlist:</span> 2 points
                   </div>
                   <div class="bg-white p-3 rounded shadow-sm">
                       <span class="font-medium">Play Track:</span> 1 point
                   </div>
               </div>
           </div>

           <div class="bg-blue-50 p-4 rounded-lg">
               <p class="text-blue-800">
                   Note: Times are shown in local timezone for each user's region. 
                   Data is aggregated by day of week to show weekly patterns.
               </p>
           </div>
       </div>
   </div>
</div>