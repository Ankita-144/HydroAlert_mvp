import React, { useState } from 'react';
import { WaterSource } from '@/types/water';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { MapPin, Building, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './ui/button';

interface CampusMapProps {
  sources: WaterSource[];
  onSourceClick?: (source: WaterSource) => void;
  onViewDetails?: (source: WaterSource) => void;
}

// Campus map positions (relative positions for the interactive map)
const mapPositions: Record<string, { x: number; y: number }> = {
  '1': { x: 25, y: 30 }, // Main Library
  '2': { x: 45, y: 20 }, // Science Building
  '3': { x: 35, y: 55 }, // Cafeteria
  '4': { x: 70, y: 35 }, // Gym
  '5': { x: 15, y: 70 }, // Dormitory
  '6': { x: 60, y: 15 }, // Engineering
  '7': { x: 20, y: 45 }, // Art Center
  '8': { x: 75, y: 60 }, // Medical Center
};

export function CampusMap({ sources, onSourceClick, onViewDetails }: CampusMapProps) {
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const handleSourceClick = (source: WaterSource) => {
    setSelectedSource(source);
    onSourceClick?.(source);
  };

  const handleViewDetails = () => {
    if (selectedSource && onViewDetails) {
      onViewDetails(selectedSource);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-card rounded-xl border shadow-soft overflow-hidden">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-card via-card to-transparent z-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold font-display text-lg">Campus Water Sources</h3>
            <p className="text-sm text-muted-foreground">{sources.length} locations monitored</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-status-safe" />
              Safe
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-status-borderline" />
              Borderline
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-status-unsafe" />
              Unsafe
            </span>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="absolute inset-0 pt-20 pb-4 px-4">
        {/* Grid background */}
        <div className="absolute inset-20 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Building outlines (decorative) */}
        <div className="absolute inset-0">
          <div className="absolute top-[25%] left-[20%] w-16 h-12 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[15%] left-[40%] w-20 h-16 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[50%] left-[30%] w-14 h-14 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[30%] left-[65%] w-18 h-12 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[65%] left-[10%] w-14 h-20 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[10%] left-[55%] w-16 h-10 border-2 border-dashed border-muted-foreground/20 rounded" />
          <div className="absolute top-[55%] left-[70%] w-14 h-16 border-2 border-dashed border-muted-foreground/20 rounded" />
        </div>

        {/* Map Markers */}
        {sources.map((source) => {
          const position = mapPositions[source.id] || { x: 50, y: 50 };
          const isHovered = hoveredSource === source.id;
          const isSelected = selectedSource?.id === source.id;

          return (
            <button
              key={source.id}
              onClick={() => handleSourceClick(source)}
              onMouseEnter={() => setHoveredSource(source.id)}
              onMouseLeave={() => setHoveredSource(null)}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 z-20',
                'transition-all duration-300 ease-out',
                (isHovered || isSelected) && 'z-30 scale-125'
              )}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div className="relative">
                {/* Pulse ring for unsafe */}
                {source.status === 'unsafe' && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-status-unsafe/40" />
                )}
                
                {/* Marker */}
                <div className={cn(
                  'relative h-8 w-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50',
                  'transition-all duration-200',
                  source.status === 'safe' && 'bg-status-safe',
                  source.status === 'borderline' && 'bg-status-borderline',
                  source.status === 'unsafe' && 'bg-status-unsafe'
                )}>
                  <MapPin className="h-4 w-4 text-white" />
                </div>

                {/* Tooltip */}
                {(isHovered || isSelected) && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-3 bg-card rounded-lg shadow-floating border animate-scale-in">
                    <p className="font-medium text-sm truncate">{source.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{source.location}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <StatusBadge status={source.status} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(source.lastTested, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Source Panel */}
      {selectedSource && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card to-transparent">
          <div className="bg-card rounded-xl border shadow-elevated p-4 animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedSource.status} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedSource.buildingCode}
                  </span>
                </div>
                <h4 className="font-semibold mt-2">{selectedSource.name}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    {selectedSource.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(selectedSource.lastTested, { addSuffix: true })}
                  </span>
                </div>
              </div>
              <Button size="sm" className="flex-shrink-0" onClick={handleViewDetails}>
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
