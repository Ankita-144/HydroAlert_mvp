import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { InteractiveMap } from '@/components/InteractiveMap';
import { useWaterData } from '@/contexts/WaterDataContext';
import { WaterSource } from '@/types/water';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Building, Clock, User, Droplets, FlaskConical } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Map() {
  const { waterSources, waterTests } = useWaterData();
  const [selectedSource, setSelectedSource] = useState<WaterSource | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = (source: WaterSource) => {
    setSelectedSource(source);
    setShowDetails(true);
  };

  const latestTest = selectedSource 
    ? waterTests.find(t => t.sourceId === selectedSource.id)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold font-display">Campus Map</h1>
          <p className="text-muted-foreground mt-1">
            Interactive view of all water sources and their current status
          </p>
        </div>

        <div className="h-[calc(100vh-200px)] min-h-[500px]">
          <InteractiveMap sources={waterSources} onViewDetails={handleViewDetails} />
        </div>
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Droplets className="h-5 w-5 text-primary" />
              {selectedSource?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSource && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={selectedSource.status} size="lg" />
                <span className="text-sm text-muted-foreground font-mono">
                  {selectedSource.buildingCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedSource.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDistanceToNow(selectedSource.lastTested, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm col-span-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Tested by {selectedSource.testedBy}</span>
                </div>
              </div>

              {latestTest && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FlaskConical className="h-4 w-4" />
                    Latest Test Results
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-background rounded p-2">
                      <span className="text-muted-foreground">pH Level</span>
                      <p className="font-semibold">{latestTest.phLevel?.toFixed(1) ?? 'N/A'}</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <span className="text-muted-foreground">Chlorine</span>
                      <p className="font-semibold">{latestTest.chlorine?.toFixed(1) ?? 'N/A'} ppm</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <span className="text-muted-foreground">Turbidity</span>
                      <p className="font-semibold">{latestTest.turbidity?.toFixed(1) ?? 'N/A'} NTU</p>
                    </div>
                    <div className="bg-background rounded p-2">
                      <span className="text-muted-foreground">Hardness</span>
                      <p className="font-semibold">{latestTest.hardness?.toFixed(0) ?? 'N/A'} ppm</p>
                    </div>
                  </div>
                  {latestTest.notes && (
                    <p className="text-sm text-muted-foreground italic">{latestTest.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Tested on {format(latestTest.testDate, 'PPpp')}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDetails(false)}>
                  Close
                </Button>
                <Button className="flex-1" onClick={() => navigate('/upload')}>
                  New Test
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
