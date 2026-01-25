import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WaterSource } from '@/types/water';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Building, Clock, Navigation, Locate, ChevronRight, Shuffle, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface InteractiveMapProps {
  sources: WaterSource[];
  onViewDetails?: (source: WaterSource) => void;
}

interface CustomPoint {
  lat: number;
  lng: number;
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

// Custom point marker
const createCustomPointIcon = () => {
  return L.divIcon({
    className: 'custom-point-marker',
    html: `
      <div class="custom-point-container">
        <div class="custom-point-pulse"></div>
        <div class="custom-point-dot"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
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
  flyToLocation,
  onFlyComplete,
}: { 
  userLocation: [number, number] | null;
  flyToLocation: [number, number] | null;
  onFlyComplete: () => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo(userLocation, 17, { duration: 1 });
    }
  }, [userLocation, map]);

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(flyToLocation, 17, { duration: 0.8 });
      onFlyComplete();
    }
  }, [flyToLocation, map, onFlyComplete]);

  return null;
}

// Custom point click handler
function CustomPointHandler({
  isActive,
  onPointClick,
}: {
  isActive: boolean;
  onPointClick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (isActive) {
        onPointClick(e.latlng);
      }
    },
  });

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
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);
  const [customPointMode, setCustomPointMode] = useState(false);
  const [customPoint, setCustomPoint] = useState<CustomPoint | null>(null);
  const popupRefs = useRef<{ [key: string]: L.Popup }>({});

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

  // Handle random source selection
  const handleRandomSource = () => {
    if (sources.length === 0) return;
    const randomIndex = Math.floor(Math.random() * sources.length);
    const randomSource = sources[randomIndex];
    setSelectedSource(randomSource);
    setCustomPoint(null);
    setCustomPointMode(false);
    setFlyToLocation([randomSource.latitude, randomSource.longitude]);
  };

  // Handle custom point mode toggle
  const toggleCustomPointMode = () => {
    setCustomPointMode(!customPointMode);
    if (!customPointMode) {
      setSelectedSource(null);
      setCustomPoint(null);
    }
  };

  // Handle custom point click
  const handleCustomPointClick = (latlng: L.LatLng) => {
    setCustomPoint({ lat: latlng.lat, lng: latlng.lng });
    setSelectedSource(null);
    setFlyToLocation([latlng.lat, latlng.lng]);
  };

  // Handle analyze at custom point
  const handleAnalyzeCustomPoint = () => {
    if (customPoint) {
      navigate('/upload', { 
        state: { 
          customLocation: {
            lat: customPoint.lat,
            lng: customPoint.lng,
            name: `Custom Location (${customPoint.lat.toFixed(4)}, ${customPoint.lng.toFixed(4)})`
          }
        }
      });
    }
  };

  // Clear custom point
  const clearCustomPoint = () => {
    setCustomPoint(null);
    setCustomPointMode(false);
  };

  // Handle marker click - only show bottom panel, close any popups
  const handleMarkerClick = (source: WaterSource) => {
    setSelectedSource(source);
    setCustomPoint(null);
    setCustomPointMode(false);
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border shadow-soft">
      {/* Map Header */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-md z-[1000] pointer-events-none border-b border-border/50">
        <div className="flex items-center justify-between pointer-events-auto">
          <div>
            <h3 className="font-semibold font-display text-lg">Campus Water Sources</h3>
            <p className="text-sm text-muted-foreground">{sources.length} locations monitored</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={customPointMode ? "default" : "outline"}
              size="sm"
              onClick={toggleCustomPointMode}
              className={cn(
                "bg-card/80 backdrop-blur-sm",
                customPointMode && "bg-primary text-primary-foreground"
              )}
            >
              <MapPin className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Custom Point</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRandomSource}
              className="bg-card/80 backdrop-blur-sm"
              disabled={sources.length === 0}
            >
              <Shuffle className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Random</span>
            </Button>
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
        </div>
        {locationError && (
          <p className="text-xs text-destructive mt-2 pointer-events-auto">{locationError}</p>
        )}
        {customPointMode && (
          <p className="text-xs text-primary mt-2 pointer-events-auto animate-pulse">
            Tap anywhere on the map to place a custom test point
          </p>
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

        <MapController 
          userLocation={userLocation} 
          flyToLocation={flyToLocation}
          onFlyComplete={() => setFlyToLocation(null)}
        />

        <CustomPointHandler
          isActive={customPointMode}
          onPointClick={handleCustomPointClick}
        />

        {/* Water source markers */}
        {sources.map((source) => (
          <Marker
            key={source.id}
            position={[source.latitude, source.longitude]}
            icon={createMarkerIcon(source.status, selectedSource?.id === source.id)}
            eventHandlers={{
              click: () => handleMarkerClick(source),
            }}
          >
            <Popup className="custom-popup" autoClose={true} closeOnClick={true}>
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
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Custom point marker */}
        {customPoint && (
          <Marker
            position={[customPoint.lat, customPoint.lng]}
            icon={createCustomPointIcon()}
          />
        )}

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

      {/* Legend - hide when panel is shown */}
      {!selectedSource && !customPoint && <MapLegend />}

      {/* Selected Source Panel */}
      {selectedSource && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-md z-[1000] border-t border-border/50">
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
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setSelectedSource(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {onViewDetails && (
                  <Button size="sm" onClick={() => onViewDetails(selectedSource)}>
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Point Panel */}
      {customPoint && !selectedSource && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-card/90 backdrop-blur-md z-[1000] border-t border-border/50">
          <div className="bg-card rounded-xl border shadow-elevated p-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    Custom Point
                  </div>
                </div>
                <h4 className="font-semibold mt-2">Custom Test Location</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="font-mono text-xs">
                    {customPoint.lat.toFixed(6)}, {customPoint.lng.toFixed(6)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={clearCustomPoint}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleAnalyzeCustomPoint}>
                  Analyze Water Here
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
