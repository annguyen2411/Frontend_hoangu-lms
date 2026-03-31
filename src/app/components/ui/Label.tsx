import * as LabelPrimitive from '@radix-ui/react-label';
import { ReactNode } from 'react';

interface LabelProps {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}

export function Label({ children, className = '', htmlFor }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
      htmlFor={htmlFor}
    >
      {children}
    </LabelPrimitive.Root>
  );
}
