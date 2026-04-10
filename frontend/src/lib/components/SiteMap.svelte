<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import type { BusinessMarker } from '$lib/types';

  export let lat: number;
  export let lon: number;
  export let competitors: BusinessMarker[];
  export let complementary: BusinessMarker[];

  let el: HTMLDivElement;
  let map: import('leaflet').Map | undefined;
  let L: typeof import('leaflet') | undefined;

  onMount(async () => {
    if (!browser) return;
    L = await import('leaflet');
    const leaflet = L;
    map = leaflet.map(el, { zoomControl: true }).setView([lat, lon], 16);
    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      })
      .addTo(map);

    const icon = (color: string) =>
      leaflet.divIcon({
        className: 'gs-marker',
        html: `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(15,23,42,.35)"></span>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

    leaflet.marker([lat, lon], { icon: icon('#0F766E') }).addTo(map).bindPopup('Your site');

    for (const c of competitors) {
      leaflet
        .marker([c.lat, c.lon], { icon: icon('#DC2626') })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(c.name)}</strong><br/><span class="text-xs">Competitor · ${c.category}</span>`);
    }
    for (const c of complementary) {
      leaflet
        .marker([c.lat, c.lon], { icon: icon('#16A34A') })
        .addTo(map)
        .bindPopup(`<strong>${escapeHtml(c.name)}</strong><br/><span class="text-xs">Complementary · ${c.category}</span>`);
    }

    const extras = competitors.length + complementary.length;
    if (extras === 0) {
      map.setView([lat, lon], 16);
    } else {
      const group = leaflet.featureGroup([
        leaflet.marker([lat, lon]),
        ...competitors.map((c) => leaflet.marker([c.lat, c.lon])),
        ...complementary.map((c) => leaflet.marker([c.lat, c.lon])),
      ]);
      const b = group.getBounds();
      if (b.isValid()) map.fitBounds(b.pad(0.22));
      else map.setView([lat, lon], 16);
    }
  });

  onDestroy(() => {
    map?.remove();
    map = undefined;
  });

  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
  }
</script>

<div
  class="gs-map-frame h-[320px] w-full overflow-hidden rounded-2xl border border-line bg-[#EEF2F6] shadow-card ring-1 ring-white/80 md:h-[420px]"
  bind:this={el}
></div>

<style>
  :global(.gs-marker) {
    background: transparent;
    border: none;
  }
  :global(.gs-map-frame .leaflet-container) {
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    border-radius: 0.75rem;
  }
</style>
