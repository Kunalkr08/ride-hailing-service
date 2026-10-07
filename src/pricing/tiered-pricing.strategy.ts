import { Injectable } from '@nestjs/common';
import { PricingInput, PricingResult, PricingStrategy } from './pricing.types';

@Injectable()
export class TieredPricingStrategy implements PricingStrategy {
  private readonly minimumFare = 50;
  private readonly rates = {
    SEDAN: { first: 10, middle: 8, long: 5 },
    HATCHBACK: { first: 8, middle: 6, long: 4 },
  } as const;

  calculate(input: PricingInput): PricingResult {
    if (input.distanceKm < 0) throw new Error('Distance cannot be negative');

    const rate = this.rates[input.carType];
    const d = input.distanceKm;
    let fare = 0;

    const firstTier = Math.min(d, 2);
    fare += firstTier * rate.first;

    const middleTier = Math.max(0, Math.min(d, 5) - 2);
    fare += middleTier * rate.middle;

    const longTier = Math.max(0, d - 5);
    fare += longTier * rate.long;

    const baseFare = Math.max(this.minimumFare, fare);
    const rawDiscount = input.coupon ? baseFare * input.coupon.percentage / 100 : 0;
    const discount = Math.min(rawDiscount, input.coupon?.maxDiscount ?? Number.POSITIVE_INFINITY);
    const finalFare = Math.max(0, Number((baseFare - discount).toFixed(2)));

    return { baseFare: Number(baseFare.toFixed(2)), discount: Number(discount.toFixed(2)), finalFare };
  }
}
