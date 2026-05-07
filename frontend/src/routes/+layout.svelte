<script lang="ts">
  import '../app.css';
  import AppChrome from '$lib/components/AppChrome.svelte';
  import AppFooter from '$lib/components/AppFooter.svelte';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
  <title>GeoScore — Location Intelligence</title>
</svelte:head>

<div class="gs-page-bg flex min-h-screen flex-col text-ink">
  <AppChrome />
  <main class="flex flex-1 flex-col">
    <slot />
  </main>
  <AppFooter />
</div>
