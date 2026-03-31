import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function Badge({ 
  children, 
  variant = 'neutral', 
  size = 'md',
  icon,
  className = '' 
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-[var(--primary-light)] text-[var(--primary)]',
    secondary: 'bg-[var(--secondary-light)] text-[var(--secondary-hover)]',
    success: 'bg-[var(--success-light)] text-[var(--success)]',
    warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
    error: 'bg-[var(--error-light)] text-[var(--error)]',
    info: 'bg-[var(--info-light)] text-[var(--info)]',
    neutral: 'bg-[var(--muted)] text-muted-foreground',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
