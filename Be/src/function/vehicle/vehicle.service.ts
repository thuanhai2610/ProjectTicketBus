import { Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repsitory';

@Injectable()
export class CompaniesService {
  constructor(private readonly vehicleRepository: VehicleRepository) {}

  create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    return this.vehicleRepository.create(createVehicleDto);
  }

  findAll(): Promise<Vehicle[]> {
    return this.vehicleRepository.findAll();
  }

  findOne(id: string): Promise<Vehicle> {
    return this.vehicleRepository.findOne(id);
  }

  update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    return this.vehicleRepository.update(id, updateVehicleDto);
  }

  remove(id: string): Promise<Vehicle> {
    return this.vehicleRepository.remove(id);
  }
}