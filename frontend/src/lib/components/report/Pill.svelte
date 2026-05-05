<script lang="ts">
  export let tone: 'neutral' | 'cyan' | 'positive' | 'warning' | 'danger' | 'blue' = 'neutral';
  export let size: 'sm' | 'md' = 'sm';
  let className: string = '';
  export { className as class };

  const toneClass: Record<string, string> = {
    neutral: 'border-line text-ink/90',
    cyan: 'border-accent/40 text-accent',
    blue: 'border-accent-2/40 text-accent-2',
    positive: 'border-positive/40 text-positive',
    warning: 'border-warning/40 text-warning',
    danger: 'border-danger/40 text-danger',
  };
  const sizeClass: Record<string, string> = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
  };
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-full border bg-white/[0.02] font-medium tracking-tight {toneClass[tone]} {sizeClass[size]} {className}"
>
  <slot />
</span>
