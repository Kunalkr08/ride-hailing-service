import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  register(@Body() dto: RegisterDriverDto) { return this.driversService.register(dto); }

  @Patch(':id/location')
  updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(id, dto);
  }
}
