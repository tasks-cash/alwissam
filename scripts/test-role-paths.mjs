import assert from "node:assert/strict";
import {
  isOwnerRole,
  roleDashboardPath,
  roleMatchesAny,
} from "../apps/web/lib/auth/role-paths";

assert.equal(isOwnerRole("ADMIN_OWNER"), true);
assert.equal(isOwnerRole("ADMIN"), true);
assert.equal(isOwnerRole("PATIENT"), false);
assert.equal(roleDashboardPath("PATIENT", "ar"), "/ar/patient/dashboard");
assert.equal(
  roleDashboardPath("ADMIN_OWNER", "en"),
  "/en/doctor/specialist/dashboard",
);
assert.equal(roleMatchesAny("ADMIN", ["ADMIN_OWNER"]), true);
assert.equal(roleMatchesAny("PATIENT", ["ADMIN_OWNER"]), false);
assert.equal(roleMatchesAny("DOCTOR_GENERAL", ["DOCTOR"]), true);

console.log("role-paths.spec: ok");
