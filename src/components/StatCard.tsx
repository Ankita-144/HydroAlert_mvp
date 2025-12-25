import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'safe' | 'borderline' | 'unsafe';
  className?: string;
}

const variantStyles = {
  default: 'bg-card',
  safe: 'bg-status-safe-bg border-status-safe/20',
  borderline: 'bg-status-borderline-bg border-status-borderline/20',
  unsafe: 'bg-status-unsafe-bg border-status-unsafe/20',
};

const iconVariantStyles = {
  default: 'bg-primary/10 text-primary',
  safe: 'bg-status-safe/20 text-status-safe',
  borderline: 'bg-status-borderline/20 text-status-borderline',
  unsafe: 'bg-status-unsafe/20 text-status-unsafe',
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 shadow-soft transition-all hover:shadow-elevated',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold font-display">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-status-safe' : 'text-status-unsafe'
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn(
          'rounded-lg p-3',
          iconVariantStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
