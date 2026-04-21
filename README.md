# MERA Solutions — HR Onboarding Feedback App

Internal tool for tracking new-hire onboarding feedback across four departments (RRHH, Operaciones, Calidad, Capacitación).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Auth + DB | Supabase |
| Hosting | Vercel |

---

## User Credentials

| Email | Password | Role | Access |
|---|---|---|---|
| admin@mera.com | Admin2025! | admin | Dashboard, all feedback, new hires, CSV export |
| rrhh@mera.com | RRHH2025! | rrhh | RRHH feedback forms only |
| operaciones@mera.com | Ops2025! | operaciones | Operaciones feedback forms only |
| calidad@mera.com | Calidad2025! | calidad | Calidad feedback forms only |
| capacitacion@mera.com | Cap2025! | capacitacion | Capacitación feedback forms only |

---

## Setup Guide

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Wait for the project to finish provisioning (~1 min).
3. Note your **Project URL** and **anon public key** from:
   - Dashboard → Settings → API

### 2. Run Database Migrations

In your Supabase project, open the **SQL Editor** and run the following files **in order**:

```
supabase/migrations/20240101000000_create_tables.sql
supabase/migrations/20240101000001_rls_policies.sql
supabase/migrations/20240101000002_seed_users.sql
```

> **Tip:** Paste each file's contents and click "Run". Verify no errors appear.

After running the migrations:
- The `new_hires` and `feedback_entries` tables will exist with RLS enabled.
- 5 users will be created in Supabase Auth with their respective roles stored in `user_metadata`.

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

#### Option A: Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Option B: Vercel Dashboard

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo.
3. Add the two environment variables in the "Environment Variables" section.
4. Click **Deploy**.

---

## How to Add a New Hire

1. Log in as `admin@mera.com`.
2. Click **Nuevo Ingreso** in the navigation.
3. Fill in: full name, DNI, entry date, position, and site (Olivos / Parque Patricios).
4. Click **Registrar ingresante**.

This automatically creates four `feedback_entries` rows (one per area, status `pendiente`) via a database trigger. Area users will immediately see the new hire in their feedback list.

---

## How Area Users Submit Feedback

1. Log in with the area's credentials (e.g., `rrhh@mera.com`).
2. The feedback list shows all new hires with `Pendiente` status.
3. Click on a new hire to open the feedback form.
4. Fill in all fields and click **Enviar feedback**.
5. The entry is saved as `completado`. Users can return and edit at any time.

---

## Admin Dashboard

- Shows a table with all new hires and color-coded status dots per area:
  - 🟢 Green = Completado
  - 🟡 Yellow = Pendiente
  - ⚫ Gray = Sin iniciar
- Click any new hire row to see all four areas' full feedback.
- **Exportar CSV** button downloads all data (or a single hire's data from the detail page).

---

## Database Schema

### `new_hires`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| full_name | text | |
| dni | text | |
| entry_date | date | |
| position | text | |
| site | text | `Olivos` or `Parque Patricios` |
| created_at | timestamptz | |
| created_by | uuid | FK → auth.users |

### `feedback_entries`
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| new_hire_id | uuid | FK → new_hires |
| area | text | `rrhh`, `operaciones`, `calidad`, `capacitacion` |
| submitted_by | uuid | FK → auth.users |
| submitted_at | timestamptz | |
| score_overall | int | 1–5 |
| feedback_fields | jsonb | Area-specific JSON fields |
| observations | text | |
| status | text | `pendiente` or `completado` |

---

## Security

- All routes are protected by Next.js middleware (unauthenticated users → `/login`).
- Row Level Security (RLS) is enabled on both tables:
  - `new_hires`: all authenticated users can read; only admin can write.
  - `feedback_entries`: admin reads all; area users read/write only their area.
- Roles are stored in Supabase Auth `user_metadata` and checked via `get_my_role()` SQL function.

---

## Design Decisions

- **Upsert over update**: The client uses `upsert` with `onConflict: 'new_hire_id,area'` so that if a trigger-created pending entry exists it gets updated, otherwise a new row is inserted.
- **Score overall**: Each form has an explicit 1–5 star overall rating independent of individual field scores, giving supervisors full control.
- **Edit after submit**: Area users can re-open and edit completed feedback at any time. The status remains `completado`.
- **No pagination**: The current data volume (new hires per onboarding cycle) does not warrant pagination. Add it if the table exceeds ~500 rows.
- **CSV BOM**: The export prepends a UTF-8 BOM so Excel on Windows displays Spanish characters (ñ, á, etc.) correctly.
