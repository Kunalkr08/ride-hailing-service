import { Module } from '@nestjs/common';
import { CouponsModule } from '../coupons/coupons.module';
import { DriversModule } from '../drivers/drivers.module';
import { PricingModule } from '../pricing/pricing.module';
import { UsersModule } from '../users/users.module';
import { HistoryController } from './history.controller';
import { RidesController } from './rides.controller';
import { RidesService } from './rides.service';

@Module({
  imports: [UsersModule, DriversModule, CouponsModule, PricingModule],
  controllers: [RidesController, HistoryController],
  providers: [RidesService],
})
export class RidesModule {}
