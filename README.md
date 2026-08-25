# GHS Khanpur — Staff Attendance Portal

![GHS Khanpur Admin Panel](https://github.com/user-attachments/assets/58eb4346-38bb-4f3d-96c3-d29d6de0d1dc)

A modern teacher attendance management system for **Govt High School Khanpur, Haripur, KPK**.

Built with React + Vite + Supabase.

---

## Features

- **Dashboard** — live attendance rate, weekly trend chart, staff status, school map
- **Teacher Registry** — add, edit, delete teachers with search functionality
- **Daily Attendance** — mark Present / Absent / Late per teacher, navigate by date
- **Reports** — full attendance history, filter by name & date, export to CSV with advanced filtering
- **Attendance Requests** — teachers submit self check-in requests; principal approves/rejects
- **Teacher Check-In Page** — public page at `/checkin`, no login required
- **Auth** — Supabase email/password login protects the admin panel
- **Mobile Responsive** — fully responsive design optimized for mobile devices
- **Search & Filter** — advanced search bars and filtering across all major sections

---

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 19, Vite 8            |
| Routing  | React Router v7             |
| Backend  | Supabase (Postgres + Auth)  |
| Icons    | Lucide React                |
| Hosting  | Vercel                      |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/ghs-khanpur.git
cd ghs-khanpur
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Set up the database

Run `supabase_schema.sql` in your **Supabase Dashboard → SQL Editor**.

This creates:
- `teachers` table
- `attendance` table
- `attendance_requests` table
- Indexes, RLS policies, triggers

### 4. Create the principal account

In **Supabase Dashboard → Authentication → Users → Add user**:

- Email: `touseefghs@gmail.com`
- Password: `GHS@Khanpur2024` (or your chosen secure password)

**Login Credentials:**
- Email: `touseefghs@gmail.com`
- Password: (as set in Supabase)

### 5. Seed demo data (optional)

```bash
npm run seed
```

Inserts 50 teachers with today's attendance: 20 Present, 20 Absent, 10 Late.

### 6. Run locally

```bash
npm run dev
```

---

## Deployment on Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

The `vercel.json` file handles SPA routing (all paths → `index.html`).

---

## URL Structure

| URL         | Access  | Description                        |
|-------------|---------|------------------------------------|
| `/`         | Private | Dashboard (requires login)         |
| `/teachers` | Private | Teacher management                 |
| `/attendance` | Private | Daily attendance marking         |
| `/reports`  | Private | Reports & CSV export               |
| `/requests` | Private | Approve/reject check-in requests   |
| `/login`    | Public  | Principal login                    |
| `/checkin`  | Public  | Teacher self check-in form         |

---

## School Info

**Govt High School Khanpur**
RW37+HH9, Khanpur, Haripur 22620, KPK, Pakistan
Phone: (0995) 640230 · Hours: 8:15 am – 2:00 pm

---

## Database Configuration

### Supabase Schema
The project uses Supabase as the backend with the following tables:
- `teachers` — stores teacher information (name, subject, phone, avatar)
- `attendance` — daily attendance records with status (Present/Absent/Late)
- `attendance_requests` — teacher self check-in requests for approval

### Seed Data
Run the seed script to populate the database with demo data:
```bash
npm run seed
```
This creates 50 teachers with attendance records for today (20 Present, 20 Absent, 10 Late).

---

## Development Notes

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the development server

### Current Configuration
- Supabase URL: `https://vmmmvjbctdqhxtlqieaa.supabase.co`
- Admin Email: `touseefghs@gmail.com`
- Password: Set in Supabase Dashboard (Authentication → Users)

---

## Recent Updates
- Added filter and search bars across all major sections
- Updated report logic with enhanced filtering
- Mobile-responsive design improvements
- Enhanced teacher check-in workflow
