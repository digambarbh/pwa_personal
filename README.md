# Placement Tracker — React + Express + MongoDB

Full-stack placement prep tracker. React (multipage, mobile-first) + Express +
MongoDB Atlas. Progress and streak are stored in the database, so they're the
same across every device you open this on.

## Structure
```
placement-tracker/
├── server/   Express API + MongoDB (Mongoose)
└── client/   React app (Vite + React Router)
```

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` — it has two connection string options:

**Option A (default, try first):**
```
MONGODB_URI=mongodb+srv://stayease:YOUR_REAL_PASSWORD@cluster0.kguu8fx.mongodb.net/placement-tracker?retryWrites=true&w=majority
```
Replace `YOUR_REAL_PASSWORD` with your real Atlas password.

**If Option A gives `querySrv ETIMEOUT`** (common on college/hostel WiFi that blocks
SRV DNS lookups): comment out the Option A line and uncomment Option B instead. Get
that exact string from Atlas: **Database → Connect → Drivers → scroll down → "Or
Standard connection string"** link (below the srv:// one shown by default). Copy
it exactly — don't hand-type the shard hostnames.

Also check while you're in Atlas:
- **Network Access** → your current IP is allowed (or `0.0.0.0/0` while testing)
- Cluster shows **Active**, not paused (free-tier clusters auto-pause when idle)

Seed the 60 tasks into the database (one-time):
```bash
npm run seed
```
You should see `Seed complete. 60 task documents in collection.` If it fails, the
error message tells you exactly what to check.

Start the API:
```bash
npm run dev
```
Runs on `http://localhost:5000`. You should see `MongoDB connected`.

## 2. Frontend setup

New terminal:
```bash
cd client
npm install
npm run dev
```
Runs on `http://localhost:5173`, proxies `/api` calls to the backend automatically
(see `vite.config.js`) — no extra config needed for local dev.

To test the mobile layout on your phone: same WiFi network, open
`http://<your-computer's-local-IP>:5173` instead of localhost.

## 3. Pages

- `/` — Dashboard: daily quote, overall progress, phase-progress chart, streak, focus timer widget, "next up" task
- `/roadmap` — all 4 phases
- `/roadmap/:phaseId` — weekly tasks for that phase, checkable
- `/companies` — track applications: company, role, status pipeline (applied → OA → interview → offer/rejected), notes
- `/scores` — log aptitude/DSA/mock-interview/GD scores over time, running averages per type
- `/timer` — focus/study timer (25/50/90 min presets), logs every session to the database
- `/journey` — full analytics: streak heatmap, phase-completion chart, 14-day study time chart, mock score trend chart
- `/settings` — reset all progress

## New in this version

- **Daily motivational quote** on the dashboard — rotates automatically once per day (deterministic by date, no extra API calls).
- **Focus Timer** (`/timer`) — pick 25/50/90 min, start/pause/stop, logs every completed session to MongoDB. Dashboard shows a quick-access card with your all-time total.
- **Journey page** (`/journey`) — visual charts (via Recharts): phase completion, daily study time, mock score trend — plus the streak heatmap that used to live at `/streak`.
- **Charts on Dashboard** — a phase-by-phase progress bar chart right at the top, so opening the app shows your overall picture immediately, no clicking required.

## 4. Deploying later (optional)

- Backend: Render/Railway — set `MONGODB_URI` and `CLIENT_ORIGIN` (deployed
  frontend URL) as environment variables there.
- Frontend: Vercel/Netlify — set `VITE_API_URL` to your deployed backend URL + `/api`.

## Security note

The database password lives only in `server/.env` (gitignored), never hardcoded
in source files, never pushed to GitHub — same rule as StayEase's JWT secret.
