<script lang="ts">
  import { page } from "$app/stores";
  import "../app.css";
</script>

<main class="bg-slate-200 dark:bg-slate-950 dark:text-slate-200 w-full h-screen">
  <nav class="flex items-center justify-center gap-4 p-4 md:p-6">
    <a
      href="/task-1"
      class="text-lg font-semibold w-full p-2 rounded text-center transition-colors duration-300 ease-in-out
        {($page.url.pathname === '/task-1') ? 'bg-sky-600 text-white' : 'text-slate-800 dark:text-slate-200 hover:bg-sky-500 dark:hover:bg-sky-800/50'}">
      Task 1
    </a>
    <a
      href="/task-2"
      class="text-lg font-semibold w-full p-2 rounded text-center transition-colors duration-300 ease-in-out
        {($page.url.pathname === '/task-2') ? 'bg-sky-600 text-white' : 'text-slate-800 dark:text-slate-200 hover:bg-sky-500 dark:hover:bg-sky-800/50'}">
      Task 2
    </a>
    <a
      href="/task-3"
      class="text-lg font-semibold w-full p-2 rounded text-center transition-colors duration-300 ease-in-out
        {($page.url.pathname === '/task-3') ? 'bg-sky-600 text-white' : 'text-slate-800 dark:text-slate-200 hover:bg-sky-500 dark:hover:bg-sky-800/50'}">
      Task 3
    </a>
  </nav>
  <slot></slot>
</main>
