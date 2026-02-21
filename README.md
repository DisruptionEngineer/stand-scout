# Stand Scout 🌿

**Discover roadside gems near you.**

Stand Scout is a free, community-powered discovery platform that maps every roadside stand, farm stand, and home-based seller in rural areas. It turns a boring commute or road trip into a treasure hunt.

## Features

- **Interactive Map** — Full-screen map powered by Leaflet + OpenStreetMap with colored availability markers
- **Browse & Search** — Filter by category, search products, sort by rating/newest/name
- **Stand Profiles** — Detailed pages with availability status, products, reviews, QR codes, and directions
- **Add a Stand** — Free, 2-minute onboarding form with auto-generated QR code flyer
- **Availability System** — Three-layer model: SMS toggle, QR community reporting, and scheduled defaults
- **Favorites** — Save stands locally (persisted to localStorage)
- **Mobile-First** — Responsive design optimized for phones and rural internet

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router v7
- Leaflet + react-leaflet (OpenStreetMap)
- Lucide React icons
- qrcode.react for QR generation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── components/       # Shared UI components
├── context/          # React context providers
├── data/             # TypeScript types + mock data
└── pages/            # Route pages
```

## Mock Data

The app ships with 18 realistic mock stands set in the Shenandoah Valley region of Virginia, plus 20 reviews. These demonstrate the full range of stand types: honey, produce, eggs, baked goods, flowers, crafts, dairy, meat, preserves, firewood, and more.

## Core Principle

**Always free for stand owners.** No tiers, no paywalls, no premium features that gate basic functionality.
