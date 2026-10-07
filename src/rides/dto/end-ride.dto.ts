import { IsNumber, Min } from 'class-validator';
export class EndRideDto { @IsNumber() @Min(0) distanceKm!: number; }
