import { ForbiddenException } from "@nestjs/common";
import { Types } from "mongoose";
import { StaffChatService } from "./staff-chat.service";

function actor(partial: {
  id?: string;
  roleCode: string;
  fullName?: string;
}) {
  return {
    id: partial.id || new Types.ObjectId().toString(),
    roleCode: partial.roleCode,
    fullName: partial.fullName || "Test User",
  };
}

describe("StaffChatService authorization & persistence", () => {
  const audit = { write: jest.fn().mockResolvedValue(undefined) };

  function build(opts?: {
    peers?: Array<{
      _id: Types.ObjectId;
      fullName: string;
      roleCode: string;
      secretary?: { assignedDoctorIds?: Types.ObjectId[] };
      status?: string;
    }>;
    me?: {
      _id: Types.ObjectId;
      roleCode: string;
      secretary?: unknown;
      status?: string;
    };
  }) {
    const meId = opts?.me?._id || new Types.ObjectId();
    const me =
      opts?.me ||
      ({
        _id: meId,
        roleCode: "ADMIN_OWNER",
        status: "ACTIVE",
      } as const);

    const peers = opts?.peers || [];
    const createdMessages: Array<Record<string, unknown>> = [];

    const messages = {
      create: jest.fn(async (doc: Record<string, unknown>) => {
        const row = {
          ...doc,
          _id: new Types.ObjectId(),
          createdAt: new Date(),
          deletedAt: null,
          deliveredAt: null,
          readAt: null,
        };
        createdMessages.push(row);
        return row;
      }),
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      countDocuments: jest.fn().mockResolvedValue(0),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const conversations = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn(async (doc: Record<string, unknown>) => ({
        ...doc,
        _id: new Types.ObjectId(),
      })),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const users = {
      findOne: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(me),
        }),
      }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockImplementation(async () => {
            const id = String(
              (users.findById as jest.Mock).mock.calls.at(-1)?.[0],
            );
            if (id === String(me._id)) return me;
            return peers.find((p) => String(p._id) === id) || null;
          }),
        }),
      }),
      find: jest.fn().mockImplementation((filter: Record<string, unknown>) => {
        const role = filter.roleCode;
        let list = peers;
        if (role === "SECRETARY") {
          list = peers.filter((p) => p.roleCode === "SECRETARY");
        } else if (role && typeof role === "object" && "$in" in role) {
          const set = new Set((role as { $in: string[] }).$in);
          list = peers.filter((p) => set.has(p.roleCode));
        }
        return {
          select: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(list),
            }),
          }),
        };
      }),
    };

    const service = new StaffChatService(
      messages as never,
      conversations as never,
      users as never,
      audit as never,
    );

    return {
      service,
      messages,
      conversations,
      users,
      me,
      createdMessages,
      peers,
    };
  }

  it("rejects Patient access at assertStaff", () => {
    const { service } = build();
    expect(() => service.assertStaff(actor({ roleCode: "PATIENT" }))).toThrow(
      ForbiddenException,
    );
  });

  it("allows Admin/Owner Chat access", async () => {
    const doctorId = new Types.ObjectId();
    const secId = new Types.ObjectId();
    const { service, me } = build({
      me: {
        _id: new Types.ObjectId(),
        roleCode: "ADMIN_OWNER",
        status: "ACTIVE",
      },
      peers: [
        {
          _id: doctorId,
          fullName: "د. أحمد",
          roleCode: "DOCTOR_GENERAL",
        },
        {
          _id: secId,
          fullName: "سارة",
          roleCode: "SECRETARY",
          secretary: { assignedDoctorIds: [] },
        },
      ],
    });
    const peers = await service.listPeers(
      actor({ id: String(me._id), roleCode: "ADMIN_OWNER" }),
    );
    expect(peers.some((p) => p.id === String(doctorId))).toBe(true);
    expect(peers.some((p) => p.id === String(secId))).toBe(true);
  });

  it("allows Doctor Chat with assigned Secretary only", async () => {
    const doctorId = new Types.ObjectId();
    const assignedSec = new Types.ObjectId();
    const otherSec = new Types.ObjectId();
    const { service } = build({
      me: { _id: doctorId, roleCode: "DOCTOR_GENERAL", status: "ACTIVE" },
      peers: [
        {
          _id: assignedSec,
          fullName: "سكرتير مرتبط",
          roleCode: "SECRETARY",
          secretary: { assignedDoctorIds: [doctorId] },
        },
        {
          _id: otherSec,
          fullName: "سكرتير آخر",
          roleCode: "SECRETARY",
          secretary: { assignedDoctorIds: [new Types.ObjectId()] },
        },
      ],
    });
    const peers = await service.listPeers(
      actor({ id: String(doctorId), roleCode: "DOCTOR_GENERAL" }),
    );
    expect(peers.map((p) => p.id)).toContain(String(assignedSec));
    expect(peers.map((p) => p.id)).not.toContain(String(otherSec));
  });

  it("rejects unrelated Doctor access for Secretary", async () => {
    const secretaryId = new Types.ObjectId();
    const assignedDoctor = new Types.ObjectId();
    const otherDoctor = new Types.ObjectId();
    const { service } = build({
      me: {
        _id: secretaryId,
        roleCode: "SECRETARY",
        status: "ACTIVE",
        secretary: {
          assignedDoctorIds: [assignedDoctor],
          workDays: "SUN,MON,TUE,WED,THU,SAT",
          workStartTime: "00:00",
          workEndTime: "23:59",
        },
      },
      peers: [
        {
          _id: assignedDoctor,
          fullName: "طبيبي",
          roleCode: "DOCTOR_GENERAL",
        },
        {
          _id: otherDoctor,
          fullName: "طبيب آخر",
          roleCode: "DOCTOR_SPECIALIST",
        },
      ],
    });
    const peers = await service.listPeers(
      actor({ id: String(secretaryId), roleCode: "SECRETARY" }),
    );
    expect(peers.map((p) => p.id)).toEqual([String(assignedDoctor)]);
  });

  it("persists text message with conversation and duplicate prevention", async () => {
    const adminId = new Types.ObjectId();
    const doctorId = new Types.ObjectId();
    const { service, messages, conversations, createdMessages } = build({
      me: {
        _id: adminId,
        roleCode: "ADMIN_OWNER",
        status: "ACTIVE",
      },
      peers: [
        {
          _id: doctorId,
          fullName: "د. ليلى",
          roleCode: "DOCTOR_SPECIALIST",
        },
      ],
    });

    const a = actor({ id: String(adminId), roleCode: "ADMIN_OWNER" });
    const first = await service.sendText(
      a,
      String(doctorId),
      "مرحبا",
      "client-1",
    );
    expect(first.ok).toBe(true);
    expect(first.duplicate).toBe(false);
    expect(messages.create).toHaveBeenCalled();
    expect(conversations.create).toHaveBeenCalled();
    expect(createdMessages[0].kind).toBe("TEXT");
    expect(createdMessages[0].body).toBe("مرحبا");
    expect(createdMessages[0].audioStorageKey).toBeUndefined();

    messages.findOne = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(createdMessages[0]),
    });
    const dup = await service.sendText(
      a,
      String(doctorId),
      "مرحبا",
      "client-1",
    );
    expect(dup.duplicate).toBe(true);
    expect(messages.create).toHaveBeenCalledTimes(1);
  });

  it("persists voice metadata without Base64 body", async () => {
    const adminId = new Types.ObjectId();
    const doctorId = new Types.ObjectId();
    const { service, createdMessages } = build({
      me: { _id: adminId, roleCode: "ADMIN_OWNER", status: "ACTIVE" },
      peers: [
        {
          _id: doctorId,
          fullName: "د. ليلى",
          roleCode: "DOCTOR_SPECIALIST",
        },
      ],
    });

    const file = {
      buffer: Buffer.from("fake-audio"),
      size: 10,
      mimetype: "audio/webm",
    } as Express.Multer.File;

    const result = await service.sendVoice(
      actor({ id: String(adminId), roleCode: "ADMIN_OWNER" }),
      String(doctorId),
      file,
      "voice-1",
    );
    expect(result.ok).toBe(true);
    expect(createdMessages[0].kind).toBe("VOICE");
    expect(createdMessages[0].body).toBe("");
    expect(typeof createdMessages[0].audioStorageKey).toBe("string");
    expect(String(createdMessages[0].audioStorageKey)).not.toContain(
      "base64",
    );
    expect(result.message.audioUrl).toMatch(/^\/api\/staff\/chat\/audio\//);
  });

  it("rejects unrelated peer for assertPeerAllowed", async () => {
    const adminId = new Types.ObjectId();
    const doctorId = new Types.ObjectId();
    const stranger = new Types.ObjectId();
    const { service } = build({
      me: { _id: adminId, roleCode: "ADMIN_OWNER", status: "ACTIVE" },
      peers: [
        {
          _id: doctorId,
          fullName: "د. ليلى",
          roleCode: "DOCTOR_SPECIALIST",
        },
      ],
    });
    await expect(
      service.assertPeerAllowed(
        actor({ id: String(adminId), roleCode: "ADMIN_OWNER" }),
        String(stranger),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("rejects unauthorized conversation join", async () => {
    const adminId = new Types.ObjectId();
    const { service, conversations } = build({
      me: { _id: adminId, roleCode: "ADMIN_OWNER", status: "ACTIVE" },
      peers: [],
    });
    conversations.findOne = jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(),
        participantIds: [new Types.ObjectId(), new Types.ObjectId()],
        isActive: true,
        archivedAt: null,
      }),
    });
    await expect(
      service.assertConversationAccess(
        actor({ id: String(adminId), roleCode: "ADMIN_OWNER" }),
        new Types.ObjectId().toString(),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("marks read and returns unread count shape", async () => {
    const adminId = new Types.ObjectId();
    const doctorId = new Types.ObjectId();
    const { service, messages } = build({
      me: { _id: adminId, roleCode: "ADMIN_OWNER", status: "ACTIVE" },
      peers: [
        {
          _id: doctorId,
          fullName: "د. ليلى",
          roleCode: "DOCTOR_SPECIALIST",
        },
      ],
    });
    const a = actor({ id: String(adminId), roleCode: "ADMIN_OWNER" });
    const read = await service.markConversationRead(a, String(doctorId));
    expect(read.ok).toBe(true);
    expect(messages.updateMany).toHaveBeenCalled();
    const unread = await service.unreadCount(a);
    expect(unread).toEqual({ ok: true, unreadCount: 0 });
  });
});
