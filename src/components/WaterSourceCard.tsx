import React from 'react';
import { cn } from '@/lib/utils';
import { WaterSource } from '@/types/water';
import { StatusBadge } from './StatusBadge';
import { MapPin, Clock, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface WaterSourceCardProps {
  source: WaterSource;
  onClick?: () => void;
  className?: string;
}

export function WaterSourceCard({ source, onClick, className }: WaterSourceCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 shadow-soft transition-all duration-300',
        'hover:shadow-elevated hover:border-primary/30 cursor-pointer',
        className
      )}
    >
      {/* Status indicator line */}
      <div className={cn(
        'absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5',
        source.status === 'safe' && 'bg-status-safe',
        source.status === 'borderline' && 'bg-status-borderline',
        source.status === 'unsafe' && 'bg-status-unsafe'
      )} />

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {source.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {source.location}
            </p>
          </div>
          <StatusBadge status={source.status} size="sm" />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(source.lastTested, { addSuffix: true })}
          </span>
          {source.testedBy && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              {source.testedBy}
            </span>
          )}
        </div>
      </div>

      {/* Pulse animation for unsafe sources */}
      {source.status === 'unsafe' && (
        <div className="absolute top-3 right-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-unsafe opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-unsafe"></span>
          </span>
        </div>
      )}
    </div>
  );
}
