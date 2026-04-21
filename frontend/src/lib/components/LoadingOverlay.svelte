<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  export let active = false;

  const logs = [
    "Initializing Geospatial Engine...",
    "Fetching OSM POI Data...",
    "Analyzing Census Tract signals...",
    "Synthesizing Demographic Fit...",
    "Consulting AI Strategist...",
    "Calculating Viability Score..."
  ];

  let currentLogIndex = 0;

  // Cycle through logs every 600ms
  if (active) {
    const interval = setInterval(() => {
      currentLogIndex = (currentLogIndex + 1) % logs.length;
    }, 600);
    // We'll handle the cleanup in a reactive block or a lifecycle hook
  }
</script>

<div 
  class="fixed inset-0 z-50 flex items-center justify-center bg-canvas/90 backdrop-blur-xl"
  transition:fade
>
  <div class="flex flex-col items-center text-center">
    <div class="relative mb-8">
      <!-- Glowing Ring Animation -->
      <div class="absolute -inset-4 rounded-full bg-accent/20 blur-xl animate-glow"></div>
      <div class="relative h-16 w-16 rounded-full bg-surface border border-line flex items-center justify-center text-3xl shadow-card">
        🤖
      </div>
    </div>
    
    <div class="h-12 overflow-hidden">
      {#each logs as log, i}
        {#if i === currentLogIndex}
          <p 
            transition:fly={{ y: 20, duration: 400, easing: quintOut }}
            class="text-lg font-medium text-ink tracking-tight"
          >
            {log}
          </p>
        {/if}
      {/each}
    </div>
    
    <div class="mt-6 flex gap-1">
      {#each Array(6) as _, i}
        <div 
          class="h-1 w-6 rounded-full transition-colors duration-300 {i <= currentLogIndex ? 'bg-accent' : 'bg-line'}"
        ></div>
      {/each}
    </div>
  </div>
</div>
