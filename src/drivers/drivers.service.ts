import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { distanceInKm } from '../common/geo';
import { newId } from '../common/id';
import { CarType, Driver, Location } from '../common/types';
import { RegisterDriverDto } from './dto/register-driver.dto';

@Injectable()
export class DriversService {
  private readonly drivers = new Map<string, Driver>();

  register(dto: RegisterDriverDto): Driver {
    if ([...this.drivers.values()].some(d => d.phone === dto.phone)) {
      throw new ConflictException('Phone number already registered');
    }
    const { lat, lng, ...rest } = dto;
    const driver: Driver = { id: newId(), ...rest, location: { lat, lng }, available: true };
    this.drivers.set(driver.id, driver);
    return driver;
  }

  getById(id: string): Driver {
    const driver = this.drivers.get(id);
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  updateLocation(id: string, location: Location): Driver {
    const driver = this.getById(id);
    driver.location = location;
    return driver;
  }

  setAvailability(id: string, available: boolean) {
    this.getById(id).available = available;
  }

  findNearestAvailable(pickup: Location, requestedType: CarType, radiusKm: number): { driver: Driver; upgraded: boolean } | null {
    const candidates = [...this.drivers.values()]
      .filter(d => d.available)
      .map(driver => ({
        driver,
        distance: distanceInKm(pickup, driver.location),
        exact: driver.carType === requestedType,
      }))
      .filter(x => x.distance <= radiusKm);

    // Prefer the requested type. If it is unavailable, a Sedan may upgrade a Hatchback request.
    const exact = candidates.filter(x => x.exact).sort((a, b) => a.distance - b.distance)[0];
    if (exact) return { driver: exact.driver, upgraded: false };

    if (requestedType === 'HATCHBACK') {
      const sedan = candidates
        .filter(x => x.driver.carType === 'SEDAN')
        .sort((a, b) => a.distance - b.distance)[0];
      if (sedan) return { driver: sedan.driver, upgraded: true };
    }

    return null;
  }
}
