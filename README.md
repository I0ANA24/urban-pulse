# UrbanPulse — Neighborhood Community Platform

> FIICode Web & Mobile Challenge 2026

UrbanPulse is a full-stack web application that transforms passive neighbors into an active, resilient support network. Residents can share resources, request help, coordinate during emergencies, and report lost pets — all in real time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | ASP.NET Core, C# |
| Database | PostgreSQL |
| Real-time | SignalR (WebSockets) |
| Maps | Mapbox GL JS |
| Weather | OpenWeatherMap API |
| Rich Text | Tiptap |

---

## Features

### Neighborhood Dashboard
- Live feed of community **Pulses** — Emergency, Skill, Lend, and General posts
- **Real-time updates** via SignalR — new posts appear without page refresh
- Filter feed by post type and distance radius
- Automatic **Safety Check-in** banner and emergency chat channel when severe weather is detected (OpenWeatherMap)

### Interactive Map
- Mapbox-powered map showing neighbors and active events
- Color-coded markers: skills (gold), tools (blue), both (orange), emergencies (red pulsing)
- Filter between available neighbors and active requests
- Adjustable search radius

### Skill & Resource Library
- Users list skills they can offer and tools available to lend
- Dynamic **Trust Score** calculated from community feedback after successful interactions
- **Verified Neighbor** badge for high-trust users

### Smart Request Matching
- **Hero Alerts** — when a need matches a neighbor's listed skills, that neighbor is notified directly
- Distance-based filtering using the Haversine formula
- **Quiet Hours** and distance limit preferences per user

### Messaging
- Private 1-on-1 conversations with real-time delivery
- Global neighborhood chat
- Emergency severity chat (auto-activated during severe weather)
- Shareable contact info card inside conversations

### Pets — AI Guardian
- Post lost or found pets with photos
- Backend AI matches found pet images against the lost pet database
- Match results displayed with a **similarity confidence score**

### Verification & Moderation
- JWT-based authentication with role separation (User / Admin)
- Community upvoting auto-verifies emergency posts at a threshold
- Users can report posts and other users
- Rate neighbors after interactions (skills confirmed per session)

### Admin Dashboard
- Overview stats: new users, new posts, flagged content counts
- Task queues: flagged content, flagged users, duplicate merges
- Ban / unban users, manage roles
- Role-based access control on all sensitive endpoints

---

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- PostgreSQL

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your API keys
npm run dev
```

Required environment variables:

```
NEXT_PUBLIC_API_URL=process.env.NEXT_PUBLIC_API_URL
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_key
```

### Backend

See the backend repository for setup instructions.

---

## Team FullStack Fusion

| Name | Role |
|---|---|
| Ioana Franț | Frontend — Next.js, TypeScript, Tailwind CSS |
| Bianca-Maria Sandovici | UX & Design — Figma |
| Denis-Răzvan Antoci | Backend — ASP.NET Core, PostgreSQL |
