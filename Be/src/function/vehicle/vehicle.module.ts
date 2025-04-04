import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Vehicle, VehicleSchema } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repsitory';
import { CompaniesController } from './vehicle.controller';
import { CompaniesService } from './vehicle.service';
import { Company, CompanySchema } from '../companies/schemas/company.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Vehicle.name, schema: VehicleSchema },
      { name: Company.name, schema: CompanySchema },
    ]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, VehicleRepository],
  exports: [CompaniesService],
})
export class VehicleModule {}