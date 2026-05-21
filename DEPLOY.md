# Deploying to Vercel

This is the end-to-end checklist for getting the app live. Allow ~45 minutes for the first deploy (most of it is creating accounts).

---

## 1. Push the code to GitHub

```bash
git add .
git commit -m "Production-ready snapshot"
git push origin master
```

(If you haven't set up the remote yet: create an empty repo on GitHub, then `git remote add origin <url> && git push -u origin master`.)

---

## 2. Create the third-party accounts

These all have free tiers — you don't need to pay anything to test.

| # | Service | Sign up at | What you need from the dashboard |
|---|---|---|---|
| 1 | MongoDB Atlas | https://cloud.mongodb.com | • Create an M0 (free) cluster.<br>• Database Access → add a user with password.<br>• Network Access → add `0.0.0.0/0` (allow from anywhere) for now.<br>• Database → Connect → "Drivers" → copy the connection string for `MONGODB_URI`. |
| 2 | Firebase | https://console.firebase.google.com | • Create a project.<br>• Build → Authentication → Sign-in methods → enable **Email/Password** and **Google**.<br>• Build → Storage → Get Started → Production mode.<br>• Project Settings → General → Your apps → add a **Web app**, copy the `firebaseConfig` snippet (the 6 `NEXT_PUBLIC_FIREBASE_*` values).<br>• Project Settings → **Service Accounts** → Generate new private key → save the JSON. Copy `project_id`, `client_email`, `private_key` from it. |
| 3 | LiveKit Cloud | https://cloud.livekit.io | • Create a project.<br>• Settings → Keys → create a key pair.<br>• Copy `API Key`, `API Secret`, and the `wss://...livekit.cloud` URL. |
| 4 | Paystack | https://dashboard.paystack.com | • Sign up.<br>• Settings → API Keys & Webhooks → copy **Test Secret Key** and **Test Public Key**. (Switch to live keys later when you go live.) |
| 5 | Resend | https://resend.com | • Sign up.<br>• API Keys → Create API Key → copy into `RESEND_API_KEY`.<br>• `EMAIL_FROM` defaults to `onboarding@resend.dev` (works immediately, no domain setup needed). Add your own domain later for branded mail. |
| 6 | *(optional)* Upstash Redis | https://console.upstash.com | Free DB, copy REST URL + token. |
| 7 | *(optional)* Sentry | https://sentry.io | Create a Next.js project, copy DSN. |

---

## 3. Import the repo into Vercel

1. https://vercel.com/new → import your GitHub repo.
2. Framework Preset: **Next.js** (auto-detected).
3. Root Directory: `.` (the repo root).
4. Build & Output Settings: leave defaults (`npm run build`, `.next`).
5. **Before clicking Deploy**, expand **Environment Variables** and add every value from your filled `.env.sample`. (See list below.)
6. Click **Deploy**. First deploy takes ~3-5 minutes.

### Environment variables to add in Vercel

Copy these names from `.env.sample`, set them all under **Production** (and **Preview** if you want preview URLs to work):

**Required:**
- `NEXT_PUBLIC_APP_URL` — set this to your eventual Vercel URL. After the first deploy you can copy the URL from Vercel and update this var, then redeploy.
- `MONGODB_URI`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_PROJECT_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY` — paste with the literal `\n` sequences preserved. Vercel handles multi-line values; you can also paste the full PEM and it'll just work.
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_WS_URL`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

**Optional:**
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
- `ALLOW_DEV_ENDPOINTS=true` *(set to enable `/api/seed` in production — leave unset on real production)*

---

## 4. Wire the webhooks

After Vercel finishes the first deploy and you have a live URL like `https://ashford-gray.vercel.app`:

1. Update the `NEXT_PUBLIC_APP_URL` env var in Vercel to that URL, then redeploy (or it'll happen automatically on next push).
2. In **Paystack** → Settings → API Keys & Webhooks → set webhook URL to:
   ```
   https://<your-vercel-url>/api/payments/webhook
   ```
3. In **LiveKit Cloud** → Project Settings → Webhooks → set webhook URL to:
   ```
   https://<your-vercel-url>/api/livekit/webhook
   ```
4. In **Firebase Console** → Authentication → Settings → **Authorized domains** → add your Vercel URL hostname. Without this, Google sign-in pops up an "unauthorized-domain" error.

---

## 5. Provision the staff accounts (one-time)

There's no hardcoded admin in the bundle (that would be a backdoor). Use the dev-only bootstrap endpoint to create the four staff accounts in one shot.

### Prerequisite

Set `ALLOW_DEV_ENDPOINTS=true` in Vercel env vars and redeploy (otherwise the route returns 404 in production). **Remove this var after you've finished bootstrapping** — it also enables `/api/seed`, `/api/instructor-repair`, and `/api/test-mail`.

### Run it

From any terminal (or Postman, or your browser dev-tools), hit:

```bash
curl -X POST https://<your-vercel-url>/api/dev/bootstrap-staff \
  -H "Content-Type: application/json" \
  -d '{"emailDomain": "ashfordgray.dev", "password": "AcademyTest2026!"}'
```

Both fields are optional — defaults are `emailDomain: "ashfordgray.dev"` and `password: "AcademyTest2026!"`.

Response:

```json
{
  "message": "Staff accounts ready. Sign in at /login with any of the credentials below.",
  "credentials": [
    { "role": "admin",            "email": "admin@ashfordgray.dev",            "password": "AcademyTest2026!", "portal": "/admin",            "created": true },
    { "role": "registrar",        "email": "registrar@ashfordgray.dev",        "password": "AcademyTest2026!", "portal": "/registrar",        "created": true },
    { "role": "course_registrar", "email": "course-registrar@ashfordgray.dev", "password": "AcademyTest2026!", "portal": "/course-registrar", "created": true },
    { "role": "finance",          "email": "finance@ashfordgray.dev",          "password": "AcademyTest2026!", "portal": "/finance",          "created": true }
  ]
}
```

The endpoint is **idempotent** — running it twice with the same domain is safe. It reuses existing Firebase Auth users and only repairs Mongo profile drift. If you re-run with a different password, **the new password is not applied to existing Firebase users** (Firebase Admin SDK needs a separate `updateUser` call); sign in with whatever password you used the first time.

### After bootstrap

1. Sign in at `https://<your-vercel-url>/login` with any of the four credentials.
2. **Important:** Unset `ALLOW_DEV_ENDPOINTS` in Vercel env vars and redeploy. This locks down the dev endpoints again.

### Manual fallback

If the endpoint won't run (e.g. Firebase Admin SDK misconfigured), the long way is to sign up four times with different emails (signup will create them all as students — that's the new policy) and then in MongoDB Atlas → `users` collection, edit each user's `role` to one of `admin`, `registrar`, `course_registrar`, `finance`.

### Wiping users (clean-slate testing)

After playing around with multiple accounts, reset everything in one command:

```bash
curl -X POST https://<your-vercel-url>/api/dev/wipe-users \
  -H "Content-Type: application/json" \
  -d '{"confirm": "WIPE_ALL_USERS"}'
```

The `confirm` literal is required so nothing accidentally triggers a wipe. To preserve specific accounts (e.g. an admin you've already verified), pass `preserveUids`:

```bash
curl -X POST https://<your-vercel-url>/api/dev/wipe-users \
  -H "Content-Type: application/json" \
  -d '{"confirm": "WIPE_ALL_USERS", "preserveUids": ["firebase-uid-1"]}'
```

The endpoint deletes from both Firebase Auth (paginated, 1000 at a time) and the Mongo `users` collection. Same `ALLOW_DEV_ENDPOINTS` gate as the other dev routes — disabled in production by default.

### Signup policy (production)

Public signup at `/login?view=signup` creates **student accounts only**. Instructors, registrars, course registrars, and finance staff are all created by an admin via `/admin/users → Add User`. The server enforces this — a hand-crafted POST to `/api/users` claiming `role: "instructor"` is rejected with 403.

---

## 6. Seed sample courses (optional)

While signed in as that admin, hit:
```
https://<your-vercel-url>/api/seed
```
(Note: requires `ALLOW_DEV_ENDPOINTS=true` to be set in Vercel env vars if you want this on the live production deploy. On staging it's safer to keep it on; on real production keep it off.)

This wipes the database and reseeds with the curated Ashford & Gray course catalog from `src/lib/data.ts`.

---

## 7. End-to-end smoke test

Sign out, then test as a normal student:

| Step | Expected |
|---|---|
| Sign up as a new student | Auto-redirect to `/dashboard` |
| Browse `/courses` | See seeded courses |
| Click Enroll on a paid course | Redirected to Paystack checkout |
| Pay with Paystack test card `4084 0840 8408 4081`, expiry `12/30`, CVV `408`, OTP `123456` | Redirected to `/payments/callback` showing "Payment confirmed" |
| Click "Open your course" | Land in `/my-courses/<id>` |
| Sign in as the instructor of that course | `/instructor` shows the course |
| Instructor opens the course's live class room | Should join successfully |
| Sign in as a student NOT enrolled in that course | `/meeting/course-<otherCourseId>` → "You must be enrolled" |

If any step fails, the Vercel logs (`vercel logs <deployment-url>`) will show the exact error.

---

## 8. Going from test mode to live (when you're ready to take real money)

1. Complete Paystack KYC verification (business documents).
2. Replace `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` with the `sk_live_…` and `pk_live_…` keys.
3. Update the Paystack webhook URL — it's set per-environment (live mode has its own webhook config).
4. Redeploy.

---

## Common deploy issues + fixes

| Symptom | Cause | Fix |
|---|---|---|
| "User profile not found" right after sign-up | Mongo write failed silently | Check MongoDB Atlas IP allowlist; verify `MONGODB_URI` |
| Google sign-in popup says "auth/unauthorized-domain" | Vercel domain not authorized | Firebase Console → Auth → Settings → Authorized domains → add it |
| Paystack webhook returns 401 in logs | Wrong secret key or signature mismatch | Verify `PAYSTACK_SECRET_KEY` is the same key whose webhook URL is configured |
| LiveKit "failed to issue token" | Wrong API key/secret or WS URL | Double-check the three `LIVEKIT_*` env vars |
| Storage upload fails with CORS error | Firebase Storage rules block writes | We use signed URLs server-side, so the bucket only needs `allow read: if true` on `uploads/**` |
| Build fails on Vercel | Almost always a missing env var | Vercel shows which var is undefined; add it and redeploy |
