import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'available' | 'coming-soon';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'available', className = '' }) => {
  const variantStyles = {
    'available': 'bg-theme-accent text-white',
    'coming-soon': 'bg-medium-grey text-gray-700'
  };

  return (
    <span className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
