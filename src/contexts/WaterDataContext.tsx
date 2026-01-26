import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WaterSource, WaterTest, DashboardStats, WaterStatus } from '@/types/water';
import { mockWaterSources as initialSources, mockWaterTests as initialTests } from '@/data/mockData';

 interface WaterDataContextType {
   waterSources: WaterSource[];
   waterTests: WaterTest[];
   dashboardStats: DashboardStats;
   addTestResult: (sourceId: string, result: {
     status: WaterStatus;
     phLevel: number;
     chlorine: number;
     turbidity: number;
     hardness: number;
     testedBy: string;
     notes?: string;
   }) => void;
   addCustomSource: (name: string, latitude: number, longitude: number) => string;
   getSourceById: (id: string) => WaterSource | undefined;
 }

const WaterDataContext = createContext<WaterDataContextType | undefined>(undefined);

export function WaterDataProvider({ children }: { children: ReactNode }) {
  const [waterSources, setWaterSources] = useState<WaterSource[]>(initialSources);
  const [waterTests, setWaterTests] = useState<WaterTest[]>(initialTests);

  const calculateStats = (sources: WaterSource[], tests: WaterTest[]): DashboardStats => {
    const safeSources = sources.filter(s => s.status === 'safe').length;
    const borderlineSources = sources.filter(s => s.status === 'borderline').length;
    const unsafeSources = sources.filter(s => s.status === 'unsafe').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const testsToday = tests.filter(t => new Date(t.testDate) >= today).length;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const testsThisWeek = tests.filter(t => new Date(t.testDate) >= weekAgo).length;

    return {
      totalSources: sources.length,
      safeSources,
      borderlineSources,
      unsafeSources,
      testsToday,
      testsThisWeek,
      activeAlerts: unsafeSources,
    };
  };

  const addTestResult = (sourceId: string, result: {
    status: WaterStatus;
    phLevel: number;
    chlorine: number;
    turbidity: number;
    hardness: number;
    testedBy: string;
    notes?: string;
  }) => {
    const source = waterSources.find(s => s.id === sourceId);
    if (!source) return;

    // Create new test
    const newTest: WaterTest = {
      id: `t${Date.now()}`,
      sourceId,
      sourceName: source.name,
      testDate: new Date(),
      status: result.status,
      testedBy: result.testedBy,
      notes: result.notes,
      phLevel: result.phLevel,
      chlorine: result.chlorine,
      turbidity: result.turbidity,
      hardness: result.hardness,
    };

    // Update tests list
    setWaterTests(prev => [newTest, ...prev]);

    // Update source status
    setWaterSources(prev => prev.map(s => 
      s.id === sourceId 
        ? { ...s, status: result.status, lastTested: new Date(), testedBy: result.testedBy }
        : s
    ));
  };

  const getSourceById = (id: string) => waterSources.find(s => s.id === id);

   const addCustomSource = (name: string, latitude: number, longitude: number): string => {
     const customId = `custom-${Date.now()}`;
     const newSource: WaterSource = {
       id: customId,
       name,
       location: `Custom Location`,
       latitude,
       longitude,
       status: 'borderline',
       lastTested: new Date(),
       testedBy: 'System',
       buildingCode: 'CUSTOM'
     };
     setWaterSources(prev => [...prev, newSource]);
     return customId;
   };
 
  const dashboardStats = calculateStats(waterSources, waterTests);

  return (
    <WaterDataContext.Provider value={{
      waterSources,
      waterTests,
      dashboardStats,
      addTestResult,
      addCustomSource,
      getSourceById,
    }}>
      {children}
    </WaterDataContext.Provider>
  );
}

export function useWaterData() {
  const context = useContext(WaterDataContext);
  if (context === undefined) {
    throw new Error('useWaterData must be used within a WaterDataProvider');
  }
  return context;
}
