import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WaterSource } from '@/types/water';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Building, Clock, Navigation, Locate, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InteractiveMapProps {
  sources: WaterSource[];
  onViewDetails?: (source: WaterSource) => void;
}

// Custom marker icons based on status
const createMarkerIcon = (status: 'safe' | 'borderline' | 'unsafe', isSelected: boolean = false) => {
  const colors = {
    safe: '#22c55e',
    borderline: '#f59e0b',
    unsafe: '#ef4444',
  };

  const size = isSelected ? 40 : 32;
  const color = colors[status];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container ${status} ${isSelected ? 'selected' : ''}">
        ${status === 'unsafe' ? '<div class="pulse-ring"></div>' : ''}
        <div class="marker-pin" style="background-color: ${color}; width: ${size}px; height: ${size}px;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 60%; height: 60%;">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div class="user-location-container">
      <div class="user-location-pulse"></div>
      <div class="user-location-dot"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Component to handle map events and user location
function MapController({ 
  userLocation, 
  onLocate 
}: { 
  userLocation: [number, number] | null;
  onLocate: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 17, { duration: 1 });
    }
  }, [userLocation, map]);

  return null;
}

// Legend component
function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-3">
      <h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Status</h4>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-3 w-3 rounded-full bg-status-safe shadow-sm" />
          <span>Safe</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-3 w-3 rounded-full bg-status-borderline shadow-sm" />
          <span>Borderline</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-3 w-3 rounded-full bg-status-unsafe shadow-sm" />
          <span>Unsafe</span>
        </div>
      </div>
    </div>
  );
}

export function InteractiveMap({ sources, onViewDetails }: InteractiveMapProps) {
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Calculate map center from sources
  const center = useMemo(() => {
    if (sources.length === 0) return [40.7128, -74.006] as [number, number]; // Default to NYC
    const avgLat = sources.reduce((sum, s) => sum + s.latitude, 0) / sources.length;
    const avgLng = sources.reduce((sum, s) => sum + s.longitude, 0) / sources.length;
    return [avgLat, avgLng] as [number, number];
  }, [sources]);

  // Handle geolocation
  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLocating(false);
      },
      (error) => {
        setLocationError('Unable to get location');
        setIsLocating(false);
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border shadow-soft">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-card via-card/95 to-transparent z-[1000] pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div>
            <h3 className="font-semibold font-display text-lg">Campus Water Sources</h3>
            <p className="text-sm text-muted-foreground">{sources.length} locations monitored</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLocate}
            disabled={isLocating}
            className="bg-card/80 backdrop-blur-sm"
          >
            {isLocating ? (
              <Locate className="h-4 w-4 animate-pulse" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">My Location</span>
          </Button>
        </div>
        {locationError && (
          <p className="text-xs text-destructive mt-2 pointer-events-auto">{locationError}</p>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={center}
        zoom={16}
        className="w-full h-full z-0"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <MapController userLocation={userLocation} onLocate={handleLocate} />

        {/* Water source markers */}
        {sources.map((source) => (
          <Marker
            key={source.id}
            position={[source.latitude, source.longitude]}
            icon={createMarkerIcon(source.status, selectedSource?.id === source.id)}
            eventHandlers={{
              click: () => setSelectedSource(source),
            }}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={source.status} size="sm" />
                  <span className="text-xs text-muted-foreground font-mono">
                    {source.buildingCode}
                  </span>
                </div>
                <h4 className="font-semibold text-sm mb-1">{source.name}</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {source.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(source.lastTested, { addSuffix: true })}
                  </div>
                </div>
                {onViewDetails && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => onViewDetails(source)}
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-medium text-sm">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Legend */}
      <MapLegend />

      {/* Selected Source Panel */}
      {selectedSource && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card/95 to-transparent z-[1000]">
          <div className="bg-card rounded-xl border shadow-elevated p-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedSource.status} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {selectedSource.buildingCode}
                  </span>
                </div>
                <h4 className="font-semibold mt-2 truncate">{selectedSource.name}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5" />
                    <span className="truncate">{selectedSource.location}</span>
                  </span>
                  <span className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDistanceToNow(selectedSource.lastTested, { addSuffix: true })}
                  </span>
                </div>
              </div>
              {onViewDetails && (
                <Button size="sm" className="flex-shrink-0 ml-4" onClick={() => onViewDetails(selectedSource)}>
                  View Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
