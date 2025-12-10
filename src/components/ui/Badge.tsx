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

// Status Badge (RAG ratings)
interface StatusBadgeProps {
  status: 'red' | 'amber' | 'green';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const styles = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${styles[status]} ${className}`}>
      {status}
    </span>
  );
};

// Case Tag (Five Case Model)
interface CaseTagProps {
  caseType: string;
  className?: string;
}

export const CaseTag: React.FC<CaseTagProps> = ({ caseType, className = '' }) => {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 uppercase tracking-wide ${className}`}>
      {caseType}
    </span>
  );
};

// Priority Badge
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  const styles = {
    high: 'bg-red-600 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-slate-400 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase ${styles[priority]} ${className}`}>
      {priority} priority
    </span>
  );
};
