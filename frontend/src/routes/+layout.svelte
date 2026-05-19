<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import AppChrome from '$lib/components/AppChrome.svelte';
  import AppFooter from '$lib/components/AppFooter.svelte';
</script>

<svelte:head>
  <title>GeoScore — Location Intelligence</title>
</svelte:head>

<div class="flex min-h-screen flex-col text-ink {$page.url.pathname === '/' ? 'bg-geoscorer-bg' : 'gs-page-bg'}">
  <AppChrome />
  <main class="flex flex-1 flex-col">
    <slot />
  </main>
  <AppFooter />
</div>
