import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SignJWT, jwtVerify } from "jose";

export type AccessTokenPayload = {
  sub: string;
  roleCode: string;
  fullName: string;
  sessionJti?: string;
};

@Injectable()
export class JwtTokenService {
  private readonly accessSecret: Uint8Array;
  private readonly refreshSecret: Uint8Array;
  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(private readonly config: ConfigService) {
    const access =
      this.config.get<string>("JWT_ACCESS_SECRET") ||
      process.env.JWT_ACCESS_SECRET ||
      "";
    const refresh =
      this.config.get<string>("JWT_REFRESH_SECRET") ||
      process.env.JWT_REFRESH_SECRET ||
      "";
    if (!access || !refresh) {
      throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET are required");
    }
    this.accessSecret = new TextEncoder().encode(access);
    this.refreshSecret = new TextEncoder().encode(refresh);
    this.accessExpiresIn =
      this.config.get<string>("JWT_ACCESS_EXPIRES_IN") || "15m";
    this.refreshExpiresIn =
      this.config.get<string>("JWT_REFRESH_EXPIRES_IN") || "7d";
  }

  async signAccess(payload: AccessTokenPayload): Promise<string> {
    return new SignJWT({
      roleCode: payload.roleCode,
      fullName: payload.fullName,
      sessionJti: payload.sessionJti,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(this.accessExpiresIn)
      .sign(this.accessSecret);
  }

  async signRefresh(payload: { sub: string; jti: string }): Promise<string> {
    return new SignJWT({ typ: "refresh" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(payload.sub)
      .setJti(payload.jti)
      .setIssuedAt()
      .setExpirationTime(this.refreshExpiresIn)
      .sign(this.refreshSecret);
  }

  async verifyAccess(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jwtVerify(token, this.accessSecret);
    return {
      sub: String(payload.sub || ""),
      roleCode: String(payload.roleCode || ""),
      fullName: String(payload.fullName || ""),
      sessionJti:
        typeof payload.sessionJti === "string"
          ? payload.sessionJti
          : undefined,
    };
  }

  async verifyRefresh(token: string): Promise<{ sub: string; jti: string }> {
    const { payload } = await jwtVerify(token, this.refreshSecret);
    return {
      sub: String(payload.sub || ""),
      jti: String(payload.jti || ""),
    };
  }

  parseDurationToMs(duration: string, fallbackMs: number): number {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());
    if (!match) return fallbackMs;
    const n = Number(match[1]);
    switch (match[2]) {
      case "s":
        return n * 1000;
      case "m":
        return n * 60_000;
      case "h":
        return n * 3_600_000;
      case "d":
        return n * 86_400_000;
      default:
        return fallbackMs;
    }
  }

  getRefreshTtlMs() {
    return this.parseDurationToMs(this.refreshExpiresIn, 7 * 86_400_000);
  }

  getAccessTtlMs() {
    return this.parseDurationToMs(this.accessExpiresIn, 15 * 60_000);
  }
}
