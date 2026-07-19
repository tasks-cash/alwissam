jest.mock("../common/auth/jwt-token.service", () => ({
  JwtTokenService: class JwtTokenService {},
}));

import { AuthService } from "./auth.service";

describe("AuthService session ownership", () => {
  it("scopes session revocation to the authenticated User", async () => {
    const sessions = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
    };
    const auditLogs = { create: jest.fn() };
    const service = new AuthService(
      {} as never,
      sessions as never,
      {} as never,
      auditLogs as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const sessionId = "507f1f77bcf86cd799439012";

    await expect(
      service.revokeSession("507f1f77bcf86cd799439011", sessionId),
    ).rejects.toMatchObject({
      response: expect.objectContaining({
        message: expect.stringContaining("غير موجودة"),
      }),
    });

    expect(sessions.updateOne).toHaveBeenCalledWith(
      {
        _id: sessionId,
        userId: "507f1f77bcf86cd799439011",
        revokedAt: null,
      },
      expect.any(Object),
    );
    expect(auditLogs.create).not.toHaveBeenCalled();
  });

  it("revokes other sessions while preserving the current session key", async () => {
    const sessions = {
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 2 }),
    };
    const auditLogs = { create: jest.fn().mockResolvedValue(undefined) };
    const service = new AuthService(
      {} as never,
      sessions as never,
      {} as never,
      auditLogs as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.logoutOtherSessions(
      "507f1f77bcf86cd799439011",
      "current-session-jti",
    );

    expect(sessions.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "507f1f77bcf86cd799439011",
        revokedAt: null,
        csrfToken: { $ne: expect.any(String) },
      }),
      expect.objectContaining({
        $set: expect.objectContaining({
          revokedReason: "logout_others",
        }),
      }),
    );
    expect(result).toMatchObject({ ok: true, revoked: 2 });
    expect(auditLogs.create).toHaveBeenCalledWith(
      expect.objectContaining({ action: "OTHER_SESSIONS_REVOKED" }),
    );
  });
});
