# SMC — Smart Municipal Complaint & Meeting Control System

Enterprise-grade SaaS UI for government workflow management: complaints, projects, meetings, tasks, bills, payments, departments, staff, notifications, and reports.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, shadcn/ui (Radix)
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

- **Role-based dashboards:** Admin, Department Head, Staff, Auditor, Public (citizen)
- **Modules:** Citizen complaints, work/projects, meetings & discussions, task Kanban, bill submission & approval, payments, departments & staff, notifications, reports & analytics, audit trail
- **UI:** Collapsible sidebar, command bar with global search and notifications, dark/light theme, glassmorphism, responsive layout
- **Components:** Data tables, Kanban board, timeline, progress indicators, approval badges, document upload placeholders, analytics charts

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll be redirected to `/dashboard`. Use the **avatar menu (top right)** to switch roles and see different dashboards and nav items.

## Project structure

```
src/
  app/              # App Router pages and API routes
  components/        # UI and layout components
    ui/              # shadcn-style primitives
    layout/          # Sidebar, CommandBar
    dashboard/       # Role-specific dashboard views
  config/            # Navigation and app config
  hooks/             # Reusable hooks
  providers/         # Theme, Auth
  services/api/      # API client and domain APIs
  types/             # Shared TypeScript types
```

## Environment

Optional: set `NEXT_PUBLIC_API_URL` if the backend is hosted elsewhere (default: `/api`).

## License

MIT
