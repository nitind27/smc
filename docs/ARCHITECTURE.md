# SMC — Smart Municipal Complaint & Meeting Control

## Architecture Overview

- **Frontend:** Next.js 14 (React), Tailwind CSS, Framer Motion
- **Backend:** Next.js API Routes (Node.js)
- **Database:** MySQL via Prisma ORM
- **Auth:** JWT (session) + OTP for guest complaint submission

---

## Route Structure

### Public (no login)

| Path | Description |
|------|-------------|
| `/` | Homepage — animated stats, hero, CTAs |
| `/track` | Complaint search by ID, status (Pending / In Progress / Meeting Scheduled / Completed) |
| `/transparency` | Public dashboard — area stats, department performance, recent activity |
| `/meetings` | Public meetings (read-only), work progress, approval status |
| `/raise-complaint` | Quick complaint without login — OTP verification, title, description, location, image upload |
| `/notices` | Notices & announcements |

### Authenticated (login required)

| Path | Description |
|------|-------------|
| `/login` | Login (email + password) |
| `/dashboard` | Role-based dashboard (Admin / Dept Head / Staff / Auditor / User) |
| `/complaints` | List, submit, track; timeline view |
| `/complaints/[id]` | Detail, edit, attachments, timeline |
| `/meetings` | Assigned meetings, history, discussions (no next meeting until work completed) |
| `/bills`, `/bills/approvals` | Billing & payment tracking |
| `/notifications` | Real-time alerts |
| `/reports` | Personal analytics, completion rate |
| `/staff`, `/departments`, `/audit` | Admin/auditor only |

---

## Data Models (extensions)

- **Notice** — title, body, type, publishedAt (Prisma model added)
- **OtpVerification** — phoneOrEmail, otp, expiresAt (Prisma model added)
- **Complaint** — submittedBy can be guest email/phone for OTP-raised complaints
- **ComplaintAttachment** — used for image uploads on raise-complaint

After pulling schema changes, run: `npx prisma generate` and `npx prisma db push` (or migrate).

---

## Workflow Rules

- **Meetings:** System does not allow scheduling the next meeting for a complaint until current work is completed (status check).
- **Complaint lifecycle:** Submitted → Assigned → In Progress → Meeting Scheduled (optional) → Completed → Feedback.

---

## UI Layers

- **Public layout:** Header (logo, Track, Transparency, Meetings, Raise Complaint, Notices, Login), footer, no sidebar.
- **Dashboard layout:** Sidebar (collapsible), command bar, role-based nav; dark/light theme.
- **Mobile-first,** responsive, Framer Motion for transitions and number animations.
