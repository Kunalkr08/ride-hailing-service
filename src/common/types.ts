export type CarType = 'SEDAN' | 'HATCHBACK';
export type RideStatus = 'ONGOING' | 'COMPLETED';

export interface Location {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  carType: CarType;
  location: Location;
  available: boolean;
}

export interface Coupon {
  code: string;
  percentage: number;
  maxDiscount?: number;
  active: boolean;
}

export interface Ride {
  id: string;
  userId: string;
  driverId: string;
  requestedCarType: CarType;
  assignedCarType: CarType;
  pickup: Location;
  status: RideStatus;
  couponCode?: string;
  couponPercentage?: number;
  couponMaxDiscount?: number;
  distanceKm?: number;
  fare?: number;
  createdAt: Date;
  completedAt?: Date;
}
