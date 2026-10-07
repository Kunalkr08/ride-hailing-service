import { TieredPricingStrategy } from '../src/pricing/tiered-pricing.strategy';
import { Coupon } from '../src/common/types';

describe('TieredPricingStrategy', () => {
  const pricing = new TieredPricingStrategy();
  it('applies minimum fare', () => expect(pricing.calculate({ distanceKm: 1, carType: 'SEDAN' }).finalFare).toBe(50));
  it('calculates sedan tiers', () => expect(pricing.calculate({ distanceKm: 10, carType: 'SEDAN' }).finalFare).toBe(69));
  it('calculates hatchback rates', () => expect(pricing.calculate({ distanceKm: 10, carType: 'HATCHBACK' }).finalFare).toBe(54));
  it('applies percentage coupon', () => {
    const coupon: Coupon = { code: 'SAVE10', percentage: 10, active: true };
    expect(pricing.calculate({ distanceKm: 10, carType: 'SEDAN', coupon }).finalFare).toBe(62.1);
  });
  it('respects coupon max discount', () => {
    const coupon: Coupon = { code: 'SAVE50', percentage: 50, maxDiscount: 20, active: true };
    expect(pricing.calculate({ distanceKm: 10, carType: 'SEDAN', coupon }).finalFare).toBe(49);
  });
});
