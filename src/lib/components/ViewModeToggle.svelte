<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let viewMode: 'average' | 'historical' = 'average';
    export let timeRange: 'day' | 'week' | 'month' | 'year' = 'day';
    export let currentDate: Date = new Date();
    export let disabled = false;
  
    const dispatch = createEventDispatcher();
  
    function handleViewModeChange(mode: 'average' | 'historical') {
      dispatch('viewModeChange', { mode });
    }
  
    function handleTimeRangeChange(range: 'day' | 'week' | 'month' | 'year') {
      dispatch('timeRangeChange', { range });
    }
  
    function handleDateChange(direction: 'prev' | 'next') {
      const newDate = new Date(currentDate);
      
      switch (timeRange) {
        case 'day':
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
          newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
          break;
        case 'year':
          newDate.setFullYear(currentDate.getFullYear() + (direction === 'next' ? 1 : -1));
          break;
      }
  
      dispatch('dateChange', { date: newDate });
    }
  
    function formatDate(date: Date): string {
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  </script>
  
  <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow">
      <div class="flex gap-2">
          <button
              class="px-4 py-2 rounded-md transition-colors {viewMode === 'average' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} disabled:opacity-50"

            {disabled}
              on:click={() => handleViewModeChange('average')
            }
          >
              Average View
          </button>
          <button
              class="px-4 py-2 rounded-md transition-colors {viewMode === 'historical' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} disabled:opacity-50"
            {disabled}
              on:click={() => handleViewModeChange('historical')}
          >
              Historical View
          </button>
      </div>
  
      {#if viewMode === 'historical'}
      <div class="flex items-center gap-4 text-xl">
          <select
              bind:value={timeRange}
              on:change={() => handleTimeRangeChange(timeRange)}
              {disabled}
              class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
          </select>

          <div class="flex items-center gap-2 ">
            <button
                on:click={() => handleDateChange('prev')}
                {disabled}
                class="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
                <p class="text-xl">Previous</p>
            </button>
            <span class="min-w-32 text-center font-medium">
                {formatDate(currentDate)}
            </span>
            <button
                on:click={() => handleDateChange('next')}
                {disabled}
                class="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
            >
            <p class="text-xl">Next</p>
                
            </button>
        </div>
      </div>
  {/if}
</div>