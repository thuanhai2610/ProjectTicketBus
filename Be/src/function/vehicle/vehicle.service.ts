import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { VehicleRepository } from './vehicle.repsitory';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from '../companies/schemas/company.schema';
import { Model } from 'mongoose';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  private readonly vehicleRepository: VehicleRepository) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
  
    const company = await this.companyModel.findOne({companyId: createVehicleDto.companyId}).exec();
    if (!company) {
      throw new BadRequestException(`Company with ID ${createVehicleDto.companyId} does not exist`);
    }

    const createdVehicle = new this.vehicleModel(createVehicleDto);
    return createdVehicle.save();
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