import { WaterSource, WaterTest, DashboardStats } from '@/types/water';

export const mockWaterSources: WaterSource[] = [
  {
    id: '1',
    name: 'Main Library Fountain',
    location: 'Building A, Floor 1',
    latitude: 40.7128,
    longitude: -74.0060,
    status: 'safe',
    lastTested: new Date(Date.now() - 2 * 60 * 60 * 1000),
    testedBy: 'Dr. Sarah Chen',
    buildingCode: 'LIB-A1',
  },
  {
    id: '2',
    name: 'Science Building Cooler',
    location: 'Building B, Floor 2',
    latitude: 40.7138,
    longitude: -74.0070,
    status: 'safe',
    lastTested: new Date(Date.now() - 4 * 60 * 60 * 1000),
    testedBy: 'Mark Thompson',
    buildingCode: 'SCI-B2',
  },
  {
    id: '3',
    name: 'Cafeteria Main',
    location: 'Student Center',
    latitude: 40.7118,
    longitude: -74.0050,
    status: 'borderline',
    lastTested: new Date(Date.now() - 6 * 60 * 60 * 1000),
    testedBy: 'Lisa Park',
    buildingCode: 'CAF-SC',
  },
  {
    id: '4',
    name: 'Gym Water Station',
    location: 'Athletic Complex',
    latitude: 40.7148,
    longitude: -74.0080,
    status: 'safe',
    lastTested: new Date(Date.now() - 8 * 60 * 60 * 1000),
    testedBy: 'James Wilson',
    buildingCode: 'GYM-AC',
  },
  {
    id: '5',
    name: 'Dormitory Hall A',
    location: 'Residence Building A',
    latitude: 40.7108,
    longitude: -74.0040,
    status: 'unsafe',
    lastTested: new Date(Date.now() - 1 * 60 * 60 * 1000),
    testedBy: 'Dr. Sarah Chen',
    buildingCode: 'DRM-A',
  },
  {
    id: '6',
    name: 'Engineering Lab',
    location: 'Building C, Floor 3',
    latitude: 40.7158,
    longitude: -74.0090,
    status: 'safe',
    lastTested: new Date(Date.now() - 12 * 60 * 60 * 1000),
    testedBy: 'Mike Johnson',
    buildingCode: 'ENG-C3',
  },
  {
    id: '7',
    name: 'Art Center Fountain',
    location: 'Arts Building',
    latitude: 40.7098,
    longitude: -74.0030,
    status: 'borderline',
    lastTested: new Date(Date.now() - 24 * 60 * 60 * 1000),
    testedBy: 'Emily Davis',
    buildingCode: 'ART-AB',
  },
  {
    id: '8',
    name: 'Medical Center',
    location: 'Health Services',
    latitude: 40.7168,
    longitude: -74.0100,
    status: 'safe',
    lastTested: new Date(Date.now() - 3 * 60 * 60 * 1000),
    testedBy: 'Dr. Robert Lee',
    buildingCode: 'MED-HS',
  },
];

export const mockWaterTests: WaterTest[] = [
  {
    id: 't1',
    sourceId: '5',
    sourceName: 'Dormitory Hall A',
    testDate: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'unsafe',
    testedBy: 'Dr. Sarah Chen',
    notes: 'High chlorine levels detected. Maintenance notified.',
    phLevel: 8.5,
    chlorine: 4.2,
    turbidity: 2.1,
    hardness: 180,
  },
  {
    id: 't2',
    sourceId: '3',
    sourceName: 'Cafeteria Main',
    testDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
    status: 'borderline',
    testedBy: 'Lisa Park',
    notes: 'Slightly elevated turbidity. Monitoring continues.',
    phLevel: 7.2,
    chlorine: 1.8,
    turbidity: 1.5,
    hardness: 140,
  },
  {
    id: 't3',
    sourceId: '1',
    sourceName: 'Main Library Fountain',
    testDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'safe',
    testedBy: 'Dr. Sarah Chen',
    notes: 'All parameters within normal range.',
    phLevel: 7.0,
    chlorine: 1.0,
    turbidity: 0.5,
    hardness: 120,
  },
  {
    id: 't4',
    sourceId: '2',
    sourceName: 'Science Building Cooler',
    testDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: 'safe',
    testedBy: 'Mark Thompson',
    phLevel: 7.1,
    chlorine: 0.9,
    turbidity: 0.3,
    hardness: 115,
  },
  {
    id: 't5',
    sourceId: '7',
    sourceName: 'Art Center Fountain',
    testDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'borderline',
    testedBy: 'Emily Davis',
    notes: 'pH slightly high. Retest scheduled.',
    phLevel: 7.8,
    chlorine: 1.5,
    turbidity: 1.2,
    hardness: 160,
  },
];

export const mockDashboardStats: DashboardStats = {
  totalSources: 8,
  safeSources: 5,
  borderlineSources: 2,
  unsafeSources: 1,
  testsToday: 4,
  testsThisWeek: 23,
  activeAlerts: 1,
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'status-safe';
    case 'borderline':
      return 'status-borderline';
    case 'unsafe':
      return 'status-unsafe';
    default:
      return 'bg-muted';
  }
};

export const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'safe':
      return 'status-safe-soft';
    case 'borderline':
      return 'status-borderline-soft';
    case 'unsafe':
      return 'status-unsafe-soft';
    default:
      return 'bg-muted';
  }
};
