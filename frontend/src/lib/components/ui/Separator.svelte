<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let orientation: 'horizontal' | 'vertical' = 'horizontal';
  let className = '';
  export { className as class };
</script>

<div
  role="separator"
  aria-orientation={orientation}
  class={cn(
    'bg-[var(--border-soft)]',
    orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
    className
  )}
></div>
