<script lang="ts">
  export let title: string;
  export let score: number;
  export let hint: string;
  export let accent: 'sky' | 'amber' | 'emerald' | 'violet' | 'rose' = 'sky';

  const bar: Record<string, string> = {
    sky: 'bg-[#2563EB]',
    amber: 'bg-[#D97706]',
    emerald: 'bg-teal-700',
    violet: 'bg-slate-500',
    rose: 'bg-[#DC2626]',
  };
</script>

<div
  class="relative overflow-hidden rounded-2xl border border-line/90 bg-surface p-5 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
>
  <div
    class={`absolute inset-y-0 left-0 w-[3px] rounded-full ${bar[accent]}`}
    aria-hidden="true"
  ></div>
  <div class="pl-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
        <p class="mt-1.5 text-sm leading-relaxed text-muted">{hint}</p>
      </div>
      <div class="text-right">
        <p class="text-3xl font-semibold tabular-nums tracking-tight text-ink">{score}</p>
        <p class="text-[11px] font-medium text-muted/80">/ 100</p>
      </div>
    </div>
  </div>
</div>
