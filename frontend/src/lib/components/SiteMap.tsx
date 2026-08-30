
import { useEffect, useRef } from 'react';
import type { BusinessMarker, ZoningMapFeature } from '$lib/types';
import '$lib/components/site-map.css';

export interface SiteMapProps {
  lat: number;
  lon: number;
  competitors: BusinessMarker[];
  complementary: BusinessMarker[];
  radiusM?: number;
  zoningFeatures?: ZoningMapFeature[];
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!,
  );
}

const PERMISSION_LABEL: Record<ZoningMapFeature['permission'], string> = {
  permitted: 'Permitted',
  conditional: 'Conditional use (permit required)',
  prohibited: 'Not permitted',
  unknown: 'Unclassified / legacy code',
};

export default function SiteMap({
  lat,
  lon,
  competitors,
  complementary,
  radiusM = 500,
  zoningFeatures,
}: SiteMapProps) {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let map: import('leaflet').Map | undefined;
    let cancelled = false;

    (async () => {
      const L = await import('leaflet');
      if (cancelled) return;

      map = L.map(el, { zoomControl: true, attributionControl: true }).setView([lat, lon], 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> · &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        opacity: 0.85,
      }).addTo(map);

      if (zoningFeatures?.length) {
        const geojson = {
          type: 'FeatureCollection' as const,
          features: zoningFeatures.map((f) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: f,
          })),
        };
        L.geoJSON(geojson, {
          style: (feature) => {
            const props = feature?.properties as ZoningMapFeature | undefined;
            return {
              color: props?.color ?? '#6B7280',
              weight: 1,
              opacity: 0.7,
              fillColor: props?.color ?? '#6B7280',
              fillOpacity: 0.28,
            };
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties as ZoningMapFeature;
            const districtLabel = props.base_district ?? props.ztype;
            const useLine = props.matched_use
              ? `<br/><span class="gs-popup-sub">${escapeHtml(props.matched_use)}: ${PERMISSION_LABEL[props.permission]}</span>`
              : '';
            layer.bindPopup(
              `<strong>${escapeHtml(districtLabel)}</strong> <span class="gs-popup-sub">(${escapeHtml(props.ztype)})</span>${useLine}`,
            );
          },
        }).addTo(map);
      }

      L.circle([lat, lon], {
        radius: radiusM,
        color: '#22D3EE',
        weight: 1,
        opacity: 0.55,
        fillColor: '#22D3EE',
        fillOpacity: 0.06,
        dashArray: '3 4',
      }).addTo(map);

      const dotIcon = (color: string, glow: string) =>
        L.divIcon({
          className: 'gs-marker',
          html: `<span class="gs-pin" style="--c:${color};--g:${glow};"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

      const subjectIcon = L.divIcon({
        className: 'gs-marker',
        html: `<span class="gs-pin gs-pin-subject" style="--c:#22D3EE;--g:rgba(34,211,238,0.6);"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([lat, lon], { icon: subjectIcon })
        .addTo(map)
        .bindPopup('<strong>Subject site</strong>');

      for (const c of competitors) {
        L.marker([c.lat, c.lon], { icon: dotIcon('#EF4444', 'rgba(239,68,68,0.45)') })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(c.name)}</strong><br/><span class="gs-popup-sub">Competitor · ${escapeHtml(c.category)}</span>`,
          );
      }

      for (const c of complementary) {
        L.marker([c.lat, c.lon], { icon: dotIcon('#22C55E', 'rgba(34,197,94,0.45)') })
          .addTo(map)
          .bindPopup(
            `<strong>${escapeHtml(c.name)}</strong><br/><span class="gs-popup-sub">Complementary · ${escapeHtml(c.category)}</span>`,
          );
      }

      const extras = competitors.length + complementary.length;
      if (extras === 0) {
        map.setView([lat, lon], 16);
      } else {
        const group = L.featureGroup([
          L.marker([lat, lon]),
          ...competitors.map((c) => L.marker([c.lat, c.lon])),
          ...complementary.map((c) => L.marker([c.lat, c.lon])),
        ]);
        const b = group.getBounds();
        if (b.isValid()) map.fitBounds(b.pad(0.22));
        else map.setView([lat, lon], 16);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [lat, lon, competitors, complementary, radiusM, zoningFeatures]);

  return (
    <div
      ref={elRef}
      className="gs-map-frame relative h-[320px] w-full overflow-hidden rounded-2xl border border-line bg-[#020A1A] md:h-[420px]"
    />
  );
}
