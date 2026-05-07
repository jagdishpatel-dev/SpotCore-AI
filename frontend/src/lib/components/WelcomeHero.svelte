<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import ProductPreview from '$lib/components/ProductPreview.svelte';
  import { onMount } from 'svelte';

  /** If set, primary CTAs navigate here (e.g. `/analyze`). Else `onStart` is used. */
  export let startHref: string | null = '/analyze';
  export let onStart: (() => void) | null = null;

  let scrollY = 0;
  let viewportHeight = 0;
  let heroHeight = 0;
  
  // The scroll logic now only triggers AFTER the hero section is passed
  $: relativeScrollY = Math.max(0, scrollY - heroHeight);
  $: step = Math.min(narrative.length - 1, Math.max(0, Math.floor(relativeScrollY / (viewportHeight * 0.5 || 400))));

  onMount(() => {
    viewportHeight = window.innerHeight;
    // Approximate hero height for the initial offset
    heroHeight = window.innerHeight * 0.85; 
    
    const handleScroll = () => {
      scrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });

  const narrative = [
    {
      title: "The Old Way",
      subtitle: "Intuition & Guesswork",
      text: "For decades, site selection was a gamble. You relied on a broker's 'hunch' or anecdotal evidence. High risk. Low certainty.",
      theme: "bg-slate-100",
      accent: "text-slate-500"
    },
    {
      title: "The Data Shift",
      subtitle: "Mathematical Certainty",
      text: "We replace intuition with hard signals. By fusing OpenStreetMap POIs, Census demographics, and transit flows, we turn the city into a data model.",
      theme: "bg-white",
      accent: "text-blue-600"
    },
    {
      title: "The AI Edge",
      subtitle: "Strategic Mastery",
      text: "Data is raw. AI is strategic. Geoscorer One synthesizes these signals into the 'Power Move'—the exact reason why a location will win.",
      theme: "bg-teal-50/50",
      accent: "text-teal-600"
    }
  ];
</script>

<div class="relative w-full bg-canvas transition-colors duration-700">
  <!-- SECTION 1: HERO (Above the fold) -->
  <div class="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 text-center z-20">
    <div class="max-w-4xl mx-auto space-y-4">
      <div 
        in:fly={{ y: 20, duration: 800, easing: quintOut }}
        class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-sm"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        <span class="text-xs font-medium text-slate-600 tracking-tight">Powered by Gemma 4 AI</span>
      </div>

      <h1 
        in:fly={{ y: 30, duration: 1000, delay: 200, easing: quintOut }}
        class="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] text-ink mt-2"
      >
        Stop Guessing. <br /> 
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">
          Start Scaling.
        </span>
      </h1>

      <p 
        in:fly={{ y: 30, duration: 1000, delay: 400, easing: quintOut }}
        class="text-xl md:text-3xl text-muted max-w-2xl mx-auto leading-relaxed font-medium"
      >
        Turn geographic intuition into mathematical certainty. <br class="hidden md:block" />
        Find your perfect block using AI-driven location intelligence.
      </p>

      <div 
        in:fly={{ y: 30, duration: 1000, delay: 600, easing: quintOut }}
        class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
      >
        {#if startHref}
          <a
            href={startHref}
            class="group relative inline-flex px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
          >
            Get Your Site Score
            <span class="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></span>
          </a>
        {:else if onStart}
          <button 
            on:click={onStart}
            class="group relative px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
          >
            Get Your Site Score
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </button>
        {/if}
      </div>
    </div>
  </div>

  <!-- SECTION 2: THE PROOF (Scroll-driven AI Demo) -->
  <div class="relative py-20 bg-canvas">
    <!-- Sticky Container for Map + Text -->
    <div class="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
      
      <!-- DESKTOP: Side-by-Side Layout -->
      <div class="hidden md:flex w-full max-w-7xl mx-auto px-12 items-center justify-between gap-20">
        <!-- Left: Narrative -->
        <div class="w-1/2 z-20 pointer-events-none">
          {#each narrative as section, i}
            {#if step === i}
              <div 
                in:fly={{ x: -20, duration: 600, easing: quintOut }} 
                out:fade={{ duration: 400 }}
                class="space-y-6"
              >
                <span class="text-xs font-bold tracking-widest uppercase text-teal-500">{section.subtitle}</span>
                <h2 class="text-5xl lg:text-7xl font-black tracking-tight text-ink leading-tight">
                  {section.title}
                </h2>
                <p class="text-xl lg:text-2xl text-muted leading-relaxed">
                  {section.text}
                </p>
              </div>
            {/if}
          {/each}
        </div>

        <!-- Right: 3D Map -->
        <div 
          class="w-1/2 relative transition-all duration-1000 ease-in-out"
          style="transform: scale({1 - (step * 0.02)}) translateY({step * 10}px); opacity: {0.7 + (step * 0.1)};"
        >
          <ProductPreview />
        </div>
      </div>

      <!-- MOBILE: Stacked Layout (Text above Map) -->
      <div class="flex md:hidden flex-col items-center justify-center w-full px-6 text-center gap-12">
        <!-- Narrative -->
        <div class="z-20 pointer-events-none max-w-sm">
          {#each narrative as section, i}
            {#if step === i}
              <div 
                in:fly={{ y: 20, duration: 600, easing: quintOut }} 
                out:fade={{ duration: 400 }}
                class="space-y-4"
              >
                <span class="text-xs font-bold tracking-widest uppercase text-teal-500">{section.subtitle}</span>
                <h2 class="text-3xl font-black tracking-tight text-ink leading-tight">
                  {section.title}
                </h2>
                <p class="text-base text-muted leading-relaxed">
                  {section.text}
                </p>
              </div>
            {/if}
          {/each}
        </div>

        <!-- 3D Map (Scales down for mobile) -->
        <div 
          class="relative w-full transition-all duration-1000 ease-in-out"
          style="transform: scale({0.8 - (step * 0.02)}) translateY({step * 10}px); opacity: {0.7 + (step * 0.1)};"
        >
          <ProductPreview />
        </div>
      </div>

      <!-- Global Glows -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full z-0 pointer-events-none">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/10 to-transparent"></div>
        <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] transition-all duration-1000" 
             style="transform: translate({step * 100}px, {step * 50}px);"></div>
      </div>
    </div>

    <!-- SCROLL SPACER: This drives the 'step' variable based on scroll position -->
    <div class="h-[300vh]"></div>
  </div>

  <!-- FINAL CTA -->
  <div class="relative z-20 py-32 px-6 bg-white dark:bg-slate-900 text-center transition-colors duration-500">
    <h2 class="text-4xl md:text-7xl font-black tracking-tighter text-ink mb-12">
      Ready to find your <br />
      <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">perfect location?</span>
    </h2>
    {#if startHref}
      <a
        href={startHref}
        class="inline-flex px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
      >
        Start Analyzing Now
      </a>
    {:else if onStart}
      <button 
        on:click={onStart}
        class="px-12 py-6 bg-slate-900 text-white rounded-full font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl hover:shadow-teal-500/40"
      >
        Start Analyzing Now
      </button>
    {/if}
  </div>
</div>
