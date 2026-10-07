import { Injectable } from '@nestjs/common';
import { Coupon } from '../common/types';
import { PricingInput, PricingResult } from './pricing.types';
import { TieredPricingStrategy } from './tiered-pricing.strategy';

@Injectable()
export class PricingService {
  constructor(private readonly strategy: TieredPricingStrategy) {}
  calculate(input: PricingInput, coupon?: Coupon): PricingResult {
    return this.strategy.calculate({ ...input, coupon });
  }
}
