import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  message: string;
  sourceName: string;
  onDismiss?: () => void;
  className?: string;
}

export function AlertBanner({ message, sourceName, onDismiss, className }: AlertBannerProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-status-unsafe/10 border border-status-unsafe/30 p-4',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-status-unsafe/20 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-status-unsafe" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-status-unsafe">Water Quality Alert</h4>
          <p className="text-sm text-foreground mt-1">
            <span className="font-medium">{sourceName}</span>: {message}
          </p>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-status-unsafe/5 animate-pulse-soft pointer-events-none" />
    </div>
  );
}
