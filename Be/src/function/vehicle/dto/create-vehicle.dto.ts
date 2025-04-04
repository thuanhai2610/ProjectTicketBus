import { InjectModel, Prop, Schema } from '@nestjs/mongoose';
import { IsEnum, IsInt, IsNotEmpty, IsString, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { vehicleEnum } from '../enum/vehicle.enum';
import { Company, CompanyDocument } from 'src/function/companies/schemas/company.schema';
import { Model } from 'mongoose';

export class CreateVehicleDto {


    @IsNotEmpty()
    @IsString()
    vehicleId: string;

   @IsNotEmpty()
    @IsString()
    @Prop({required: true, type: String, ref : 'Company' })
    companyId: string;

  @IsNotEmpty()
  @IsString()
  lisencePlate: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(vehicleEnum)
  vehicleType: string;

  @IsNotEmpty()
  @IsInt()
  seatCount: number;
}