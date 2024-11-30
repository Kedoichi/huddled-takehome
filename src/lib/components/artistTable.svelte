<script lang="ts">
  let { artistVisits } = $props();

  function formatDuration(duration: number): string {
  if (duration <= 0) return '0 seconds';

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  // Get the remaining minutes and seconds after calculating hours
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  let result = '';

  if (hours > 0) {
    result += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }

  if (remainingMinutes > 0) {
    if (result) result += ' ';
    result += `${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  if (remainingSeconds > 0 || result === '') {
    if (result) result += ' ';
    result += `${remainingSeconds} ${remainingSeconds === 1 ? 'second' : 'seconds'}`;
  }

  return result;
}

</script>

<div class="overflow-x-auto">
  <div class="min-w-max w-[60rem] h-[60vh] overflow-y-auto relative scrollbar-pretty">
    <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0"
      >
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Artist ID
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Artist Name
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Total Interaction Time
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Unique Visitors
        </th>
        </tr>
      </thead>
      <tbody>
        {#each artistVisits as { artist_id, artist_name, total_visit_duration, unique_session_count }}
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_id}
            </td>
            <td
              class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
            >
              {artist_name}
            </td>
            <td class="px-6 py-4">
              {formatDuration(total_visit_duration)}
            </td>
            <td class="px-6 py-4">
              {unique_session_count}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
/* Custom scrollbar styles */
.scrollbar-pretty::-webkit-scrollbar {
  width: 10px;
}

.scrollbar-pretty::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

.scrollbar-pretty::-webkit-scrollbar-thumb {
  background: rgba(149, 158, 160, 0.5);
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.scrollbar-pretty::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 100, 100, 0.7);
}

</style>