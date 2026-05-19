<script lang="ts">
  import { browser } from '$app/environment';
  import { onDestroy, onMount } from 'svelte';
  import type { BusinessMarker } from '$lib/types';

  export let lat: number;
  export let lon: number;
  export let competitors: BusinessMarker[];
  export let complementary: BusinessMarker[];
  /** Optional trade-area ring radius in meters. */
  export let radiusM: number = 500;

  let el: HTMLDivElement;
  let map: import('leaflet').Map | undefined;
  let L: typeof import('leaflet') | undefined;

  onMount(async () => {
    if (!browser) return;
    L = await import('leaflet');
    const leaflet = L;
    map = leaflet
      .map(el, { zoomControl: true, attributionControl: true })
      .setView([lat, lon], 16);

    leaflet
      .tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      )
      .addTo(map);
    leaflet
      .tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
        { maxZoom: 19, subdomains: 'abcd', opacity: 0.85 },
      )
      .addTo(map);

    // Trade-area ring
    leaflet
      .circle([lat, lon], {
        radius: radiusM,
        color: '#22D3EE',
        weight: 1,
        opacity: 0.55,
        fillColor: '#22D3EE',
        fillOpacity: 0.06,
        dashArray: '3 4',
      })
      .addTo(map);

    const dotIcon = (color: string, glow: string) =>
      leaflet.divIcon({
        className: 'gs-marker',
        html: `<span class="gs-pin" style="--c:${color};--g:${glow};"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

    const subjectIcon = leaflet.divIcon({
      className: 'gs-marker',
      html: `<span class="gs-pin gs-pin-subject" style="--c:#22D3EE;--g:rgba(34,211,238,0.6);"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    leaflet
      .marker([lat, lon], { icon: subjectIcon })
      .addTo(map)
      .bindPopup('<strong>Subject site</strong>');

    for (const c of competitors) {
      leaflet
        .marker([c.lat, c.lon], { icon: dotIcon('#EF4444', 'rgba(239,68,68,0.45)') })
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(c.name)}</strong><br/><span class="gs-popup-sub">Competitor · ${escapeHtml(c.category)}</span>`,
        );
    }
    for (const c of complementary) {
      leaflet
        .marker([c.lat, c.lon], { icon: dotIcon('#22C55E', 'rgba(34,197,94,0.45)') })
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(c.name)}</strong><br/><span class="gs-popup-sub">Complementary · ${escapeHtml(c.category)}</span>`,
        );
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
    return s.replace(
      /[&<>"']/g,
      (ch) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
    );
  }
</script>

<div
  class="gs-map-frame relative h-[320px] w-full overflow-hidden rounded-2xl border border-line bg-[#020A1A] md:h-[420px]"
  bind:this={el}
></div>

<style>
  :global(.gs-marker) {
    background: transparent;
    border: none;
  }
  :global(.gs-pin) {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 9999px;
    background: var(--c);
    border: 2px solid #020a1a;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 14px var(--g);
    transform: scale(0.85);
    animation: gs-pin-pop 380ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  :global(.gs-pin-subject) {
    width: 16px;
    height: 16px;
    box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.25), 0 0 22px var(--g);
  }
  @keyframes gs-pin-pop {
    from {
      transform: scale(0.4);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  :global(.gs-map-frame .leaflet-container) {
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    background: #020a1a;
  }
  :global(.gs-map-frame .leaflet-control-attribution) {
    background: rgba(2, 10, 26, 0.7);
    color: #9ca3af;
    border-top-left-radius: 8px;
    backdrop-filter: blur(6px);
  }
  :global(.gs-map-frame .leaflet-control-attribution a) {
    color: #22d3ee;
  }
  :global(.gs-map-frame .leaflet-control-zoom a) {
    background: #050f24;
    color: #e5e7eb;
    border: 1px solid rgba(148, 163, 184, 0.18);
  }
  :global(.gs-map-frame .leaflet-control-zoom a:hover) {
    background: #0a1530;
  }
  :global(.gs-map-frame .leaflet-popup-content-wrapper),
  :global(.gs-map-frame .leaflet-popup-tip) {
    background: #050f24;
    color: #e5e7eb;
    border: 1px solid rgba(148, 163, 184, 0.18);
    box-shadow: 0 12px 40px -12px rgba(2, 6, 23, 0.9);
  }
  :global(.gs-map-frame .leaflet-popup-content) {
    margin: 10px 12px;
    font-size: 12px;
  }
  :global(.gs-popup-sub) {
    color: #9ca3af;
    font-size: 11px;
  }
</style>
