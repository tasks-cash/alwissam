import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import type { Server, Socket } from "socket.io";
import { User } from "../auth/schemas/auth.schemas";
import {
  isWithinSecretaryShift,
  SECRETARY_SHIFT_ENDED_MESSAGE,
} from "../common/auth/secretary-shift";
import { JwtTokenService } from "../common/auth/jwt-token.service";
import { ACCESS_COOKIE } from "../common/auth/token.util";
import { isStaffChatRole } from "./staff-chat.rules";
import { StaffChatService } from "./staff-chat.service";

type AuthedSocket = Socket & {
  data: {
    userId?: string;
    roleCode?: string;
    fullName?: string;
    shiftTimer?: ReturnType<typeof setInterval>;
  };
};

@WebSocketGateway({
  namespace: "/staff-chat",
  cors: {
    origin: true,
    credentials: true,
  },
})
export class StaffChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private online = new Map<string, Set<string>>();

  constructor(
    private readonly tokens: JwtTokenService,
    private readonly chat: StaffChatService,
    @InjectModel(User.name) private readonly users: Model<User>,
  ) {}

  private parseCookie(header?: string): Record<string, string> {
    const out: Record<string, string> = {};
    if (!header) return out;
    for (const part of header.split(";")) {
      const i = part.indexOf("=");
      if (i < 0) continue;
      const k = part.slice(0, i).trim();
      const v = decodeURIComponent(part.slice(i + 1).trim());
      out[k] = v;
    }
    return out;
  }

  private clearShiftTimer(client: AuthedSocket) {
    if (client.data.shiftTimer) {
      clearInterval(client.data.shiftTimer);
      client.data.shiftTimer = undefined;
    }
  }

  private async enforceSecretaryShift(client: AuthedSocket): Promise<boolean> {
    if (client.data.roleCode !== "SECRETARY" || !client.data.userId) {
      return true;
    }
    const user = await this.users
      .findById(client.data.userId)
      .select("secretary status")
      .lean();
    if (!user || (user as { status?: string }).status !== "ACTIVE") {
      client.emit("staff:shift:ended", {
        message: SECRETARY_SHIFT_ENDED_MESSAGE,
      });
      client.disconnect(true);
      return false;
    }
    if (!isWithinSecretaryShift(user.secretary)) {
      client.emit("staff:shift:ended", {
        message: SECRETARY_SHIFT_ENDED_MESSAGE,
      });
      client.disconnect(true);
      return false;
    }
    return true;
  }

  async handleConnection(client: AuthedSocket) {
    try {
      const cookies = this.parseCookie(client.handshake.headers.cookie);
      const authHeader = client.handshake.headers.authorization;
      const bearer =
        typeof authHeader === "string" && authHeader.startsWith("Bearer ")
          ? authHeader.slice(7)
          : undefined;
      const raw =
        bearer ||
        (client.handshake.auth?.token as string | undefined) ||
        cookies[ACCESS_COOKIE];
      if (!raw) {
        client.disconnect(true);
        return;
      }
      const payload = await this.tokens.verifyAccess(raw);
      const user = await this.users
        .findOne({ _id: payload.sub, deletedAt: null, status: "ACTIVE" })
        .select("fullName roleCode secretary")
        .lean();
      if (!user || !isStaffChatRole(user.roleCode)) {
        client.disconnect(true);
        return;
      }
      if (
        user.roleCode === "SECRETARY" &&
        !isWithinSecretaryShift(user.secretary)
      ) {
        client.emit("staff:shift:ended", {
          message: SECRETARY_SHIFT_ENDED_MESSAGE,
        });
        client.disconnect(true);
        return;
      }

      const userId = String(user._id);
      client.data.userId = userId;
      client.data.roleCode = user.roleCode;
      client.data.fullName = user.fullName;
      await client.join(`staff:${userId}`);
      const set = this.online.get(userId) || new Set<string>();
      set.add(client.id);
      this.online.set(userId, set);
      this.server.emit("staff:presence:update", {
        userId,
        online: true,
        fullName: user.fullName,
      });
      // Legacy alias
      this.server.emit("staff:presence", {
        userId,
        online: true,
        fullName: user.fullName,
      });

      if (user.roleCode === "SECRETARY") {
        client.data.shiftTimer = setInterval(() => {
          void this.enforceSecretaryShift(client);
        }, 60_000);
      }
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthedSocket) {
    this.clearShiftTimer(client);
    const userId = client.data.userId;
    if (!userId) return;
    const set = this.online.get(userId);
    if (!set) return;
    set.delete(client.id);
    if (set.size === 0) {
      this.online.delete(userId);
      this.server.emit("staff:presence:update", {
        userId,
        online: false,
      });
      this.server.emit("staff:presence", { userId, online: false });
    }
  }

  @SubscribeMessage("staff:conversation:join")
  async onJoin(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    body: { conversationId?: string; peerId?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return { ok: false, error: "unauthorized" };
    if (!(await this.enforceSecretaryShift(client))) {
      return { ok: false, error: "shift_ended" };
    }
    try {
      if (body?.conversationId) {
        const { peerId } = await this.chat.assertConversationAccess(
          {
            id: userId,
            roleCode: client.data.roleCode || "",
            fullName: client.data.fullName || "",
          } as never,
          body.conversationId,
        );
        await client.join(`staff-conv:${body.conversationId}`);
        return { ok: true, conversationId: body.conversationId, peerId };
      }
      if (body?.peerId) {
        await this.chat.assertPeerAllowed(
          {
            id: userId,
            roleCode: client.data.roleCode || "",
            fullName: client.data.fullName || "",
          } as never,
          body.peerId,
        );
        await client.join(`staff-peer:${[userId, body.peerId].sort().join(":")}`);
        return { ok: true, peerId: body.peerId };
      }
      return { ok: false, error: "missing_id" };
    } catch {
      return { ok: false, error: "forbidden" };
    }
  }

  @SubscribeMessage("staff:conversation:leave")
  async onLeave(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    body: { conversationId?: string; peerId?: string },
  ) {
    if (body?.conversationId) {
      await client.leave(`staff-conv:${body.conversationId}`);
    }
    if (body?.peerId && client.data.userId) {
      await client.leave(
        `staff-peer:${[client.data.userId, body.peerId].sort().join(":")}`,
      );
    }
    return { ok: true };
  }

  @SubscribeMessage("staff:typing:start")
  async onTypingStart(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { peerId?: string },
  ) {
    return this.emitTyping(client, body?.peerId, "start");
  }

  @SubscribeMessage("staff:typing:stop")
  async onTypingStop(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody() body: { peerId?: string },
  ) {
    return this.emitTyping(client, body?.peerId, "stop");
  }

  /** Legacy typing event */
  @SubscribeMessage("staff:typing")
  async onTypingLegacy(
    @ConnectedSocket() client: AuthedSocket,
    @MessageBody()
    body: { peerId?: string; state?: "start" | "stop" },
  ) {
    return this.emitTyping(
      client,
      body?.peerId,
      body?.state === "stop" ? "stop" : "start",
    );
  }

  private async emitTyping(
    client: AuthedSocket,
    peerId: string | undefined,
    state: "start" | "stop",
  ) {
    const userId = client.data.userId;
    if (!userId || !peerId) return;
    if (!(await this.enforceSecretaryShift(client))) return;
    try {
      await this.chat.assertPeerAllowed(
        {
          id: userId,
          roleCode: client.data.roleCode || "",
          fullName: client.data.fullName || "",
        } as never,
        peerId,
      );
    } catch {
      return;
    }
    const payload = {
      fromUserId: userId,
      fullName: client.data.fullName,
      state,
    };
    this.server.to(`staff:${peerId}`).emit("staff:typing", payload);
    this.server
      .to(`staff:${peerId}`)
      .emit(state === "start" ? "staff:typing:start" : "staff:typing:stop", payload);
  }

  emitNewMessage(receiverId: string, payload: Record<string, unknown>) {
    void this.chat.markDelivered(String(payload.id || ""), receiverId);
    this.server.to(`staff:${receiverId}`).emit("staff:message", payload);
    this.server
      .to(`staff:${receiverId}`)
      .emit("staff:message:created", payload);
    this.server.to(`staff:${receiverId}`).emit("staff:unread:update", {
      delta: 1,
      fromUserId: payload.fromUserId,
    });
  }

  emitMessageDeleted(
    peerIds: string[],
    payload: { messageId: string; byUserId: string },
  ) {
    for (const id of peerIds) {
      this.server.to(`staff:${id}`).emit("staff:deleted", payload);
      this.server.to(`staff:${id}`).emit("staff:message:deleted", payload);
    }
  }

  emitMessageRead(peerIds: string[], payload: Record<string, unknown>) {
    for (const id of peerIds) {
      this.server.to(`staff:${id}`).emit("staff:message:read", payload);
    }
  }

  isOnline(userId: string): boolean {
    return (this.online.get(userId)?.size || 0) > 0;
  }
}
