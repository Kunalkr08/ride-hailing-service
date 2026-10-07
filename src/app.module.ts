import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DriversModule } from './drivers/drivers.module';
import { CouponsModule } from './coupons/coupons.module';
import { PricingModule } from './pricing/pricing.module';
import { RidesModule } from './rides/rides.module';

@Module({
  imports: [UsersModule, DriversModule, CouponsModule, PricingModule, RidesModule],
})
export class AppModule {}
