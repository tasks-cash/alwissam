import { validateApiEnv } from "@alwisam/shared-config";

/**
 * Nest ConfigModule validation: requires MONGODB_URI (and schema defaults).
 * Throws a clear Error before the app listens if config is invalid.
 */
export function validateEnv(config: Record<string, unknown>) {
  return validateApiEnv(config);
}
