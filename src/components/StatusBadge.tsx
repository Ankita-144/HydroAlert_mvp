import React from 'react';
import { cn } from '@/lib/utils';
import { WaterStatus } from '@/types/water';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: WaterStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  safe: {
    label: 'Safe',
    icon: CheckCircle,
    className: 'status-safe-soft',
  },
  borderline: {
    label: 'Borderline',
    icon: AlertTriangle,
    className: 'status-borderline-soft',
  },
  unsafe: {
    label: 'Unsafe',
    icon: XCircle,
    className: 'status-unsafe-soft',
  },
};

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
};

const iconSizeConfig = {
  sm: 12,
  md: 14,
  lg: 16,
};

export function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className 
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full transition-all',
        config.className,
        sizeConfig[size],
        className
      )}
    >
      {showIcon && <Icon size={iconSizeConfig[size]} />}
      {config.label}
    </span>
  );
}
