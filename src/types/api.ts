// API Response Types

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

// Backend returns 'token' not 'accessToken'
export interface LoginResponse {
  token: string; // Backend uses 'token' field
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'fiscal' | 'operator' | 'driver';
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Zone Types
export interface Zone {
  id: string;
  code: string;
  name: string;
  address: string;
  latitude?: string;
  longitude?: string;
  pricePerPeriod: string;
  periodMinutes: number;
  maxTimeMinutes: number;
  totalSpots: number;
  status: 'active' | 'inactive';
  operatingHours?: any;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  occupiedSpots: number;
}

export interface CreateZoneRequest {
  code: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  pricePerPeriod: number;
  periodMinutes: number;
  maxTimeMinutes: number;
  totalSpots: number;
  operatingHours?: any;
}

export interface UpdateZoneRequest {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  pricePerPeriod?: number;
  periodMinutes?: number;
  maxTimeMinutes?: number;
  totalSpots?: number;
  status?: 'active' | 'inactive';
  operatingHours?: any;
}

export interface ZonesListResponse {
  data: Zone[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Parking Types
export interface Parking {
  id: string;
  userId: string;
  vehicleId: string;
  zoneId: string;
  plate: string;
  startTime: string;
  expectedEndTime: string;
  actualEndTime?: string;
  requestedMinutes: number;
  actualMinutes?: number;
  creditsUsed: number;
  creditsRefunded: number;
  status: 'active' | 'expiring' | 'expired' | 'completed' | 'cancelled';
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  zone?: {
    id: string;
    name: string;
    address: string;
    code: string;
  };
  vehicle?: {
    id: string;
    plate: string;
    nickname?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  timeRemaining?: number;
}

export interface ParkingByPlateResponse {
  found: boolean;
  parking: Parking | null;
  canCreateNotification?: boolean;
  reason?: string;
}

export interface ParkingsListResponse {
  data: Parking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardMetrics {
  activeParkings: number;
  totalRevenueToday: number;
  activeUsers: number;
  registeredZones: number;
}

