import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ClinicSettingDocument = HydratedDocument<ClinicSetting>;

@Schema({ timestamps: true, collection: "clinic_settings" })
export class ClinicSetting {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ type: Object, required: true })
  value!: Record<string, unknown>;
}

export const ClinicSettingSchema = SchemaFactory.createForClass(ClinicSetting);
