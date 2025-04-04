import { Prop, Schema } from '@nestjs/mongoose';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { vehicleEnum } from '../enum/vehicle.enum';

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