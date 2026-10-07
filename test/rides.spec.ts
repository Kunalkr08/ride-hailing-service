import { BadRequestException } from '@nestjs/common';
import { CouponsService } from '../src/coupons/coupons.service';
import { DriversService } from '../src/drivers/drivers.service';
import { PricingService } from '../src/pricing/pricing.service';
import { TieredPricingStrategy } from '../src/pricing/tiered-pricing.strategy';
import { RidesService } from '../src/rides/rides.service';
import { UsersService } from '../src/users/users.service';

describe('RidesService', () => {
  let rides: RidesService; let users: UsersService; let drivers: DriversService; let coupons: CouponsService;
  beforeEach(() => {
    users = new UsersService(); drivers = new DriversService(); coupons = new CouponsService();
    rides = new RidesService(users, drivers, coupons, new PricingService(new TieredPricingStrategy()));
  });
  it('upgrades hatchback request to sedan for free', () => {
    const user = users.register({ name: 'Kunal', phone: '+919999999999' });
    const driver = drivers.register({ name: 'Driver', phone: '+918888888888', carType: 'SEDAN', lat: 12.9716, lng: 77.5946 });
    const ride = rides.book({ userId: user.id, carType: 'HATCHBACK', pickupLat: 12.9717, pickupLng: 77.5947 });
    expect(ride.driverId).toBe(driver.id); expect(ride.assignedCarType).toBe('SEDAN');
  });
  it('rejects booking when no driver is within radius', () => {
    const user = users.register({ name: 'Kunal', phone: '+919999999999' });
    drivers.register({ name: 'Far', phone: '+918888888888', carType: 'SEDAN', lat: 28.6139, lng: 77.2090 });
    expect(() => rides.book({ userId: user.id, carType: 'SEDAN', pickupLat: 12.9716, pickupLng: 77.5946 })).toThrow(BadRequestException);
  });
  it('locks in a valid coupon at booking time', () => {
    const user = users.register({ name: 'Kunal', phone: '+919999999999' });
    drivers.register({ name: 'Driver', phone: '+918888888888', carType: 'SEDAN', lat: 12.9716, lng: 77.5946 });
    coupons.add({ code: 'SAVE10', percentage: 10 });
    const ride = rides.book({ userId: user.id, carType: 'SEDAN', pickupLat: 12.9716, pickupLng: 77.5946, couponCode: 'save10' });
    coupons.delete('SAVE10');
    const result = rides.end(ride.id, 10);
    expect(result.pricing.finalFare).toBe(62.1);
  });
});
