# Azur Plage — Front Desk Dashboard

A front-desk management app built for **Club de Vacance Azur Plage**: staff auth, room status board,
booking creation with double-booking prevention, and a daily arrivals/departures dashboard.

**Stack:** React (Vite) + Node/Express + PostgreSQL

## Setup

### 1. Database
```bash
createdb hotel_dashboard
psql hotel_dashboard < backend/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev            # starts on http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

Register your first staff account via `POST /api/auth/register`, then log in from the UI.

## What's implemented
- JWT auth with roles (`receptionist` / `admin`)
- Room CRUD + status (available / occupied / maintenance)
- Booking creation with conflict detection (no double-booking a room for overlapping dates)
- Check-in / check-out flow that syncs room status automatically
- Daily dashboard endpoint: arrivals, departures, occupancy rate

## Natural next steps (v2 ideas)
- Calendar view of bookings per room
- Pricing + basic invoicing
- Guest search/history
- Email notifications on booking confirmation
