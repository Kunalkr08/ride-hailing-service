import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { TieredPricingStrategy } from './tiered-pricing.strategy';

@Module({ providers: [PricingService, TieredPricingStrategy], exports: [PricingService] })
export class PricingModule {}
