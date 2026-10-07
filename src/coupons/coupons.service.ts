import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Coupon } from '../common/types';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  private readonly coupons = new Map<string, Coupon>();

  add(dto: CreateCouponDto): Coupon {
    const code = dto.code.trim().toUpperCase();
    if (this.coupons.has(code)) throw new ConflictException('Coupon already exists');
    const coupon: Coupon = { code, percentage: dto.percentage, maxDiscount: dto.maxDiscount, active: true };
    this.coupons.set(code, coupon);
    return coupon;
  }

  delete(code: string) {
    if (!this.coupons.delete(code.trim().toUpperCase())) throw new NotFoundException('Coupon not found');
    return { message: 'Coupon deleted' };
  }

  getValid(code?: string): Coupon | undefined {
    if (!code) return undefined;
    const coupon = this.coupons.get(code.trim().toUpperCase());
    return coupon?.active ? coupon : undefined;
  }
}
