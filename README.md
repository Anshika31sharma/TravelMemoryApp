# Travel Memory Map

A production-grade web app where users visually relive their trips on an interactive map.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + Leaflet
- **Backend:** Node.js + Express.js
- **Database:** MySQL + Prisma ORM
- **Auth:** JWT
- **Map:** Leaflet.js (OpenStreetMap)
- **Images:** Local storage

## Quick Start

### Prerequisites

- Node.js 18+
- MySQL 8+

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE travel_memory_map;
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/travel_memory_map"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=5000
UPLOAD_DIR=./uploads
```

Install and run:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

API runs at **http://localhost:5000**

### 3. Frontend Setup

```bash
# From project root
npm install
```

Create `.env.local` (optional, defaults work for local dev):

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

App runs at **http://localhost:3000**

## Project Structure

```
TravelMemoryMap/
├── app/                    # Next.js App Router
│   ├── login/
│   ├── signup/
│   ├── map/               # Main map view
│   ├── add-trip/
│   └── trip/[id]/         # Trip details
├── components/
├── lib/                   # API client, auth context
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── prisma/
│   └── uploads/
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user (auth) |
| GET | /api/trips | List trips (query: tag, search) |
| GET | /api/trips/:id | Get trip |
| POST | /api/trips | Create trip |
| PUT | /api/trips/:id | Update trip |
| DELETE | /api/trips/:id | Delete trip |
| GET | /api/trips/:id/days | List trip days |
| POST | /api/trips/:id/days | Add day |
| PUT | /api/trips/:id/days/:dayId | Update day |
| DELETE | /api/trips/:id/days/:dayId | Delete day |
| GET | /api/trips/:id/photos | List photos |
| POST | /api/trips/:id/photos | Upload photos |
| PUT | /api/trips/:id/photos/:photoId | Update photo |
| DELETE | /api/trips/:id/photos/:photoId | Delete photo |
| GET | /api/tags | List tags |

## Features

- **Auth:** Signup, login, JWT-protected routes
- **Map:** Full-screen world map with trip pins
- **Trips:** Add trips with country, city, dates, coordinates, expense, tags
- **Trip details:** Photo gallery, day-wise timeline, expense summary, tags
- **Filters:** By tag, search by city/country
