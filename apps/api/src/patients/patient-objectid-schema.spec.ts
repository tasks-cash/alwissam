import { SchemaFactory } from "@nestjs/mongoose";
import { SchemaTypes, Types } from "mongoose";
import { Patient } from "./schemas/patient.schema";

describe("Patient ObjectId schema casting", () => {
  it("registers userId as ObjectId (not Mixed) so string queries cast", () => {
    const schema = SchemaFactory.createForClass(Patient);
    const path = schema.path("userId");
    expect(path.instance).toBe("ObjectId");
    expect(path.options?.type).toBe(SchemaTypes.ObjectId);
  });

  it("casts string userId filters to ObjectId", () => {
    const schema = SchemaFactory.createForClass(Patient);
    const casted = schema.path("userId").cast("6a57df69677f6d6cc2798708");
    expect(casted).toBeInstanceOf(Types.ObjectId);
    expect(String(casted)).toBe("6a57df69677f6d6cc2798708");
  });
});
