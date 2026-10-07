import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  add(@Body() dto: CreateCouponDto) { return this.couponsService.add(dto); }

  @Delete(':code')
  delete(@Param('code') code: string) { return this.couponsService.delete(code); }
}
