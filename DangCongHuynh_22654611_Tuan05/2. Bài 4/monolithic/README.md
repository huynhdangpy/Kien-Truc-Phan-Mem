# Monolithic Architecture

## Stack

- React + Vite + Tailwind (client)
- Node.js + Express + MongoDB (server)
- Docker Compose

## Features

- JWT auth: register/login
- User profile
- Product CRUD (admin only)
- Cart add/update/remove
- Place order and order history

## Run with Docker

1. Copy server env:
   - cp server/.env.example server/.env
2. Optional Atlas:
   - Set MONGO_URI in system env before running compose
3. Start:
   - docker compose up --build
4. Open:
   - Client: http://localhost:5173
   - API health: http://localhost:5000/api/health

## Local run without Docker

### Server

- cd server
- npm install
- npm run dev

### Client

- cd client
- npm install
- npm run dev

## Notes

- Product create/update/delete routes require role=admin.
- You can manually set a user role to admin in MongoDB for testing.
