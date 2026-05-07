<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let variant: 'default' | 'glass' | 'flat' = 'default';
  export let interactive = false;
  let className = '';
  export { className as class };

  const base =
    'relative rounded-2xl border transition-all duration-200 ease-out';

  const variants: Record<string, string> = {
    default:
      'border-[var(--border-soft)] bg-[var(--bg-surface)] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_18px_60px_-32px_rgba(2,6,23,0.6)]',
    glass:
      'border-[var(--border-soft)] glass shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_24px_60px_-28px_rgba(2,6,23,0.7)]',
    flat: 'border-[var(--border-soft)] bg-[var(--bg-surface-2)]',
  };

  $: interactiveClasses = interactive
    ? 'hover:-translate-y-1 hover:border-accent-cyan/35 hover:shadow-[0_30px_80px_-30px_rgba(34,211,238,0.22)]'
    : '';
</script>

<div class={cn(base, variants[variant], interactiveClasses, className)}>
  <slot />
</div>
