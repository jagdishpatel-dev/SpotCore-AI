<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  export let active = false;

  const dataPoints = [
    { label: "Census API", x: -150, y: -100 },
    { label: "OSM POIs", x: 150, y: -120 },
    { label: "Transit Flows", x: -180, y: 80 },
    { label: "Zoning Laws", x: 120, y: 150 },
    { label: "Retail Trends", x: 0, y: -200 },
    { label: "Demographics", x: -100, y: 0 },
    { label: "POI Clusters", x: 100, y: 0 },
    { label: "Traffic Density", x: 0, y: 180 },
  ];

  let stage = 'gathering'; // gathering -> condensing -> ready
  let progress = 0;

  onMount(() => {
    if (active) {
      // Stage 1: Gather data (2 seconds)
      setTimeout(() => {
        stage = 'condensing';
      }, 2000);

      // Stage 2: Condense into score (1.5 seconds)
      setTimeout(() => {
        stage = 'ready';
      }, 3500);

      const progInterval = setInterval(() => {
        if (progress < 100) {
          progress += 0.5;
        }
      }, 30);

      return () => clearInterval(progInterval);
    }
  });

  $: if (active) {
    stage = 'gathering';
    progress = 0;
  }
</script>

<div 
  class="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] overflow-hidden"
  transition:fade={{ duration: 300 }}
>
  <!-- Ambient Background Glow -->
  <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>

  <!-- The Core -->
  <div class="relative flex items-center justify-center">
    
    <!-- Outer Rings -->
    <div class="absolute h-32 w-32 rounded-full border border-teal-500/20 animate-ping"></div>
    <div class="absolute h-64 w-64 rounded-full border border-teal-500/10 animate-pulse"></div>

    <!-- The Convergence Center -->
    <div class="relative h-20 w-20 rounded-full bg-teal-500 shadow-[0_0_50px_rgba(20,184,166,0.6)] flex items-center justify-center transition-all duration-500 {stage === 'condensing' ? 'scale-125' : 'scale-100'}">
      <div class="text-white font-bold text-xl">AI</div>
    </div>

    <!-- Data Nodes Flying In -->
    {#if stage === 'gathering'}
      {#each dataPoints as point, i}
        <div 
          class="absolute transition-all duration-[2000ms] ease-in-out"
          style="transform: translate({point.x}px, {point.y}px);"
        >
          <div 
            class="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium"
            transition:fly={{ x: 0, y: 0, duration: 2000, easing: quintOut }}
          >
            <div class="h-1 w-1 rounded-full bg-teal-400"></div>
            {point.label}
          </div>
        </div>
      {/each}
    {/if}

    <!-- Condensing Text -->
    {#if stage === 'condensing'}
      <div class="absolute -bottom-20 text-center w-64" transition:fade>
        <p class="text-teal-400 font-mono text-xs tracking-widest uppercase animate-pulse">
          Synthesizing Data Streams...
        </p>
        <div class="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-teal-500 transition-all duration-300" style="width: {progress}%"></div>
        </div>
      </div>
    {/if}

    <!-- Final Ready State -->
    {#if stage === 'ready'}
      <div class="absolute -bottom-20 text-center" transition:fly={{ y: 20, duration: 500 }}>
        <p class="text-white font-bold text-lg tracking-tight">Intelligence Ready</p>
        <p class="text-teal-500 text-xs font-medium">Analyzing site viability...</p>
      </div>
    {/if}
  </div>

  <!-- Background Data Rain (Subtle) -->
  <div class="absolute inset-0 pointer-events-none opacity-10">
    {#each Array(20) as _, i}
      <div 
        class="absolute text-[8px] font-mono text-teal-500 animate-fall" 
        style="left: {Math.random() * 100}%; animation-duration: {Math.random() * 3 + 2}s; animation-delay: {Math.random() * 5}s;"
      >
        0101101001
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes fall {
    from { transform: translateY(-10vh); opacity: 0; }
    to { transform: translateY(110vh); opacity: 1; }
  }
  .animate-fall {
    animation: fall linear infinite;
  }
</style>
