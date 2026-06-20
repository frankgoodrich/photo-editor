# Photo Editor

A web-based photo editing app with client-side filters/adjustments and server-side processing via Sharp.

## Tech Stack

- **Client:** React, Vite
- **Server:** Express, Mongoose, Sharp
- **Database:** MongoDB

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance

### Setup

```bash
# Server
cd server
npm install
cp .env.example .env   # configure MONGODB_URI
npm run dev

# Client (separate terminal)
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5174` and proxies `/api` to the server on port `3003`.

## Features

- Upload images and apply brightness, contrast, saturation, and blur
- One-click filters: grayscale, sepia, invert, hue rotate
- Zoom in/out
- Download edited image
- Server-side processing pipeline using Sharp
- Project save/load via MongoDB
