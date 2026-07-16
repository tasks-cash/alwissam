"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";

type ChatMessage = {
  id: string;
  kind: string;
  messageType?: string;
  body: string;
  audioUrl?: string | null;
  createdAt?: string;
  mine: boolean;
  senderName?: string;
  senderRole?: string;
  readAt?: string | null;
  deliveredAt?: string | null;
  status?: string;
  deleted?: boolean;
  clientMessageId?: string | null;
};

type Thread = {
  peerId: string;
  conversationId?: string | null;
  peerName: string;
  peerRole: string;
  peerRoleLabel: string;
  peerInitials?: string;
  group: "DOCTORS" | "SECRETARIES";
  messages: ChatMessage[];
  unread: number;
  lastMessagePreview?: string;
  lastMessageAt?: string | null;
};

type FilterKey = "ALL" | "DOCTORS" | "SECRETARIES";

type VoiceDraft = {
  blob: Blob;
  url: string;
  durationSec: number;
};

function apiSocketBase() {
  if (typeof window === "undefined") return "";
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    `${window.location.protocol}//${window.location.hostname}:4001`
  );
}

function clientMsgId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function VoicePlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setPlaying(false);
    setCurrent(0);
  }, [src]);

  return (
    <div className="staff-voice-player" dir="ltr">
      <audio
        ref={audioRef}
        preload="metadata"
        src={src}
        onLoadedMetadata={() => {
          setLoading(false);
          setDuration(audioRef.current?.duration || 0);
        }}
        onTimeUpdate={() => setCurrent(audioRef.current?.currentTime || 0)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
      />
      <button
        type="button"
        className="btn btn-outline staff-voice-play"
        disabled={error || loading}
        aria-label={playing ? "إيقاف مؤقت" : "تشغيل"}
        onClick={() => {
          const el = audioRef.current;
          if (!el) return;
          if (playing) {
            el.pause();
            setPlaying(false);
          } else {
            void el.play().then(() => setPlaying(true)).catch(() => setError(true));
          }
        }}
      >
        {loading ? "…" : playing ? "❚❚" : "▶"}
      </button>
      <div className="staff-voice-meta">
        {error ? (
          <span className="alert-error">تعذر تشغيل الصوت</span>
        ) : (
          <>
            <span>
              {formatDuration(current)} / {formatDuration(duration || 0)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              aria-label="تقدم التشغيل"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (audioRef.current) audioRef.current.currentTime = v;
                setCurrent(v);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Staff-only chat FAB — mounted once from DashboardShell.
 * Patients never mount this (parent gates by role).
 */
export function StaffChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [connError, setConnError] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [voiceDraft, setVoiceDraft] = useState<VoiceDraft | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [typingFrom, setTypingFrom] = useState("");
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const mergeMessage = useCallback((peerId: string, msg: ChatMessage) => {
    if (seenIdsRef.current.has(msg.id)) return;
    seenIdsRef.current.add(msg.id);
    setThreads((prev) =>
      prev.map((t) => {
        if (t.peerId !== peerId) return t;
        if (t.messages.some((m) => m.id === msg.id)) return t;
        return {
          ...t,
          messages: [...t.messages, msg],
          lastMessagePreview:
            msg.deleted
              ? "تم حذف هذه الرسالة"
              : msg.kind === "VOICE"
                ? "🎤 رسالة صوتية"
                : msg.body,
          lastMessageAt: msg.createdAt || t.lastMessageAt,
          unread: msg.mine ? t.unread : t.unread + 1,
        };
      }),
    );
  }, []);

  const load = useCallback(async (opts?: { markRead?: boolean }) => {
    try {
      const q = opts?.markRead ? "?markRead=1" : "";
      const res = await fetch(`/api/staff/chat${q}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        setAllowed(false);
        setBootLoading(false);
        return;
      }
      if (!res.ok) {
        setConnError(true);
        setBootLoading(false);
        return;
      }
      setConnError(false);
      setAllowed(true);
      const data = await res.json();
      const nextThreads: Thread[] = Array.isArray(data.threads)
        ? data.threads
        : [];
      for (const t of nextThreads) {
        for (const m of t.messages || []) {
          seenIdsRef.current.add(m.id);
        }
      }
      setThreads(nextThreads);
      setUnread(Number(data.unreadCount) || 0);
      setActivePeerId((prev) => {
        if (
          prev &&
          nextThreads.some((t) => t.peerId === prev)
        ) {
          return prev;
        }
        return prev;
      });
    } catch {
      setConnError(true);
    } finally {
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 12_000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!allowed) return;
    const base = apiSocketBase();
    const socket = io(`${base}/staff-chat`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 20,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnError(false));
    socket.on("disconnect", () => setConnError(true));
    socket.on("connect_error", () => setConnError(true));

    const onCreated = (payload: ChatMessage & { fromUserId?: string }) => {
      const peerId = payload.mine
        ? activePeerId
        : payload.fromUserId;
      if (!peerId || !payload.id) return;
      mergeMessage(peerId, {
        ...payload,
        mine: Boolean(payload.mine),
      });
      if (!payload.mine) {
        setUnread((u) => u + 1);
      }
      void load({ markRead: open && activePeerId === peerId });
    };

    socket.on("staff:message:created", onCreated);
    socket.on("staff:message", onCreated);

    socket.on(
      "staff:message:deleted",
      (payload: { messageId?: string }) => {
        if (!payload.messageId) return;
        setThreads((prev) =>
          prev.map((t) => ({
            ...t,
            messages: t.messages.map((m) =>
              m.id === payload.messageId
                ? { ...m, deleted: true, body: "", audioUrl: null, status: "deleted" }
                : m,
            ),
          })),
        );
      },
    );
    socket.on("staff:deleted", (payload: { messageId?: string }) => {
      if (!payload.messageId) return;
      setThreads((prev) =>
        prev.map((t) => ({
          ...t,
          messages: t.messages.map((m) =>
            m.id === payload.messageId
              ? { ...m, deleted: true, body: "", audioUrl: null, status: "deleted" }
              : m,
          ),
        })),
      );
    });

    socket.on(
      "staff:typing:start",
      (payload: { fullName?: string }) => {
        setTypingFrom(payload.fullName || "…");
      },
    );
    socket.on("staff:typing:stop", () => setTypingFrom(""));
    socket.on(
      "staff:typing",
      (payload: { fullName?: string; state?: string }) => {
        if (payload.state === "stop") {
          setTypingFrom("");
          return;
        }
        setTypingFrom(payload.fullName || "…");
        window.setTimeout(() => setTypingFrom(""), 2500);
      },
    );

    const onPresence = (payload: { userId?: string; online?: boolean }) => {
      if (!payload.userId) return;
      setOnlineIds((prev) => {
        const next = new Set(prev);
        if (payload.online) next.add(payload.userId!);
        else next.delete(payload.userId!);
        return next;
      });
    };
    socket.on("staff:presence:update", onPresence);
    socket.on("staff:presence", onPresence);

    socket.on("staff:unread:update", () => {
      void load();
    });

    socket.on("staff:shift:ended", (payload: { message?: string }) => {
      setError(
        payload.message ||
          "انتهى وقت العمل المحدد لك، وتم إنهاء جلسة الدخول.",
      );
      setAllowed(false);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [allowed, load, open, activePeerId, mergeMessage]);

  useEffect(() => {
    if (open && !minimized) {
      void load({ markRead: Boolean(activePeerId) });
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, minimized, activePeerId, load]);

  useEffect(() => {
    if (!activePeerId || !open || minimized) {
      setHasMore(false);
      return;
    }
    const sock = socketRef.current;
    if (sock) {
      sock.emit("staff:conversation:join", { peerId: activePeerId });
    }
    void (async () => {
      try {
        const res = await fetch(
          `/api/staff/chat/thread/${activePeerId}?limit=40`,
          { credentials: "include", cache: "no-store" },
        );
        if (res.status === 403) {
          setError("ليس لديك صلاحية للوصول إلى هذه المحادثة.");
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        setHasMore(Boolean(data.hasMore));
        if (Array.isArray(data.messages)) {
          for (const m of data.messages) seenIdsRef.current.add(m.id);
          setThreads((prev) =>
            prev.map((t) =>
              t.peerId === activePeerId
                ? { ...t, messages: data.messages }
                : t,
            ),
          );
        }
        await fetch("/api/staff/chat/read", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ peerId: activePeerId }),
        });
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        setConnError(true);
      }
    })();
    return () => {
      sock?.emit("staff:conversation:leave", { peerId: activePeerId });
    };
  }, [activePeerId, open, minimized]);

  useEffect(() => {
    return () => {
      if (voiceDraft?.url) URL.revokeObjectURL(voiceDraft.url);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [voiceDraft?.url]);

  async function loadOlder() {
    if (!activePeerId) return;
    const thread = threads.find((t) => t.peerId === activePeerId);
    if (!thread?.messages.length) return;
    setLoadingOlder(true);
    try {
      const before = thread.messages[0]?.id;
      const res = await fetch(
        `/api/staff/chat/thread/${activePeerId}?limit=40&before=${encodeURIComponent(before)}`,
        { credentials: "include", cache: "no-store" },
      );
      if (!res.ok) return;
      const data = await res.json();
      setHasMore(Boolean(data.hasMore));
      const older = Array.isArray(data.messages) ? data.messages : [];
      if (!older.length) return;
      setThreads((prev) =>
        prev.map((t) => {
          if (t.peerId !== activePeerId) return t;
          const seen = new Set(t.messages.map((m) => m.id));
          const merged = [
            ...older.filter((m: ChatMessage) => !seen.has(m.id)),
            ...t.messages,
          ];
          for (const m of merged) seenIdsRef.current.add(m.id);
          return { ...t, messages: merged };
        }),
      );
    } finally {
      setLoadingOlder(false);
    }
  }

  const visible = useMemo(() => {
    let list = threads;
    if (filter !== "ALL") list = list.filter((t) => t.group === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.peerName.toLowerCase().includes(q) ||
          t.peerRoleLabel.includes(search.trim()),
      );
    }
    return list;
  }, [threads, filter, search]);

  const active = useMemo(
    () => threads.find((t) => t.peerId === activePeerId) || null,
    [threads, activePeerId],
  );

  function emitTyping(state: "start" | "stop") {
    if (!activePeerId || !socketRef.current) return;
    socketRef.current.emit(
      state === "start" ? "staff:typing:start" : "staff:typing:stop",
      { peerId: activePeerId },
    );
  }

  async function sendText(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!activePeerId) {
      setError("اختر مستلماً من القائمة");
      return;
    }
    setLoading(true);
    setError("");
    const cid = clientMsgId();
    try {
      const res = await fetch("/api/staff/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activePeerId,
          body: text.trim(),
          clientMessageId: cid,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          (typeof json.message === "string" && json.message) ||
            "تعذر إرسال الرسالة",
        );
        return;
      }
      if (json.message) {
        mergeMessage(activePeerId, { ...json.message, mine: true });
      }
      setText("");
      emitTyping("stop");
    } catch {
      setError("تعذر الاتصال بالمحادثة. سنحاول إعادة الاتصال.");
      setConnError(true);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(messageId: string) {
    setError("");
    const res = await fetch("/api/staff/chat", {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(
        (typeof json.message === "string" && json.message) || "تعذر الحذف",
      );
      return;
    }
    setThreads((prev) =>
      prev.map((t) => ({
        ...t,
        messages: t.messages.map((m) =>
          m.id === messageId
            ? { ...m, deleted: true, body: "", audioUrl: null, status: "deleted" }
            : m,
        ),
      })),
    );
  }

  async function startRecording() {
    if (!activePeerId) {
      setError("اختر مستلماً من القائمة");
      return;
    }
    setError("");
    setVoiceDraft((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => {
        if (ev.data.size) chunksRef.current.push(ev.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (recordTimerRef.current) {
          clearInterval(recordTimerRef.current);
          recordTimerRef.current = null;
        }
        const blob = new Blob(chunksRef.current, {
          type: rec.mimeType || "audio/webm",
        });
        if (blob.size > 2 * 1024 * 1024) {
          setError("حجم التسجيل يتجاوز 2 ميغابايت");
          setRecording(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        setVoiceDraft({ blob, url, durationSec: recordSec });
        setRecording(false);
      };
      mediaRef.current = rec;
      rec.start();
      setRecording(true);
      setRecordSec(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSec((s) => s + 1);
      }, 1000);
    } catch {
      setError("تعذر الوصول إلى الميكروفون. تحقق من صلاحيات المتصفح.");
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current = null;
  }

  function discardVoiceDraft() {
    setVoiceDraft((prev) => {
      if (prev?.url) URL.revokeObjectURL(prev.url);
      return null;
    });
    setUploadPct(0);
  }

  async function sendVoiceDraft() {
    if (!voiceDraft || !activePeerId) return;
    setLoading(true);
    setError("");
    setUploadPct(5);
    const cid = clientMsgId();
    try {
      const fd = new FormData();
      fd.append("file", voiceDraft.blob, "voice.webm");
      fd.append("receiverId", activePeerId);
      fd.append("clientMessageId", cid);

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/staff/chat/voice");
        xhr.withCredentials = true;
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadPct(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.message) {
                mergeMessage(activePeerId, { ...json.message, mine: true });
              }
            } catch {
              /* ignore */
            }
            resolve();
          } else {
            let msg = "تعذر إرسال الرسالة الصوتية. حاول مرة أخرى.";
            try {
              const json = JSON.parse(xhr.responseText);
              if (typeof json.message === "string") msg = json.message;
            } catch {
              /* ignore */
            }
            reject(new Error(msg));
          }
        };
        xhr.onerror = () =>
          reject(new Error("تعذر إرسال الرسالة الصوتية. حاول مرة أخرى."));
        xhr.send(fd);
      });
      discardVoiceDraft();
      setUploadPct(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر إرسال الرسالة الصوتية. حاول مرة أخرى.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openPeer(peerId: string) {
    setActivePeerId(peerId);
    setMobileShowThread(true);
    setError("");
  }

  if (!allowed && !bootLoading) return null;
  if (!allowed) return null;

  const panelOpen = open && !minimized;

  return (
    <div className="staff-chat" dir="rtl">
      <button
        type="button"
        className="staff-chat-fab"
        aria-expanded={open}
        aria-controls="staff-chat-panel"
        aria-label="فتح دردشة الطاقم"
        title="فتح دردشة الطاقم"
        onClick={() => {
          setOpen((v) => !v);
          setMinimized(false);
        }}
      >
        <span aria-hidden className="staff-chat-fab-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7A2.5 2.5 0 0 1 17.5 16H9l-4 3.2V6.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {unread > 0 ? (
          <span className="staff-chat-badge" aria-label={`${unread} غير مقروء`}>
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {panelOpen ? (
        <div
          id="staff-chat-panel"
          className={`staff-chat-panel${mobileShowThread && active ? " staff-chat-panel--thread" : ""}`}
          role="dialog"
          aria-label="دردشة الطاقم"
        >
          <header className="staff-chat-head">
            <strong>دردشة الطاقم</strong>
            <div className="staff-chat-head-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setMinimized(true)}
                aria-label="تصغير"
              >
                −
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setOpen(false);
                  setMobileShowThread(false);
                }}
                aria-label="إغلاق"
              >
                إغلاق
              </button>
            </div>
          </header>

          {connError ? (
            <p className="staff-chat-banner" role="status">
              تعذر الاتصال بالمحادثة. سنحاول إعادة الاتصال.
            </p>
          ) : null}

          <div className="staff-chat-filters" role="tablist">
            {(
              [
                ["ALL", "الكل"],
                ["DOCTORS", "أطباء"],
                ["SECRETARIES", "سكرتارية"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={filter === key}
                className={filter === key ? "active" : undefined}
                onClick={() => setFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="staff-chat-search">
            <label className="sr-only" htmlFor="staff-chat-search-input">
              بحث عن موظف
            </label>
            <input
              id="staff-chat-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن موظف…"
              autoComplete="off"
            />
          </div>

          <div className="staff-chat-body">
            <aside className="staff-chat-peers" aria-label="قائمة المحادثات">
              {bootLoading ? (
                <p className="muted">جارٍ تحميل المحادثات...</p>
              ) : visible.length === 0 ? (
                <p className="muted">لا توجد محادثات متاحة حاليًا.</p>
              ) : (
                visible.map((t) => (
                  <button
                    key={t.peerId}
                    type="button"
                    className={
                      activePeerId === t.peerId
                        ? "staff-peer active"
                        : "staff-peer"
                    }
                    onClick={() => openPeer(t.peerId)}
                  >
                    <span className="staff-peer-avatar" aria-hidden>
                      {t.peerInitials || t.peerName.slice(0, 2)}
                    </span>
                    <span className="staff-peer-main">
                      <span className="staff-peer-name">
                        {t.peerName}
                        <span
                          className={
                            onlineIds.has(t.peerId)
                              ? "staff-online on"
                              : "staff-online"
                          }
                          title={onlineIds.has(t.peerId) ? "متصل" : "غير متصل"}
                        />
                      </span>
                      <small>{t.peerRoleLabel}</small>
                      {t.lastMessagePreview ? (
                        <small className="staff-peer-preview">
                          {t.lastMessagePreview}
                        </small>
                      ) : null}
                    </span>
                    <span className="staff-peer-meta">
                      {t.lastMessageAt ? (
                        <time dateTime={String(t.lastMessageAt)}>
                          {new Date(t.lastMessageAt).toLocaleTimeString("ar", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      ) : null}
                      {t.unread > 0 ? (
                        <span className="staff-chat-badge">{t.unread}</span>
                      ) : null}
                    </span>
                  </button>
                ))
              )}
            </aside>

            <section className="staff-chat-thread" aria-live="polite">
              {!active ? (
                <p className="muted staff-chat-empty">
                  ابدأ المحادثة بإرسال رسالة.
                </p>
              ) : (
                <>
                  <div className="staff-chat-thread-head">
                    <button
                      type="button"
                      className="staff-chat-back"
                      onClick={() => setMobileShowThread(false)}
                      aria-label="رجوع للقائمة"
                    >
                      ←
                    </button>
                    <span className="staff-peer-avatar" aria-hidden>
                      {active.peerInitials || active.peerName.slice(0, 2)}
                    </span>
                    <div>
                      <strong>{active.peerName}</strong>
                      <span className="muted">
                        {active.peerRoleLabel}
                        {onlineIds.has(active.peerId) ? " · متصل" : " · غير متصل"}
                      </span>
                    </div>
                  </div>
                  <ul className="staff-chat-messages">
                    {hasMore ? (
                      <li className="staff-chat-load-older">
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={loadingOlder}
                          onClick={() => void loadOlder()}
                        >
                          {loadingOlder ? "جارٍ التحميل…" : "رسائل أقدم"}
                        </button>
                      </li>
                    ) : null}
                    {active.messages.length === 0 ? (
                      <li className="muted">ابدأ المحادثة بإرسال رسالة.</li>
                    ) : null}
                    {active.messages.map((m) => (
                      <li
                        key={m.id}
                        className={m.mine ? "staff-bubble mine" : "staff-bubble"}
                      >
                        {m.deleted ? (
                          <p className="muted">تم حذف هذه الرسالة</p>
                        ) : m.kind === "VOICE" && m.audioUrl ? (
                          <VoicePlayer src={m.audioUrl} />
                        ) : (
                          <p>{m.body}</p>
                        )}
                        <div className="staff-bubble-actions">
                          <small className="muted">
                            {m.createdAt
                              ? new Date(m.createdAt).toLocaleTimeString("ar")
                              : ""}
                            {m.mine && !m.deleted
                              ? m.status === "read"
                                ? " · مقروءة"
                                : m.status === "delivered"
                                  ? " · تم التسليم"
                                  : " · تم الإرسال"
                              : ""}
                          </small>
                          {!m.deleted && (m.mine || m.kind === "VOICE") ? (
                            <button
                              type="button"
                              className="btn-link"
                              onClick={() => void deleteMessage(m.id)}
                            >
                              حذف
                            </button>
                          ) : null}
                        </div>
                      </li>
                    ))}
                    <div ref={bottomRef} />
                  </ul>
                  {typingFrom ? (
                    <p className="muted staff-typing">{typingFrom} يكتب…</p>
                  ) : null}
                  {error ? <p className="alert-error">{error}</p> : null}

                  {voiceDraft ? (
                    <div className="staff-voice-draft">
                      <audio controls src={voiceDraft.url} preload="metadata" />
                      <span>{formatDuration(voiceDraft.durationSec)}</span>
                      {uploadPct > 0 ? (
                        <span>رفع {uploadPct}%</span>
                      ) : null}
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={discardVoiceDraft}
                        disabled={loading}
                      >
                        حذف
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => void sendVoiceDraft()}
                        disabled={loading}
                      >
                        إرسال الصوت
                      </button>
                    </div>
                  ) : null}

                  <form className="staff-chat-compose" onSubmit={sendText}>
                    <input
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        emitTyping("start");
                      }}
                      onBlur={() => emitTyping("stop")}
                      placeholder="اكتب رسالة…"
                      maxLength={4000}
                      disabled={loading || recording}
                      aria-label="نص الرسالة"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading || !text.trim() || recording}
                      aria-label="إرسال"
                    >
                      إرسال
                    </button>
                    {recording ? (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={stopRecording}
                        aria-label="إيقاف التسجيل"
                      >
                        إيقاف {formatDuration(recordSec)}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => void startRecording()}
                        disabled={loading || Boolean(voiceDraft)}
                        aria-label="تسجيل رسالة صوتية"
                      >
                        🎙
                      </button>
                    )}
                  </form>
                </>
              )}
            </section>
          </div>
        </div>
      ) : null}

      {open && minimized ? (
        <button
          type="button"
          className="staff-chat-mini"
          onClick={() => setMinimized(false)}
          aria-label="استعادة دردشة الطاقم"
        >
          دردشة الطاقم
          {unread > 0 ? ` (${unread})` : ""}
        </button>
      ) : null}
    </div>
  );
}
