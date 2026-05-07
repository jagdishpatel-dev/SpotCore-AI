<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let href: string | null = null;
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let variant:
    | 'default'
    | 'cyan'
    | 'outline'
    | 'ghost'
    | 'link' = 'cyan';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled = false;
  export let target: string | null = null;
  export let rel: string | null = null;

  let className = '';
  export { className as class };

  const base =
    'group relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-full transition-all duration-200 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-60 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    default:
      'bg-[var(--bg-surface)] text-text-primary border border-[var(--border-soft)] hover:border-accent-cyan/40 hover:-translate-y-[1px]',
    cyan:
      'bg-accent-cyan text-slate-950 shadow-[0_18px_50px_-18px_rgba(34,211,238,0.55)] hover:shadow-[0_22px_60px_-18px_rgba(34,211,238,0.7)] hover:scale-[1.02] active:scale-[0.99]',
    outline:
      'bg-transparent text-text-primary border border-[var(--border-soft)] hover:border-accent-cyan/40 hover:bg-[var(--bg-surface)]/40',
    ghost:
      'bg-transparent text-text-secondary hover:text-text-primary hover:bg-[var(--bg-surface)]/40',
    link: 'bg-transparent text-accent-cyan hover:text-accent-blue underline-offset-4 hover:underline rounded-md px-0',
  };

  const sizes: Record<string, string> = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-11 px-6 text-sm',
    lg: 'h-14 px-8 text-base',
  };
</script>

{#if href}
  <a
    {href}
    target={target ?? undefined}
    rel={rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined)}
    class={cn(base, variants[variant], sizes[size], className)}
    on:click
  >
    <slot />
  </a>
{:else}
  <button
    {type}
    {disabled}
    class={cn(base, variants[variant], sizes[size], className)}
    on:click
  >
    <slot />
  </button>
{/if}
