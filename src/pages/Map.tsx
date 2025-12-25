import React from 'react';
import { Header } from '@/components/Header';
import { CampusMap } from '@/components/CampusMap';
import { mockWaterSources } from '@/data/mockData';

export default function Map() {
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
          <CampusMap sources={mockWaterSources} />
        </div>
      </main>
    </div>
  );
}
