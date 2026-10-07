import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BookRideDto } from './dto/book-ride.dto';
import { EndRideDto } from './dto/end-ride.dto';
import { RidesService } from './rides.service';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  book(@Body() dto: BookRideDto) { return this.ridesService.book(dto); }

  @Post(':id/end')
  end(@Param('id') id: string, @Body() dto: EndRideDto) { return this.ridesService.end(id, dto.distanceKm); }

  @Get(':id')
  get(@Param('id') id: string) { return this.ridesService.getById(id); }
}
