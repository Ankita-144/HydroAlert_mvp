export type WaterStatus = 'safe' | 'borderline' | 'unsafe';

export interface WaterSource {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: WaterStatus;
  lastTested: Date;
  testedBy?: string;
  buildingCode?: string;
}

export interface WaterTest {
  id: string;
  sourceId: string;
  sourceName: string;
  testDate: Date;
  status: WaterStatus;
  imageUrl?: string;
  testedBy: string;
  notes?: string;
  phLevel?: number;
  chlorine?: number;
  turbidity?: number;
  hardness?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  avatar?: string;
}

export interface DashboardStats {
  totalSources: number;
  safeSources: number;
  borderlineSources: number;
  unsafeSources: number;
  testsToday: number;
  testsThisWeek: number;
  activeAlerts: number;
}
