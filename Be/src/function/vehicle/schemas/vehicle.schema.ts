import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true , collection : 'companies'})
export class Vehicle {
  @Prop({required: true})
      vehicleId: string;
      @Prop({required: true, type: String, ref : 'Company' })
      companyId: string;
      @Prop({required: true})
    lisencePlate: string;
    @Prop({required: true, enum : ['guongnam' , 'ngoi']})
    vehicleType: string;
    @Prop({required: true, type: Number})
    seatCount: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);