## Patient dashboard missing-profile root cause (2026-07-15)

**Verified cause:** NestJS `SchemaFactory.createForClass` with `@Prop({ type: Types.ObjectId })` registered `userId` as **Mixed**, so string JWT `sub` filters were not cast to ObjectId and MongoDB equality failed even when `Patient.userId` existed.

**Fix:** use `SchemaTypes.ObjectId` in all Nest schemas; sync `User.patientProfileId`; harden `requirePatient`; add `pnpm repair:patient-profiles`.

