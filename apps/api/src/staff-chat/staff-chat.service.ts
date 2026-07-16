import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { createReadStream, existsSync, mkdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { Model, Types } from "mongoose";
import type { Response } from "express";
import { User } from "../auth/schemas/auth.schemas";
import { AuditService } from "../common/audit/audit.service";
import { AuthRateLimiter } from "../common/auth/auth-rate-limit";
import type { AuthUser } from "../common/auth/session.guard";
import { ErrorCodes } from "../common/errors/error-codes";
import { isOwnerRole } from "../common/auth/roles";
import { StaffConversation } from "./schemas/staff-conversation.schema";
import { StaffMessage } from "./schemas/staff-message.schema";
import {
  assertSecretaryCanChat,
  canDeleteStaffMessage,
  filterAssignedDoctors,
  isStaffChatRole,
  peerGroupForRole,
  roleLabelAr,
  secretaryVisibleToDoctor,
  sortedParticipantPair,
  STAFF_CHAT_DOCTOR_SIDE,
} from "./staff-chat.rules";

const VOICE_MAX_BYTES = 2 * 1024 * 1024;
const VOICE_MIME = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
]);

const sendLimiter = new AuthRateLimiter(40, 60_000);

export type StaffPeerDto = {
  id: string;
  fullName: string;
  role: string;
  roleLabel: string;
  group: "DOCTORS" | "SECRETARIES";
  initials: string;
};

function initialsOf(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function sanitizeChatText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

function previewOf(kind: string, body: string): string {
  if (kind === "VOICE") return "🎤 رسالة صوتية";
  const t = (body || "").trim();
  return t.length > 120 ? `${t.slice(0, 117)}…` : t;
}

@Injectable()
export class StaffChatService {
  constructor(
    @InjectModel(StaffMessage.name)
    private readonly messages: Model<StaffMessage>,
    @InjectModel(StaffConversation.name)
    private readonly conversations: Model<StaffConversation>,
    @InjectModel(User.name) private readonly users: Model<User>,
    private readonly audit: AuditService,
  ) {}

  private privateRoot() {
    const root =
      process.env.PRIVATE_UPLOAD_DIR ||
      join(process.cwd(), "private-uploads");
    const dir = join(root, "staff-chat");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    return dir;
  }

  assertStaff(actor: AuthUser) {
    if (!isStaffChatRole(actor.roleCode)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
  }

  async assertPeerAllowed(actor: AuthUser, receiverId: string) {
    const peers = await this.listPeers(actor);
    if (!peers.some((p) => p.id === receiverId)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
  }

  async assertConversationAccess(actor: AuthUser, conversationId: string) {
    this.assertStaff(actor);
    if (!Types.ObjectId.isValid(conversationId)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
    const conv = await this.conversations
      .findOne({ _id: conversationId, isActive: true, archivedAt: null })
      .lean();
    if (!conv) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
    const ids = (conv.participantIds || []).map(String);
    if (!ids.includes(actor.id)) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
    const peerId = ids.find((id) => id !== actor.id);
    if (!peerId) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
    await this.assertPeerAllowed(actor, peerId);
    return { conversation: conv, peerId };
  }

  private async getOrCreateConversation(
    actor: AuthUser,
    peerId: string,
  ): Promise<{ id: string; peerId: string }> {
    const [a, b] = sortedParticipantPair(actor.id, peerId);
    const aOid = new Types.ObjectId(a);
    const bOid = new Types.ObjectId(b);

    let conv = await this.conversations.findOne({
      "participantIds.0": aOid,
      "participantIds.1": bOid,
    });

    if (!conv) {
      const peer = await this.users
        .findById(peerId)
        .select("roleCode")
        .lean();
      const peerRole = peer?.roleCode || "";
      let conversationType = "direct";
      let doctorId: Types.ObjectId | undefined;
      let secretaryId: Types.ObjectId | undefined;

      if (actor.roleCode === "SECRETARY" || peerRole === "SECRETARY") {
        conversationType = "doctor_secretary";
        if (actor.roleCode === "SECRETARY") {
          secretaryId = new Types.ObjectId(actor.id);
          if (STAFF_CHAT_DOCTOR_SIDE.has(peerRole)) {
            doctorId = new Types.ObjectId(peerId);
          }
        } else {
          secretaryId = new Types.ObjectId(peerId);
          doctorId = new Types.ObjectId(actor.id);
        }
      } else if (isOwnerRole(actor.roleCode) || isOwnerRole(peerRole)) {
        conversationType = "admin_staff";
      }

      try {
        conv = await this.conversations.create({
          participantIds: [aOid, bOid],
          doctorId,
          secretaryId,
          conversationType,
          isActive: true,
          lastMessagePreview: "",
        });
      } catch {
        conv = await this.conversations.findOne({
          "participantIds.0": aOid,
          "participantIds.1": bOid,
        });
      }
    }

    if (!conv) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "تعذر فتح المحادثة.",
      });
    }

    return { id: String(conv._id), peerId };
  }

  async listPeers(actor: AuthUser, search?: string): Promise<StaffPeerDto[]> {
    this.assertStaff(actor);
    const me = await this.users
      .findOne({ _id: actor.id, deletedAt: null, status: "ACTIVE" })
      .select("roleCode secretary")
      .lean();
    if (!me) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "الحساب غير متاح.",
      });
    }

    const byId = new Map<string, StaffPeerDto>();
    const add = (u: {
      _id: Types.ObjectId;
      fullName: string;
      roleCode: string;
    }) => {
      const id = String(u._id);
      if (id === actor.id) return;
      byId.set(id, {
        id,
        fullName: u.fullName,
        role: u.roleCode,
        roleLabel: roleLabelAr(u.roleCode),
        group: peerGroupForRole(u.roleCode),
        initials: initialsOf(u.fullName),
      });
    };

    if (STAFF_CHAT_DOCTOR_SIDE.has(me.roleCode)) {
      const [secretaries, doctors] = await Promise.all([
        this.users
          .find({
            deletedAt: null,
            status: "ACTIVE",
            roleCode: "SECRETARY",
          })
          .select("fullName roleCode secretary")
          .sort({ fullName: 1 })
          .lean(),
        this.users
          .find({
            deletedAt: null,
            status: "ACTIVE",
            _id: { $ne: actor.id },
            roleCode: {
              $in: [
                "DOCTOR_GENERAL",
                "DOCTOR_SPECIALIST",
                "ADMIN",
                "ADMIN_OWNER",
                "OWNER",
                "SUPER_ADMIN",
              ],
            },
          })
          .select("fullName roleCode")
          .sort({ fullName: 1 })
          .lean(),
      ]);

      const isAdmin = isOwnerRole(me.roleCode) || me.roleCode === "ADMIN";
      for (const s of secretaries) {
        if (
          isAdmin ||
          secretaryVisibleToDoctor(
            actor.id,
            (s as { secretary?: { assignedDoctorIds?: Types.ObjectId[] } })
              .secretary?.assignedDoctorIds?.map(String),
          )
        ) {
          add(s as never);
        }
      }
      for (const d of doctors) add(d as never);
    }

    if (me.roleCode === "SECRETARY") {
      const doctors = await this.users
        .find({
          deletedAt: null,
          status: "ACTIVE",
          roleCode: {
            $in: [
              "DOCTOR_GENERAL",
              "DOCTOR_SPECIALIST",
              "ADMIN",
              "ADMIN_OWNER",
              "OWNER",
              "SUPER_ADMIN",
            ],
          },
        })
        .select("fullName roleCode")
        .sort({ fullName: 1 })
        .lean();
      const assigned = (
        me.secretary as { assignedDoctorIds?: Types.ObjectId[] } | undefined
      )?.assignedDoctorIds?.map(String);
      const filtered = filterAssignedDoctors(
        doctors.map((d) => String(d._id)),
        assigned,
      );
      const allow = new Set(filtered);
      for (const d of doctors) {
        if (allow.has(String(d._id))) add(d as never);
      }
    }

    let list = [...byId.values()];
    const q = (search || "").trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.roleLabel.includes(search!.trim()) ||
          p.role.toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => {
      if (a.group !== b.group) return a.group === "DOCTORS" ? -1 : 1;
      return a.fullName.localeCompare(b.fullName, "ar");
    });
  }

  async searchStaff(actor: AuthUser, q: string) {
    const peers = await this.listPeers(actor, q);
    return { ok: true as const, peers };
  }

  async unreadCount(actor: AuthUser) {
    this.assertStaff(actor);
    const peers = await this.listPeers(actor);
    const peerOids = peers
      .map((p) => p.id)
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));
    const count = peerOids.length
      ? await this.messages.countDocuments({
          deletedAt: null,
          receiverId: actor.id,
          senderId: { $in: peerOids },
          readAt: null,
        })
      : 0;
    return { ok: true as const, unreadCount: count };
  }

  async markConversationRead(actor: AuthUser, peerId: string) {
    this.assertStaff(actor);
    await this.assertPeerAllowed(actor, peerId);
    const result = await this.messages.updateMany(
      {
        deletedAt: null,
        senderId: new Types.ObjectId(peerId),
        receiverId: new Types.ObjectId(actor.id),
        readAt: null,
      },
      { $set: { readAt: new Date() } },
    );
    await this.audit.write({
      actor,
      action: "STAFF_CHAT_MARK_READ",
      entityType: "StaffConversation",
      entityId: peerId,
      newValue: { modified: result.modifiedCount },
    });
    return {
      ok: true as const,
      peerId,
      modified: result.modifiedCount,
    };
  }

  async overview(actor: AuthUser, markRead = false) {
    this.assertStaff(actor);
    const peers = await this.listPeers(actor);
    const peerIds = peers.map((p) => p.id);
    const peerOids = peerIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const rows = peerOids.length
      ? await this.messages
          .find({
            deletedAt: null,
            $or: [
              { senderId: actor.id, receiverId: { $in: peerOids } },
              { receiverId: actor.id, senderId: { $in: peerOids } },
            ],
          })
          .sort({ createdAt: -1 })
          .limit(400)
          .lean()
      : [];

    if (markRead) {
      const unreadIds = rows
        .filter((m) => String(m.receiverId) === actor.id && !m.readAt)
        .map((m) => m._id);
      if (unreadIds.length) {
        await this.messages.updateMany(
          { _id: { $in: unreadIds } },
          { $set: { readAt: new Date() } },
        );
      }
    }

    const unreadCount = await this.messages.countDocuments({
      deletedAt: null,
      receiverId: actor.id,
      senderId: { $in: peerOids.length ? peerOids : [new Types.ObjectId()] },
      readAt: null,
    });

    const threadMap = new Map<
      string,
      StaffPeerDto & {
        messages: Array<Record<string, unknown>>;
        unread: number;
        lastMessagePreview: string;
        lastMessageAt: Date | string | null;
        conversationId: string | null;
      }
    >();
    for (const peer of peers) {
      threadMap.set(peer.id, {
        ...peer,
        messages: [],
        unread: 0,
        lastMessagePreview: "",
        lastMessageAt: null,
        conversationId: null,
      });
    }

    for (const m of rows) {
      const peerId =
        String(m.senderId) === actor.id
          ? String(m.receiverId)
          : String(m.senderId);
      const thread = threadMap.get(peerId);
      if (!thread) continue;
      const mine = String(m.senderId) === actor.id;
      const deleted = Boolean(m.deletedAt);
      thread.messages.push({
        id: String(m._id),
        kind: m.kind,
        messageType: m.kind === "VOICE" ? "voice" : "text",
        body: deleted ? "" : m.body || "",
        deleted: deleted,
        audioUrl:
          !deleted && m.kind === "VOICE"
            ? `/api/staff/chat/audio/${String(m._id)}`
            : null,
        createdAt: (m as { createdAt?: Date }).createdAt,
        mine,
        senderName: mine ? "أنا" : thread.fullName,
        senderRole: mine ? roleLabelAr(actor.roleCode) : thread.roleLabel,
        deliveredAt: m.deliveredAt || null,
        readAt: m.readAt || null,
        status: deleted
          ? "deleted"
          : m.readAt
            ? "read"
            : m.deliveredAt
              ? "delivered"
              : "sent",
      });
      if (!mine && !m.readAt && !markRead && !deleted) thread.unread += 1;
      if (!thread.lastMessageAt) {
        thread.lastMessagePreview = deleted
          ? "تم حذف هذه الرسالة"
          : previewOf(m.kind, m.body || "");
        thread.lastMessageAt =
          (m as { createdAt?: Date }).createdAt || null;
        if (m.conversationId) {
          thread.conversationId = String(m.conversationId);
        }
      }
    }

    const threads = [...threadMap.values()]
      .map((t) => ({
        peerId: t.id,
        conversationId: t.conversationId,
        peerName: t.fullName,
        peerRole: t.role,
        peerRoleLabel: t.roleLabel,
        peerInitials: t.initials,
        group: t.group,
        messages: [...t.messages].reverse(),
        unread: t.unread,
        lastMessagePreview: t.lastMessagePreview,
        lastMessageAt: t.lastMessageAt,
      }))
      .sort((a, b) => {
        const aLast = a.lastMessageAt ? String(a.lastMessageAt) : "";
        const bLast = b.lastMessageAt ? String(b.lastMessageAt) : "";
        if (aLast || bLast) return bLast.localeCompare(aLast);
        if (a.group !== b.group) return a.group === "DOCTORS" ? -1 : 1;
        return a.peerName.localeCompare(b.peerName, "ar");
      });

    return {
      ok: true,
      me: {
        id: actor.id,
        fullName: actor.fullName,
        role: actor.roleCode,
        roleLabel: roleLabelAr(actor.roleCode),
      },
      unreadCount: markRead ? 0 : unreadCount,
      peers,
      threads,
    };
  }

  private async loadSecretarySchedule(actor: AuthUser) {
    if (actor.roleCode !== "SECRETARY") return null;
    const u = await this.users
      .findById(actor.id)
      .select("secretary status")
      .lean();
    if (!u || (u as { status?: string }).status !== "ACTIVE") {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "حساب السكرتير غير نشط.",
      });
    }
    return u?.secretary || null;
  }

  private assertSendRate(actor: AuthUser) {
    sendLimiter.assertAllowed(
      `staff-chat:${actor.id}`,
      "تم تجاوز حد الإرسال. حاول بعد قليل.",
    );
    sendLimiter.prune();
  }

  private mapMessageDto(
    m: StaffMessage & { _id: Types.ObjectId; createdAt?: Date },
    actorId: string,
  ) {
    const deleted = Boolean(m.deletedAt);
    return {
      id: String(m._id),
      conversationId: m.conversationId ? String(m.conversationId) : null,
      kind: m.kind,
      messageType: m.kind === "VOICE" ? "voice" : "text",
      body: deleted ? "" : m.body || "",
      deleted,
      audioUrl:
        !deleted && m.kind === "VOICE"
          ? `/api/staff/chat/audio/${String(m._id)}`
          : null,
      createdAt: m.createdAt || new Date(),
      mine: String(m.senderId) === actorId,
      deliveredAt: m.deliveredAt || null,
      readAt: m.readAt || null,
      status: deleted
        ? "deleted"
        : m.readAt
          ? "read"
          : m.deliveredAt
            ? "delivered"
            : "sent",
      clientMessageId: m.clientMessageId || null,
    };
  }

  async sendText(
    actor: AuthUser,
    receiverId: string,
    body: string,
    clientMessageId?: string,
  ) {
    this.assertStaff(actor);
    this.assertSendRate(actor);
    assertSecretaryCanChat(
      actor.roleCode,
      await this.loadSecretarySchedule(actor),
    );
    const text = sanitizeChatText(body || "");
    if (!text || text.length > 4000) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "نص الرسالة غير صالح.",
      });
    }
    await this.assertPeerAllowed(actor, receiverId);

    if (clientMessageId) {
      const existing = await this.messages
        .findOne({
          senderId: new Types.ObjectId(actor.id),
          clientMessageId,
        })
        .lean();
      if (existing) {
        return {
          ok: true as const,
          id: String(existing._id),
          duplicate: true,
          message: this.mapMessageDto(existing as never, actor.id),
        };
      }
    }

    const conv = await this.getOrCreateConversation(actor, receiverId);

    let created;
    try {
      created = await this.messages.create({
        conversationId: new Types.ObjectId(conv.id),
        senderId: new Types.ObjectId(actor.id),
        receiverId: new Types.ObjectId(receiverId),
        kind: "TEXT",
        body: text,
        clientMessageId: clientMessageId || undefined,
        deliveredAt: null,
        readAt: null,
      });
    } catch (err) {
      if (clientMessageId) {
        const existing = await this.messages
          .findOne({
            senderId: new Types.ObjectId(actor.id),
            clientMessageId,
          })
          .lean();
        if (existing) {
          return {
            ok: true as const,
            id: String(existing._id),
            duplicate: true,
            message: this.mapMessageDto(existing as never, actor.id),
          };
        }
      }
      throw err;
    }

    await this.conversations.updateOne(
      { _id: conv.id },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: previewOf("TEXT", text),
        },
      },
    );

    await this.audit.write({
      actor,
      action: "STAFF_CHAT_TEXT",
      entityType: "StaffMessage",
      entityId: String(created._id),
      newValue: {
        receiverId,
        conversationId: conv.id,
        preview: text.slice(0, 80),
      },
    });

    return {
      ok: true as const,
      id: String(created._id),
      duplicate: false,
      message: this.mapMessageDto(created as never, actor.id),
    };
  }

  async sendVoice(
    actor: AuthUser,
    receiverId: string,
    file: Express.Multer.File | undefined,
    clientMessageId?: string,
  ) {
    this.assertStaff(actor);
    this.assertSendRate(actor);
    assertSecretaryCanChat(
      actor.roleCode,
      await this.loadSecretarySchedule(actor),
    );
    await this.assertPeerAllowed(actor, receiverId);

    if (clientMessageId) {
      const existing = await this.messages
        .findOne({
          senderId: new Types.ObjectId(actor.id),
          clientMessageId,
        })
        .lean();
      if (existing) {
        return {
          ok: true as const,
          id: String(existing._id),
          duplicate: true,
          message: this.mapMessageDto(existing as never, actor.id),
        };
      }
    }

    if (!file?.buffer?.length) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "ملف الصوت مطلوب.",
      });
    }
    if (file.size > VOICE_MAX_BYTES) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "حجم التسجيل يتجاوز 2 ميغابايت.",
      });
    }
    const mime = (file.mimetype || "").toLowerCase();
    if (!VOICE_MIME.has(mime) && !mime.startsWith("audio/")) {
      throw new BadRequestException({
        code: ErrorCodes.VALIDATION_ERROR,
        message: "صيغة الصوت غير مدعومة.",
      });
    }

    const ext =
      mime.includes("ogg")
        ? ".ogg"
        : mime.includes("mpeg") || mime.includes("mp3")
          ? ".mp3"
          : mime.includes("mp4") || mime.includes("m4a")
            ? ".m4a"
            : mime.includes("wav")
              ? ".wav"
              : ".webm";
    const key = `${randomUUID()}${ext}`;
    const abs = join(this.privateRoot(), key);
    writeFileSync(abs, file.buffer);

    const conv = await this.getOrCreateConversation(actor, receiverId);

    let created;
    try {
      created = await this.messages.create({
        conversationId: new Types.ObjectId(conv.id),
        senderId: new Types.ObjectId(actor.id),
        receiverId: new Types.ObjectId(receiverId),
        kind: "VOICE",
        body: "",
        audioStorageKey: key,
        audioMimeType: mime || "audio/webm",
        audioSizeBytes: file.size,
        clientMessageId: clientMessageId || undefined,
      });
    } catch (err) {
      try {
        if (existsSync(abs)) unlinkSync(abs);
      } catch {
        /* ignore */
      }
      if (clientMessageId) {
        const existing = await this.messages
          .findOne({
            senderId: new Types.ObjectId(actor.id),
            clientMessageId,
          })
          .lean();
        if (existing) {
          return {
            ok: true as const,
            id: String(existing._id),
            duplicate: true,
            message: this.mapMessageDto(existing as never, actor.id),
          };
        }
      }
      throw err;
    }

    await this.conversations.updateOne(
      { _id: conv.id },
      {
        $set: {
          lastMessageAt: new Date(),
          lastMessagePreview: previewOf("VOICE", ""),
        },
      },
    );

    await this.audit.write({
      actor,
      action: "STAFF_CHAT_VOICE",
      entityType: "StaffMessage",
      entityId: String(created._id),
      newValue: {
        receiverId,
        conversationId: conv.id,
        sizeBytes: file.size,
        mime,
      },
    });

    return {
      ok: true as const,
      id: String(created._id),
      duplicate: false,
      message: this.mapMessageDto(created as never, actor.id),
    };
  }

  async markDelivered(messageId: string, receiverId: string) {
    if (!Types.ObjectId.isValid(messageId)) return;
    await this.messages.updateOne(
      {
        _id: messageId,
        receiverId: new Types.ObjectId(receiverId),
        deliveredAt: null,
        deletedAt: null,
      },
      { $set: { deliveredAt: new Date() } },
    );
  }

  async streamAudio(actor: AuthUser, messageId: string, res: Response) {
    this.assertStaff(actor);
    if (!Types.ObjectId.isValid(messageId)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الملف غير موجود.",
      });
    }
    const msg = await this.messages.findOne({
      _id: messageId,
      deletedAt: null,
      kind: "VOICE",
    });
    if (!msg?.audioStorageKey) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الملف غير موجود.",
      });
    }
    const uid = actor.id;
    if (String(msg.senderId) !== uid && String(msg.receiverId) !== uid) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "ليس لديك صلاحية للوصول إلى هذه المحادثة.",
      });
    }
    await this.assertPeerAllowed(
      actor,
      String(msg.senderId) === uid
        ? String(msg.receiverId)
        : String(msg.senderId),
    );

    const abs = join(this.privateRoot(), msg.audioStorageKey);
    if (!existsSync(abs)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الملف غير موجود على الخادم.",
      });
    }
    res.setHeader("Content-Type", msg.audioMimeType || "audio/webm");
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Disposition", "inline");
    createReadStream(abs).pipe(res);
  }

  async threadMessages(
    actor: AuthUser,
    peerId: string,
    opts: { before?: string; limit?: number },
  ) {
    this.assertStaff(actor);
    await this.assertPeerAllowed(actor, peerId);
    const limit = Math.min(Math.max(opts.limit || 40, 1), 100);
    const filter: Record<string, unknown> = {
      $or: [
        {
          senderId: new Types.ObjectId(actor.id),
          receiverId: new Types.ObjectId(peerId),
        },
        {
          senderId: new Types.ObjectId(peerId),
          receiverId: new Types.ObjectId(actor.id),
        },
      ],
    };
    if (opts.before && Types.ObjectId.isValid(opts.before)) {
      filter._id = { $lt: new Types.ObjectId(opts.before) };
    }
    const rows = await this.messages
      .find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();
    const hasMore = rows.length > limit;
    const slice = hasMore ? rows.slice(0, limit) : rows;
    const messages = slice.reverse().map((m) =>
      this.mapMessageDto(m as never, actor.id),
    );
    return {
      ok: true,
      peerId,
      messages,
      hasMore,
      nextBefore: messages.length ? messages[0].id : null,
    };
  }

  async deleteMessage(actor: AuthUser, messageId: string) {
    this.assertStaff(actor);
    if (!Types.ObjectId.isValid(messageId)) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الرسالة غير موجودة.",
      });
    }
    const msg = await this.messages.findOne({
      _id: messageId,
      deletedAt: null,
    });
    if (!msg) {
      throw new NotFoundException({
        code: ErrorCodes.NOT_FOUND,
        message: "الرسالة غير موجودة.",
      });
    }
    if (
      !canDeleteStaffMessage({
        actorId: actor.id,
        actorRole: actor.roleCode,
        senderId: String(msg.senderId),
        receiverId: String(msg.receiverId),
        kind: msg.kind,
      })
    ) {
      throw new ForbiddenException({
        code: ErrorCodes.FORBIDDEN,
        message: "غير مسموح بحذف هذه الرسالة.",
      });
    }

    const peerIds = [String(msg.senderId), String(msg.receiverId)];

    msg.deletedAt = new Date();
    msg.deletedBy = new Types.ObjectId(actor.id);
    await msg.save();

    if (msg.kind === "VOICE" && msg.audioStorageKey) {
      const abs = join(this.privateRoot(), msg.audioStorageKey);
      try {
        if (existsSync(abs)) unlinkSync(abs);
      } catch {
        /* ignore FS */
      }
      msg.audioStorageKey = undefined;
      await msg.save();
    }

    await this.audit.write({
      actor,
      action: "STAFF_CHAT_DELETE",
      entityType: "StaffMessage",
      entityId: messageId,
      reason: `حذف رسالة ${msg.kind}`,
    });

    return { ok: true as const, peerIds, conversationId: msg.conversationId };
  }
}
