# Integration Inventory

Only integrations evidenced in source or Compose are listed. Provider env vars without senders are marked **unwired**.

| Integration | Purpose | Source Files | Environment Variables | Incoming/Outgoing | Authentication | Retry Behavior | Error Behavior | Webhooks | Target Module | Test Strategy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PostgreSQL 16 | Primary relational store via Prisma | `src/lib/db/prisma.ts`, `prisma/*`, `docker-compose.yml` | `DATABASE_URL`, `POSTGRES_*` | Outgoing queries | DB URL credentials | Pool defaults | Fail request / boot migrate | n/a | Legacy until cutover; migration source | Connection dry-run; never reset |
| Redis 7 | Rate limit counters; pub/sub events | `src/lib/db/redis.ts`, `rate-limit.ts`, `services/appointments.ts` (`publishEvent`) | `REDIS_URL` | Outgoing | URL | Memory fallback for rate limit; pub/sub no-op if down | Degraded | n/a | Nest Redis optional module (**required for parity**) | Unit mock + integration with Compose Redis |
| Local filesystem | Medical document storage | `src/app/api/files/upload/route.ts`, Compose volume `uploads_data` | `UPLOAD_DIR`, `MAX_UPLOAD_SIZE_MB` | Incoming uploads | Session + CSRF | None | 4xx validation | n/a | Nest FilesModule | MIME/size tests; no real PII in CI |
| Server-Sent Events | Clinic queue polling stream | `src/app/api/realtime/stream/route.ts` | none specific | Outgoing event stream | Session cookie | Reconnect client-side unknown | Ends on error | n/a | Nest realtime | Authz restriction tests |
| QR code generation | Patient QR access | `src/lib/patient-qr.ts`, `qrcode` dep, `PatientQrCode.tsx` | `NEXT_PUBLIC_APP_URL` | Outgoing QR images / URLs | session for viewing | n/a | — | n/a | shared util + Nest | Token format tests |
| SMTP email | Intended notifications | `.env.example` only | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Outgoing (intended) | SMTP creds | **No implementation** | n/a | n/a | NotificationsModule later | Do not claim working |
| SMS provider | Intended SMS | `.env.example` | `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER` | Outgoing intended | API key | **Unwired** | n/a | n/a | later | mock only |
| WhatsApp provider | Intended WhatsApp | `.env.example` | `WHATSAPP_PROVIDER`, `WHATSAPP_API_KEY`, `WHATSAPP_FROM` | Outgoing intended | API key | **Unwired** | n/a | n/a | later | mock only |
| Signed URL scheme | Intended private downloads | declared only | `SIGNED_URL_SECRET` | — | — | **Unwired** (no src usage) | n/a | n/a | FilesModule | implement then test |
| Clinic map embed | Public contact page | `clinic-contact.ts`, contact page | `CLINIC_MAP_EMBED_URL` (+ DB override) | Browser embed | none | n/a | missing → empty | n/a | web | snapshot |
| Render hosting | Deploy target | `render.yaml` | Render dashboard secrets | Deploy | Render | platform | build fail | n/a | docs update post-cutover | — |
| Docker Compose | Local/prod-ish stack | `docker-compose.yml`, `Dockerfile` | see env example | — | — | healthchecks | container exit | n/a | extend with `mongodb`, `api`, `web` | `docker compose config` |

## Explicit non-integrations

- No Stripe/PayPal or other payment gateways — clinic cash/card/bank enums only.
- No OAuth/social login.
- No Telegram bot.
- No PDF SaaS.
- No analytics SDK found in `src/`.
- `jose` package present but unused (no JWT auth path found).
