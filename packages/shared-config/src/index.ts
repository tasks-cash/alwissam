import { z } from "zod";

const nodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development");

export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  API_PORT: z.coerce.number().int().positive().default(4001),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  REDIS_URL: z.string().optional(),
  WEB_ORIGIN: z.string().optional(),
  COOKIE_DOMAIN: z.string().optional().default(""),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).optional().default("lax"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().optional().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default("7d"),
  LEGACY_DATABASE_URL: z.string().optional(),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export function parseApiEnv(
  env: NodeJS.ProcessEnv | Record<string, unknown>,
): ApiEnv {
  return apiEnvSchema.parse(env);
}

export function validateApiEnv(
  env: NodeJS.ProcessEnv | Record<string, unknown> = process.env,
): ApiEnv {
  const result = apiEnvSchema.safeParse(env);

  if (!result.success) {
    const details = result.error.issues
      .map(
        (issue) =>
          `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(
      `Invalid API environment configuration:\n${details}\n` +
        `Ensure MONGODB_URI, JWT_ACCESS_SECRET, and JWT_REFRESH_SECRET are set.`,
    );
  }

  return result.data;
}
