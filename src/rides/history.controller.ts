import { Controller, Get, Param } from '@nestjs/common';
import { RidesService } from './rides.service';

@Controller()
export class HistoryController {
  constructor(private readonly ridesService: RidesService) {}

  @Get('users/:id/rides')
  userHistory(@Param('id') id: string) { return this.ridesService.historyForUser(id); }

  @Get('drivers/:id/rides')
  driverHistory(@Param('id') id: string) { return this.ridesService.historyForDriver(id); }
}
