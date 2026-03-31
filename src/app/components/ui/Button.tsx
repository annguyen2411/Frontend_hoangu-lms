import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  icon,
  fullWidth = false,
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    default: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md active:scale-95',
    secondary: 'bg-[var(--secondary)] text-white hover:bg-[var(--secondary-hover)] shadow-sm hover:shadow-md active:scale-95',
    outline: 'bg-transparent border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-95',
    ghost: 'bg-transparent text-foreground hover:bg-[var(--muted)] active:scale-95',
    danger: 'bg-[var(--error)] text-white hover:opacity-90 shadow-sm hover:shadow-md active:scale-95',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}