<script lang="ts">
  import ArtistTable from "$lib/components/artistTable.svelte";
import type { PageData } from "./$types";
  export let data: PageData;
</script>
 
 
<div class="p-6">
 <h1 class="text-2xl font-bold mb-6 text-center">Artist Interaction Statistics</h1> 
<div class="flex flex-col items-center justify-center">
    <ArtistTable artistVisits={data.data} />
</div>
</div>