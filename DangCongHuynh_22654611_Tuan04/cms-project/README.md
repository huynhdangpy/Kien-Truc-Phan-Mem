# CMS Project (Layered Architecture + Microkernel)

This project is a simple CMS implementation with:

- Layered architecture:
  - Frontend: React + Vite + TailwindCSS + React Router
  - Backend API: Node.js + Express REST API
  - Data layer: JSON Server with `db.json`
- Microkernel backend structure:
  - CMS Core
  - Plugin Manager
  - Plugins: Comment, SEO, Media

## Project Structure

```text
cms-project/
  frontend/
  backend/
  db.json
```

## Required Ports

- Frontend: `5173`
- Backend API: `5000`
- JSON Server: `3001`

## Install

```bash
cd cms-project
npm run install:all
```

## Run All Services

```bash
npm run dev
```

## Run Separately (optional)

```bash
npm run db
npm run backend
npm run frontend
```

## Main API Endpoints

- `GET /posts`
- `GET /posts/:id`
- `POST /posts` (admin only, header `x-role: admin`)
- `PUT /posts/:id` (admin only, header `x-role: admin`)
- `DELETE /posts/:id` (admin only, header `x-role: admin`)

## Frontend Pages

- `/` Home page (list posts)
- `/posts/:id` Post detail page
- `/admin` Admin dashboard
- `/admin/create` Create post
- `/admin/edit/:id` Edit post

## Notes

- Use the role selector in the top navbar:
  - `User` can only view posts
  - `Admin` can access admin dashboard and CRUD actions
- Backend plugin list is visible in the admin dashboard.
