import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { newId } from '../common/id';
import { CarType, Ride } from '../common/types';
import { CouponsService } from '../coupons/coupons.service';
import { DriversService } from '../drivers/drivers.service';
import { PricingService } from '../pricing/pricing.service';
import { UsersService } from '../users/users.service';
import { BookRideDto } from './dto/book-ride.dto';

@Injectable()
export class RidesService {
  private readonly rides = new Map<string, Ride>();
  private readonly searchRadiusKm = 5;

  constructor(
    private readonly usersService: UsersService,
    private readonly driversService: DriversService,
    private readonly couponsService: CouponsService,
    private readonly pricingService: PricingService,
  ) {}

  book(dto: BookRideDto): Ride {
    this.usersService.getById(dto.userId);

    const pickup = { lat: dto.pickupLat, lng: dto.pickupLng };
    const match = this.driversService.findNearestAvailable(pickup, dto.carType, this.searchRadiusKm);
    if (!match) throw new BadRequestException(`No available ${dto.carType} driver within ${this.searchRadiusKm} km`);

    // Driver availability is changed before the ride is returned, preventing another synchronous booking from selecting it.
    this.driversService.setAvailability(match.driver.id, false);

    const coupon = this.couponsService.getValid(dto.couponCode);
    if (dto.couponCode && !coupon) {
      this.driversService.setAvailability(match.driver.id, true);
      throw new BadRequestException('Invalid coupon code');
    }

    const ride: Ride = {
      id: newId(),
      userId: dto.userId,
      driverId: match.driver.id,
      requestedCarType: dto.carType,
      assignedCarType: match.driver.carType,
      pickup,
      status: 'ONGOING',
      couponCode: coupon?.code,
      couponPercentage: coupon?.percentage,
      couponMaxDiscount: coupon?.maxDiscount,
      createdAt: new Date(),
    };

    this.rides.set(ride.id, ride);
    return ride;
  }

  end(id: string, distanceKm: number) {
    const ride = this.getById(id);
    if (ride.status === 'COMPLETED') throw new BadRequestException('Ride is already completed');

    const coupon = ride.couponPercentage !== undefined ? {
      code: ride.couponCode!,
      percentage: ride.couponPercentage,
      maxDiscount: ride.couponMaxDiscount,
      active: true,
    } : undefined;
    const pricing = this.pricingService.calculate({ distanceKm, carType: ride.assignedCarType }, coupon);

    ride.distanceKm = distanceKm;
    ride.fare = pricing.finalFare;
    ride.status = 'COMPLETED';
    ride.completedAt = new Date();
    this.driversService.setAvailability(ride.driverId, true);

    return { ride, pricing };
  }

  getById(id: string): Ride {
    const ride = this.rides.get(id);
    if (!ride) throw new NotFoundException('Ride not found');
    return ride;
  }

  historyForUser(userId: string) {
    this.usersService.getById(userId);
    return [...this.rides.values()].filter(r => r.userId === userId);
  }

  historyForDriver(driverId: string) {
    this.driversService.getById(driverId);
    return [...this.rides.values()].filter(r => r.driverId === driverId);
  }
}
