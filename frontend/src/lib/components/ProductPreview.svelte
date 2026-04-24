<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { onMount } from 'svelte';

  let activeMarker = 0;
  const markers = [
    { x: '20%', y: '30%', color: 'bg-red-500', label: 'Competitor: 3 nearby', value: 'High Saturation', type: 'comp' },
    { x: '60%', y: '40%', color: 'bg-green-500', label: 'Population: 12.4k', value: 'Prime Density', type: 'complement' },
    { x: '40%', y: '70%', color: 'bg-red-500', label: 'Footfall: Low', value: 'Avoid Area', type: 'comp' },
    { x: '80%', y: '60%', color: 'bg-green-500', label: 'Google Trends: +18%', value: 'Rising Demand', type: 'complement' },
  ];

  onMount(() => {
    const interval = setInterval(() => {
      activeMarker = (activeMarker + 1) % markers.length;
    }, 3000);
    return () => clearInterval(interval);
  });
</script>

<div class="relative w-full aspect-[4/3] max-w-2xl mx-auto perspective-1000 group" style="perspective: 1200px;">
  <!-- 3D Scene Container -->
  <div class="relative w-full h-full transition-transform duration-700 ease-out transform-style-3d group-hover:rotate-x-[-5deg] group-hover:rotate-y-[5deg]" 
       style="transform: rotateX(20deg) rotateY(-15deg) rotateZ(2deg); transform-style: preserve-3d;">
    
    <!-- Main Map Base -->
    <div class="absolute inset-0 rounded-[40px] border border-white/50 bg-slate-50 shadow-2xl overflow-hidden backdrop-blur-sm" 
         style="transform: translateZ(0px);">
      
      <!-- Stylized Map Background Grid -->
      <div class="absolute inset-0 opacity-30" 
           style="background-image: radial-gradient(#cbd5e1 1px, transparent 1px); background-size: 30px 30px;">
      </div>
      
      <!-- Detailed "Street" Network -->
      <div class="absolute inset-0 opacity-20">
        <!-- Main Avenues (Thicker) -->
        <div class="absolute top-1/4 left-0 w-full h-[3px] bg-slate-400 rotate-12"></div>
        <div class="absolute top-2/3 left-0 w-full h-[3px] bg-slate-400 -rotate-6"></div>
        <div class="absolute top-0 left-1/3 w-[3px] h-full bg-slate-400 rotate-3"></div>
        <div class="absolute top-0 left-2/3 w-[3px] h-full bg-slate-400 -rotate-12"></div>
        
        <!-- Side Streets (Thinner) -->
        <div class="absolute top-1/3 left-0 w-full h-px bg-slate-300 rotate-12"></div>
        <div class="absolute top-1/2 left-0 w-full h-px bg-slate-300 -rotate-6"></div>
        <div class="absolute top-0 left-1/4 w-px h-full bg-slate-300 rotate-3"></div>
        <div class="absolute top-0 left-3/4 w-px h-full bg-slate-300 -rotate-12"></div>
      </div>

      <!-- The Target Pin -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div class="relative">
          <div class="absolute -inset-4 rounded-full bg-teal-500/30 animate-ping"></div>
          <div class="h-10 w-10 rounded-full bg-teal-600 border-4 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
        </div>
      </div>

      <!-- AI Scanning Markers -->
      {#each markers as marker, i}
        <div 
          class="absolute transition-all duration-1000 ease-in-out z-10"
          style="left: {marker.x}; top: {marker.y};"
        >
          <div class="relative group">
            <div class="h-5 w-5 rounded-full {marker.color} border-2 border-white shadow-md transition-transform {activeMarker === i ? 'scale-150' : 'scale-100'}"></div>
          </div>
        </div>
      {/each}
    </div>

    <!-- FLOATING 3D ELEMENTS -->

    <!-- 1. The Score Badge -->
    <div class="absolute -top-12 left-1/2 -translate-x-1/2 z-30 transition-transform duration-500 group-hover:-translate-y-4"
         style="transform: translateZ(80px);">
      <div class="px-6 py-3 rounded-full bg-slate-900 text-white font-bold shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-white/10">
        <span class="h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
        <span>Viability Score: <span class="text-teal-400">84/100</span></span>
      </div>
    </div>

    <!-- 2. AI Insight Card (Metric-driven) -->
    <div class="absolute top-1/4 -left-16 z-30 w-64 transition-transform duration-500 group-hover:-translate-x-4"
         style="transform: translateZ(120px);">
      <div class="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <div class="flex items-center gap-2 mb-2">
          <div class="h-4 w-4 rounded-full bg-teal-500 flex items-center justify-center text-[8px] text-white font-bold">AI</div>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Metric</span>
        </div>
        <div class="space-y-1">
            <p class="text-sm font-bold text-slate-900">{markers[activeMarker].label}</p>
            <p class="text-xs font-medium text-teal-600 italic">{markers[activeMarker].value}</p>
        </div>
      </div>
    </div>

    <!-- 3. Dynamic Marker Label -->
    {#if activeMarker !== undefined}
      <div 
        class="absolute transition-all duration-700 ease-in-out z-30"
        style="left: {markers[activeMarker].x}; top: {markers[activeMarker].y}; transform: translateZ(60px) translateY(-40px);"
      >
        <div 
          transition:fade
          class="whitespace-nowrap px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-lg text-xs font-bold text-slate-600 flex items-center gap-2"
        >
          <div class="h-2 w-2 rounded-full {markers[activeMarker].color}"></div>
          {markers[activeMarker].label}
        </div>
      </div>
    {/if}

  </div>
</div>

<style>
  .perspective-1000 {
    perspective: 1200px;
  }
  .transform-style-3d {
    transform-style: preserve-3d;
  }
</style>
