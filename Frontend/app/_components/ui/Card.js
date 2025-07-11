import { cn } from '@/lib/utils';

export default function Card({ 
  children, 
  className, 
  hover = false, 
  gradient = false,
  shadow = 'md',
  ...props 
}) {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 transition-all duration-300';
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    none: 'shadow-none'
  };
  
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50' : '';

  return (
    <div 
      className={cn(
        baseClasses,
        shadowClasses[shadow],
        hoverClasses,
        gradientClasses,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ children, className, ...props }) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl', className)} {...props}>
      {children}
    </div>
  );
}