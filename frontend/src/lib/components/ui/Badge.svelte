<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let variant:
    | 'default'
    | 'outline'
    | 'cyan'
    | 'success'
    | 'destructive'
    | 'muted' = 'outline';
  let className = '';
  export { className as class };

  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors';

  const variants: Record<string, string> = {
    default:
      'border-transparent bg-accent-cyan/15 text-accent-cyan',
    outline:
      'border-[var(--border-soft)] bg-[var(--bg-surface)]/60 text-text-secondary backdrop-blur-sm',
    cyan: 'border-accent-cyan/30 bg-accent-cyan/12 text-accent-cyan',
    success: 'border-positive/30 bg-positive/12 text-positive',
    destructive: 'border-danger/30 bg-danger/10 text-danger',
    muted:
      'border-[var(--border-soft)] bg-transparent text-text-muted',
  };
</script>

<span class={cn(base, variants[variant], className)}>
  <slot />
</span>
