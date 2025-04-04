import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repsitory';
import { CompaniesController } from './vehicle.controller';
import { CompaniesService } from './vehicle.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema }]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, VehicleRepository],
  exports: [CompaniesService],
})
export class VehicleModule {}