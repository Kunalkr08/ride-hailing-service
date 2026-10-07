import { CarType, Coupon } from '../common/types';

export interface PricingInput {
  distanceKm: number;
  carType: CarType;
  coupon?: Coupon;
}

export interface PricingResult {
  baseFare: number;
  discount: number;
  finalFare: number;
}

export interface PricingStrategy {
  calculate(input: PricingInput): PricingResult;
}
