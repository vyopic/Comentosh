# Comentosh Cloudflare Workers & D1 Database Setup Guide

This guide describes how the Comentosh Social Networking platform connects to Cloudflare Workers and Cloudflare D1 SQLite database.

---

## 1. Database Architecture & Schema

Comentosh uses **Cloudflare D1 (SQLite)** with binding name: **`DB`**.

### Database Tables:
- `users`: User profiles, phone numbers, password hashes, and thinker stats.
- `posts`: Discussions started by thinkers with topics, images, views, and shares.
- `comments`: Root comments and nested reply perspectives (`parent_id`).
- `comment_likes`: Upvotes on perspectives (unique per thinker per comment).
- `follows`: Social graph connections between thinkers.
- `notifications`: Alerts for comment replies, upvotes, and mentions.
- `sessions`: Secure 30-day authentication sessions with tokens.
- `shares`: Audit logs for discussion and perspective shares.
- `saved_posts`: Bookmarked discussions.

All tables are defined in:
- `schema.sql` (Root SQL schema for manual execution or migration)
- `migrations/0001_initial_schema.sql` (Wrangler automated migrations)

---

## 2. Setting Up Cloudflare D1

### Option A: Via Cloudflare Dashboard (No Terminal Required)
1. Go to **Cloudflare Dashboard** -> **Workers & Pages** -> **D1 SQL Database**.
2. Click **Create Database** -> Name it: `comentosh-db`.
3. Open the database and click on the **Console** tab.
4. Copy and paste the contents of `schema.sql` into the Console and click **Execute**.
5. Go to your **Comentosh** Pages project -> **Settings** -> **Functions** -> **D1 Database Bindings**.
6. Click **Add binding**:
   - **Variable name**: `DB`
   - **D1 database**: Select `comentosh-db`
7. Click **Save**.

### Option B: Via Wrangler CLI
```bash
# 1. Create the D1 Database
npx wrangler d1 create comentosh-db

# 2. Execute schema migration
npx wrangler d1 execute comentosh-db --remote --file=./schema.sql
```

---

## 3. Backend REST API Endpoints

All API requests are routed through `/api/*` to the unified Cloudflare Worker handler (`functions/api/[[path]].ts` and `src/server/router.ts`).

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Register user with phone number, username, password.
- `POST /api/auth/login`: Authenticate with phone/username and password.
- `POST /api/auth/logout`: Destroy session and clear HttpOnly cookie.
- `GET /api/auth/me`: Get currently authenticated thinker profile.

### Discussions (`/api/posts`)
- `GET /api/posts`: Get discussions with comments count, views, and top comment spotlight.
- `POST /api/posts`: Create a new discussion (auth required).
- `GET /api/posts/:id`: Get single discussion details and increment views.
- `PUT /api/posts/:id`: Edit discussion (author only).
- `DELETE /api/posts/:id`: Remove discussion (author only).
- `POST /api/posts/:id/share`: Increment shares count and record audit log.
- `POST /api/posts/:id/save`: Toggle bookmark discussion.

### Perspectives & Comments (`/api/comments`)
- `GET /api/posts/:postId/comments`: Get all root comments and nested replies.
- `POST /api/posts/:postId/comments`: Add perspective to discussion.
- `POST /api/comments/:commentId/replies`: Add reply to perspective thread.
- `PUT /api/comments/:commentId`: Edit comment (author only).
- `DELETE /api/comments/:commentId`: Delete comment (author only).
- `POST /api/comments/:commentId/like`: Toggle upvote/agree on comment.

### Thinkers & Profiles (`/api/users`)
- `GET /api/users`: List active thinkers.
- `GET /api/users/:id`: Get thinker profile and reputation metrics.
- `PUT /api/users/profile`: Update profile info and avatar.
- `POST /api/users/:id/follow`: Follow or unfollow a thinker.

### Notifications (`/api/notifications`)
- `GET /api/notifications`: Get notification list.
- `POST /api/notifications/:id/read`: Mark notification as read.
- `POST /api/notifications/read-all`: Mark all notifications as read.

---

## 4. Local Development

During local development in AI Studio and on your computer:
```bash
npm run dev
```
Runs `server.ts` on port 3000 using Node.js's built-in SQLite engine (`node:sqlite`) with 100% Cloudflare D1 API parity. The frontend connects to `/api/*` through Vite middleware.
