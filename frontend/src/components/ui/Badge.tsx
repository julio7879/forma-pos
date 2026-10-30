import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ className = '', variant = 'neutral', children, ...props }) => {
  const variants = {
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-cream', // Usamos crema para contraste sobre vinotinto
    info: 'bg-surface text-cream',
    neutral: 'bg-ink/80 text-cream border border-surface',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-sans ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};