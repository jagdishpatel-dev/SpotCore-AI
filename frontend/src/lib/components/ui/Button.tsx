import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ComponentType, ReactNode } from 'react';
import { cn } from '$lib/utils/cn';

const base =
  'group relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight rounded-full transition-all duration-200 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<string, string> = {
  default:
    'bg-[var(--bg-surface)] text-text-primary border border-[var(--border-soft)] hover:border-accent-cyan/40 hover:-translate-y-[1px]',
  cyan:
    'bg-spotcore-accent text-white shadow-[0_18px_50px_-18px_rgba(15,124,117,0.38)] hover:bg-spotcore-accent-hover hover:shadow-[0_22px_60px_-18px_rgba(15,124,117,0.42)] hover:scale-[1.02] active:scale-[0.99]',
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

type LinkLikeProps = {
  href: string;
  className?: string;
  children?: ReactNode;
  target?: string;
  rel?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'children'>;

export interface ButtonProps {
  href?: string | null;
  Link?: ComponentType<LinkLikeProps>;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'cyan' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  target?: string | null;
  rel?: string | null;
  className?: string;
  children?: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
}

export default function Button({
  href = null,
  Link,
  type = 'button',
  variant = 'cyan',
  size = 'md',
  disabled = false,
  target = null,
  rel = null,
  className,
  children,
  onClick,
  ...rest
}: ButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonProps>) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    const anchorRel =
      rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined);
    const anchorProps = {
      href,
      target: target ?? undefined,
      rel: anchorRel,
      className: classes,
      onClick,
      ...rest,
    } as LinkLikeProps;

    if (Link) {
      return <Link {...anchorProps}>{children}</Link>;
    }

    return <a {...anchorProps}>{children}</a>;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
