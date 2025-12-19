// Mock Data for Zona Azul Administrative System

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'fiscal' | 'operator';
  avatar?: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  pricePerPeriod: number;
  periodMinutes: number;
  maxTimeMinutes: number;
  totalSpots: number;
  occupiedSpots: number;
  status: 'active' | 'inactive';
  address: string;
}

export interface ActiveParking {
  id: string;
  plate: string;
  zoneId: string;
  zoneName: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'expiring' | 'expired';
  creditsUsed: number;
}

export interface ParkingHistory {
  id: string;
  plate: string;
  zoneId: string;
  zoneName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  creditsConsumed: number;
  status: 'completed' | 'expired' | 'cancelled';
}

// Mock User
export const mockUser: User = {
  id: '1',
  name: 'Carlos Oliveira',
  email: 'carlos.oliveira@prefeitura.gov.br',
  role: 'admin',
};

// Mock Zones
export const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Centro Histórico',
    code: 'ZA-001',
    pricePerPeriod: 3.50,
    periodMinutes: 60,
    maxTimeMinutes: 120,
    totalSpots: 150,
    occupiedSpots: 98,
    status: 'active',
    address: 'Rua XV de Novembro, Centro',
  },
  {
    id: '2',
    name: 'Praça da República',
    code: 'ZA-002',
    pricePerPeriod: 4.00,
    periodMinutes: 60,
    maxTimeMinutes: 180,
    totalSpots: 80,
    occupiedSpots: 45,
    status: 'active',
    address: 'Praça da República, Centro',
  },
  {
    id: '3',
    name: 'Av. Paulista',
    code: 'ZA-003',
    pricePerPeriod: 5.00,
    periodMinutes: 30,
    maxTimeMinutes: 90,
    totalSpots: 200,
    occupiedSpots: 178,
    status: 'active',
    address: 'Av. Paulista, Bela Vista',
  },
  {
    id: '4',
    name: 'Rua Augusta',
    code: 'ZA-004',
    pricePerPeriod: 3.00,
    periodMinutes: 60,
    maxTimeMinutes: 120,
    totalSpots: 60,
    occupiedSpots: 0,
    status: 'inactive',
    address: 'Rua Augusta, Consolação',
  },
  {
    id: '5',
    name: 'Mercado Municipal',
    code: 'ZA-005',
    pricePerPeriod: 4.50,
    periodMinutes: 60,
    maxTimeMinutes: 240,
    totalSpots: 120,
    occupiedSpots: 89,
    status: 'active',
    address: 'Rua Cantareira, Centro',
  },
];

// Generate active parkings
const now = new Date();
export const mockActiveParkings: ActiveParking[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    zoneId: '1',
    zoneName: 'Centro Histórico',
    startTime: new Date(now.getTime() - 45 * 60000),
    endTime: new Date(now.getTime() + 15 * 60000),
    status: 'expiring',
    creditsUsed: 3.50,
  },
  {
    id: '2',
    plate: 'DEF-5678',
    zoneId: '2',
    zoneName: 'Praça da República',
    startTime: new Date(now.getTime() - 30 * 60000),
    endTime: new Date(now.getTime() + 90 * 60000),
    status: 'active',
    creditsUsed: 8.00,
  },
  {
    id: '3',
    plate: 'GHI-9012',
    zoneId: '3',
    zoneName: 'Av. Paulista',
    startTime: new Date(now.getTime() - 60 * 60000),
    endTime: new Date(now.getTime() - 5 * 60000),
    status: 'expired',
    creditsUsed: 5.00,
  },
  {
    id: '4',
    plate: 'JKL-3456',
    zoneId: '1',
    zoneName: 'Centro Histórico',
    startTime: new Date(now.getTime() - 20 * 60000),
    endTime: new Date(now.getTime() + 40 * 60000),
    status: 'active',
    creditsUsed: 3.50,
  },
  {
    id: '5',
    plate: 'MNO-7890',
    zoneId: '5',
    zoneName: 'Mercado Municipal',
    startTime: new Date(now.getTime() - 90 * 60000),
    endTime: new Date(now.getTime() + 30 * 60000),
    status: 'active',
    creditsUsed: 9.00,
  },
];

// Generate parking history
export const mockParkingHistory: ParkingHistory[] = [
  {
    id: '1',
    plate: 'ABC-1234',
    zoneId: '1',
    zoneName: 'Centro Histórico',
    startTime: new Date(now.getTime() - 24 * 60 * 60000),
    endTime: new Date(now.getTime() - 22 * 60 * 60000),
    duration: 120,
    creditsConsumed: 7.00,
    status: 'completed',
  },
  {
    id: '2',
    plate: 'DEF-5678',
    zoneId: '3',
    zoneName: 'Av. Paulista',
    startTime: new Date(now.getTime() - 48 * 60 * 60000),
    endTime: new Date(now.getTime() - 47 * 60 * 60000),
    duration: 60,
    creditsConsumed: 10.00,
    status: 'completed',
  },
  {
    id: '3',
    plate: 'XYZ-9999',
    zoneId: '2',
    zoneName: 'Praça da República',
    startTime: new Date(now.getTime() - 72 * 60 * 60000),
    endTime: new Date(now.getTime() - 70 * 60 * 60000),
    duration: 120,
    creditsConsumed: 8.00,
    status: 'expired',
  },
  {
    id: '4',
    plate: 'QRS-4567',
    zoneId: '5',
    zoneName: 'Mercado Municipal',
    startTime: new Date(now.getTime() - 96 * 60 * 60000),
    endTime: new Date(now.getTime() - 92 * 60 * 60000),
    duration: 240,
    creditsConsumed: 18.00,
    status: 'completed',
  },
  {
    id: '5',
    plate: 'TUV-1122',
    zoneId: '1',
    zoneName: 'Centro Histórico',
    startTime: new Date(now.getTime() - 120 * 60 * 60000),
    endTime: new Date(now.getTime() - 119 * 60 * 60000),
    duration: 60,
    creditsConsumed: 3.50,
    status: 'cancelled',
  },
];

// Dashboard metrics
export const dashboardMetrics = {
  activeParkings: mockActiveParkings.filter(p => p.status !== 'expired').length,
  totalRevenueToday: 2847.50,
  activeUsers: 1234,
  registeredZones: mockZones.filter(z => z.status === 'active').length,
};
