# Ashford & Gray Fusion Academy

A production-grade e-learning platform for luxury hospitality, business, and protocol training. Multi-role (student / instructor / admin / registrar / course_registrar / finance), Paystack payments, LiveKit live classes, Firebase Storage uploads, MongoDB persistence, Google Gemini for AI live-class review.

---

## Stack

- **Framework:** Next.js 15 App Router · React 19 · TypeScript
- **Auth:** Firebase Auth (client) + Firebase Admin SDK (server)
- **Data:** MongoDB Atlas via Mongoose
- **Live classes:** [LiveKit Cloud](https://cloud.livekit.io)
- **File storage:** Firebase Storage (signed-URL uploads)
- **Payments:** [Paystack](https://paystack.com)
- **AI:** Genkit + Google Gemini 2.5 Flash (transcript review / summary)
- **Rate limit:** Upstash Redis (optional; falls back to in-process)
- **Error monitoring:** Sentry (optional; no-op without DSN)
- **UI:** Tailwind + shadcn/Radix · lucide-react
- **Tests:** Vitest

---

## First-run checklist

Do these once, in order:

### 1. Clone + install

```bash
git clone <repo>
cd Ashford-and-Gray-Academy
npm install
```

### 2. Configure environment

```bash
cp .env.sample .env.local
```

Open `.env.local` and fill every section. Each section in `.env.sample` documents which service to sign up for and where in the dashboard the value lives.

### 3. Create the accounts

| Service | What you need | Free tier? |
|---|---|---|
| **MongoDB Atlas** — https://cloud.mongodb.com | Connection string for `MONGODB_URI`. Create an M0 cluster, add `0.0.0.0/0` to the IP allowlist for testing. | Yes (M0 free forever) |
| **Firebase** — https://console.firebase.google.com | Web app for client SDK; service account JSON for Admin SDK. Enable Email/Password + Google sign-in providers. Create a Storage bucket. | Yes (Spark plan) |
| **LiveKit Cloud** — https://cloud.livekit.io | API key + secret + `wss://...livekit.cloud` URL. | Yes (~10k participant-minutes/month) |
| **Paystack** — https://dashboard.paystack.com | Secret key + public key. Use the **test** keys until you're ready to take real money. | Yes (test mode free) |
| **Resend** — https://resend.com | API key for transactional email. Use `onboarding@resend.dev` to start; add your own domain for branded mail later. | Yes (3,000 emails/month) |
| **Upstash Redis** *(optional)* — https://console.upstash.com | URL + token for distributed rate limiting. | Yes |
| **Sentry** *(optional)* — https://sentry.io | DSN for error monitoring. | Yes |

### 4. Wire the webhooks

Two services need to call back to your app — set both URLs to your deployed origin (or use a tunnel like `ngrok http 9002` for local dev):

| Where | URL |
|---|---|
| LiveKit Cloud → Settings → Webhooks | `${NEXT_PUBLIC_APP_URL}/api/livekit/webhook` |
| Paystack Dashboard → Settings → API Keys & Webhooks | `${NEXT_PUBLIC_APP_URL}/api/payments/webhook` |

### 5. Provision staff accounts

The system has no hardcoded admin (that would be a backdoor). Run the dev-only bootstrap endpoint once:

```bash
curl -X POST http://localhost:9002/api/dev/bootstrap-staff \
  -H "Content-Type: application/json" \
  -d '{}'
```

Default credentials returned (override via `{"emailDomain": "...", "password": "..."}` in the body):

| Role | Email | Password | Portal |
|---|---|---|---|
| admin | `admin@ashfordgray.dev` | `AcademyTest2026!` | `/admin` |
| registrar | `registrar@ashfordgray.dev` | `AcademyTest2026!` | `/registrar` |
| course_registrar | `course-registrar@ashfordgray.dev` | `AcademyTest2026!` | `/course-registrar` |
| finance | `finance@ashfordgray.dev` | `AcademyTest2026!` | `/finance` |

The endpoint is **idempotent** (safe to re-run) and **dev-only** — it returns 404 in production unless `ALLOW_DEV_ENDPOINTS=true` is set. On a Vercel deploy: set that flag, run the curl, then unset the flag.

> If you'd rather not use the endpoint, sign up at `/login?view=signup` four times and manually edit each user's `role` in MongoDB Atlas → `users` collection.

### 6. Seed (optional)

As an admin in development, `GET http://localhost:9002/api/seed` will wipe the database and load the curated courses + events from `src/lib/data.ts`. This route is admin-only and disabled in production.

### 7. Run

```bash
npm run dev       # http://localhost:9002
npm run test      # vitest
npm run typecheck
npm run build
```

---

## Production deploy

The recommended hosting topology:

- **Next.js app** → Vercel.
- **MongoDB** → Atlas.
- **LiveKit** → LiveKit Cloud (managed).
- **Storage** → Firebase Storage.

On Vercel, set every variable from `.env.sample` in the project's environment-variables panel. Set `NEXT_PUBLIC_APP_URL` to your live domain. Set `NODE_ENV=production` (Vercel does this automatically).

Before going live:
- Switch Paystack from test (`sk_test_…`) to live (`sk_live_…`) keys.
- Verify the LiveKit and Paystack webhook URLs point at your production domain.
- Verify scaling settings (current default is `maxInstances: 1`; safe with the in-process rate limiter — bump only after configuring Upstash).
- Run `npm run typecheck` and `npm run test` in CI before deploys.

---

## Architecture notes

### Authentication

All non-public API routes go through `withAuth(...)` from `src/lib/auth-server.ts`, which:
1. Reads `Authorization: Bearer <token>` from the request.
2. Verifies the Firebase ID token with the Admin SDK.
3. Joins to the Mongo `User` profile to load the application role.
4. Hands an `AuthContext` (uid / email / role / displayName) to the route handler.

Identity is **never** read from query parameters or request bodies — clients cannot impersonate another user.

`authenticateFirebase(req)` is the bootstrap variant — used only by `POST /api/users` so a brand-new user can create their profile after Firebase sign-up.

### Payments (Paystack)

The webhook is authoritative; the verify call gives the user immediate feedback but writes are idempotent so the second-arriving signal does nothing. Pending transactions are recorded *before* the redirect so they always have a row to reconcile against.

### Live classes (LiveKit)

`/api/livekit/token` mints short-lived (4h) LiveKit JWTs. Room access is gated by the room name:

- `course-<courseId>` — only the course owner (instructor or admin) or an enrolled student may join.
- `meet-…` — ad-hoc 1:1 / small-group calls (e.g. from the messages screen). Any authenticated user with the link may join.
- Anything else is rejected.

LiveKit posts room lifecycle events to `/api/livekit/webhook` (HMAC signed). We persist room_started / room_finished / participant_joined into the `MeetingLog` collection.

### Storage

`POST /api/storage/signed-url` returns a 15-minute v4 signed Firebase Storage URL. The browser uploads directly to GCS — your Next.js server never proxies file bytes (so Vercel bandwidth costs stay low). Content-type and per-category byte limits are enforced server-side before the URL is issued.

### Roles

| Role | Layout | Notable capabilities |
|---|---|---|
| `student` | `/dashboard/*` | Enroll, attend, message, view own grades/notifications |
| `instructor` | `/instructor/*` | CRUD on own courses + content, grade submissions, host live classes |
| `course_registrar` | `/course-registrar/*` | CRUD on any course, approve/reject, manage enrollments |
| `registrar` | `/registrar/*` | User management, audit logs, reports |
| `finance` | `/finance/*` | Read transactions, payouts, scholarships |
| `admin` | `/admin/*` | Everything above + role assignment + dev endpoints |

---

## What's still NOT production-ready (next pushes)

- **Strict TypeScript.** `next.config.ts` has `ignoreBuildErrors: true`. The new code typechecks clean — the legacy pages have ~100+ unresolved errors. Turning on strict mode is a separate cleanup pass.
- **Saved cards.** Settings → Billing currently directs users to per-course Paystack checkout. To support saved cards, integrate Paystack's `charge_authorization` API and persist `authorization_code`.
- **Presence.** Online/offline indicators are hard-coded to `false`. Add later with Firestore presence or a websocket service.
- **Full responsive QA.** Tailwind responsive utilities are in place across the app; no manual browser audit has been done on every screen yet.
- **CI.** No GitHub Actions yet. At minimum: `npm run typecheck && npm run test` on every PR.
