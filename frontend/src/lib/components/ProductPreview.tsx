
import { useEffect, useState } from 'react';
import { cn } from '$lib/utils/cn';
import './product-preview.css';

const markers = [
  { x: '20%', y: '30%', color: 'bg-red-500', label: 'Competitor: 3 nearby', value: 'High Saturation' },
  { x: '60%', y: '40%', color: 'bg-green-500', label: 'Population: 12.4k', value: 'Prime Density' },
  { x: '40%', y: '70%', color: 'bg-red-500', label: 'Footfall: Low', value: 'Avoid Area' },
  { x: '80%', y: '60%', color: 'bg-green-500', label: 'Google Trends: +18%', value: 'Rising Demand' },
];

export default function ProductPreview() {
  const [activeMarker, setActiveMarker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMarker((m) => (m + 1) % markers.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const active = markers[activeMarker];

  return (
    <div
      className="perspective-1000 group relative mx-auto aspect-[4/3] w-full max-w-2xl"
      style={{ perspective: '1200px' }}
    >
      <div
        className="transform-style-3d relative h-full w-full transition-transform duration-700 ease-out group-hover:rotate-x-[-5deg] group-hover:rotate-y-[5deg]"
        style={{
          transform: 'rotateX(20deg) rotateY(-15deg) rotateZ(2deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden rounded-[40px] border border-white/50 bg-slate-50 shadow-2xl backdrop-blur-sm"
          style={{ transform: 'translateZ(0px)' }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          ></div>

          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-0 top-1/4 h-[3px] w-full rotate-12 bg-slate-400"></div>
            <div className="absolute left-0 top-2/3 h-[3px] w-full -rotate-6 bg-slate-400"></div>
            <div className="absolute left-1/3 top-0 h-full w-[3px] rotate-3 bg-slate-400"></div>
            <div className="absolute left-2/3 top-0 h-full w-[3px] -rotate-12 bg-slate-400"></div>
            <div className="absolute left-0 top-1/3 h-px w-full rotate-12 bg-slate-300"></div>
            <div className="absolute left-0 top-1/2 h-px w-full -rotate-6 bg-slate-300"></div>
            <div className="absolute left-1/4 top-0 h-full w-px rotate-3 bg-slate-300"></div>
            <div className="absolute left-3/4 top-0 h-full w-px -rotate-12 bg-slate-300"></div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute -inset-4 animate-ping rounded-full bg-teal-500/30"></div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-teal-600 text-sm font-bold text-white shadow-lg">
                P
              </div>
            </div>
          </div>

          {markers.map((marker, i) => (
            <div
              key={marker.label}
              className="absolute z-10 transition-all duration-1000 ease-in-out"
              style={{ left: marker.x, top: marker.y }}
            >
              <div className="relative">
                <div
                  className={cn(
                    'h-5 w-5 rounded-full border-2 border-white shadow-md transition-transform',
                    marker.color,
                    activeMarker === i ? 'scale-150' : 'scale-100',
                  )}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="absolute -top-12 left-1/2 z-30 -translate-x-1/2 transition-transform duration-500 group-hover:-translate-y-4"
          style={{ transform: 'translateZ(80px)' }}
        >
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900 px-6 py-3 font-bold text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-400"></span>
            <span>
              Viability Score: <span className="text-teal-400">84/100</span>
            </span>
          </div>
        </div>

        <div
          className="absolute -left-16 top-1/4 z-30 w-64 transition-transform duration-500 group-hover:-translate-x-4"
          style={{ transform: 'translateZ(120px)' }}
        >
          <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-xl">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[8px] font-bold text-white">
                AI
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Live Metric
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{active.label}</p>
              <p className="text-xs font-medium italic text-teal-600">{active.value}</p>
            </div>
          </div>
        </div>

        <div
          className="absolute z-30 transition-all duration-700 ease-in-out"
          style={{
            left: active.x,
            top: active.y,
            transform: 'translateZ(60px) translateY(-40px)',
          }}
        >
          <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-lg">
            <div className={cn('h-2 w-2 rounded-full', active.color)}></div>
            {active.label}
          </div>
        </div>
      </div>
    </div>
  );
}
