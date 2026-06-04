<div align="center">

# 🎬 ChalChitra

### A Production-Grade YouTube Backend Clone

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media%20CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](https://opensource.org/licenses/ISC)

> **ChalChitra** is a fully-featured RESTful backend API that mirrors the core functionality of YouTube — built with Node.js, Express, and MongoDB. It handles everything from user authentication and video uploads to comments, likes, subscriptions, playlists, and tweets.

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Core Concepts & Implementation](#-core-concepts--implementation)
  - [JWT Authentication](#1-jwt-authentication)
  - [Multer — File Uploads](#2-multer--file-uploads)
  - [Cloudinary API](#3-cloudinary-api)
  - [MongoDB Aggregation Pipelines](#4-mongodb-aggregation-pipelines)
  - [Pagination](#5-pagination)
  - [Cookie Parser](#6-cookie-parser)
  - [CORS](#7-cors)
- [API Endpoints](#-api-endpoints)
- [Postman Collection](#-postman-collection)

---

## 🌟 Overview

ChalChitra is not just another tutorial project. It is built following **production-level best practices** with a clean MVC-like architecture. The backend supports:

- 🔐 Secure user registration, login, logout with **Access + Refresh Token** strategy
- 🎥 Video upload, update, delete, and publish/unpublish toggle
- 💬 Comments with full CRUD
- 👍 Likes on videos, comments, and tweets
- 📋 Playlists — create, manage, and nest videos
- 📡 Subscriptions — subscribe/unsubscribe channels
- 🐦 Tweets — micro-content feature like YouTube Community posts
- 📊 Channel stats & dashboard via aggregation pipelines
- 🔍 Paginated search results for scalable data fetching

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | JavaScript server-side runtime |
| Framework | Express.js v5 | HTTP routing and middleware |
| Database | MongoDB + Mongoose | NoSQL document database & ODM |
| Auth | JSON Web Tokens (JWT) | Stateless authentication |
| Media | Cloudinary | Cloud storage for videos & images |
| File Handling | Multer | Multipart form-data (uploads) |
| Pagination | mongoose-aggregate-paginate-v2 | Cursor-based paginated queries |
| Security | bcrypt | Password hashing |
| Config | dotenv | Environment variable management |
| Dev Tools | Nodemon + Prettier | Hot-reloading & code formatting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SahityaThakurela/ChalChitra.git
cd ChalChitra

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your values in .env

# 4. Start the development server
npm run dev
```

The server will start at `http://localhost:8000` (or your configured `PORT`).

### Development Script

```json
"scripts": {
  "dev": "nodemon -r dotenv/config src/index.js"
}
```

`nodemon` watches for file changes and auto-restarts. The `-r dotenv/config` flag preloads environment variables before the app starts.

---

## 📁 Project Structure

```
ChalChitra/
│
├── public/
│   └── temp/                   # Temporary local storage for Multer uploads
│                               # Files here are uploaded to Cloudinary, then deleted
│
├── src/
│   ├── index.js                # Entry point — starts the HTTP server
│   ├── app.js                  # Express app setup (middleware, routes, CORS)
│   ├── constants.js            # App-wide constants (DB name, enums, etc.)
│   │
│   ├── db/
│   │   └── index.js            # MongoDB connection logic (Mongoose)
│   │
│   ├── models/                 # Mongoose schemas & models
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   └── tweet.model.js
│   │
│   ├── controllers/            # Business logic — one file per resource
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── routes/                 # Express routers — maps URLs to controllers
│   │   ├── user.routes.js
│   │   ├── video.routes.js
│   │   ├── comment.routes.js
│   │   ├── like.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middlewares/            # Custom Express middlewares
│   │   ├── auth.middleware.js  # JWT verification (verifyJWT)
│   │   └── multer.middleware.js# Multer config (disk storage → public/temp)
│   │
│   └── utils/                 # Shared utility helpers
│       ├── ApiError.js         # Custom error class with HTTP status codes
│       ├── ApiResponse.js      # Standardised JSON response wrapper
│       ├── asyncHandler.js     # try/catch wrapper for async controllers
│       └── cloudinary.js       # Cloudinary upload & delete helpers
│
├── .env                        # Environment variables (gitignored)
├── .gitignore
├── .prettierrc
├── package.json
└── README.md
```

---

## 🗄 Database Schema

The database is designed around **7 collections** with references between them using MongoDB ObjectIds.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐          ┌──────────────────────┐
│   playlists  │          │        users          │
├──────────────┤          ├──────────────────────┤
│ id (PK)      │◄────────►│ id (PK)               │
│ name         │  owner   │ username              │
│ description  │          │ email                 │
│ videos[]  ───┼──┐       │ fullName              │
│ owner ───────┼──┼──────►│ avatar                │
│ createdAt    │  │       │ coverImage            │
│ updatedAt    │  │       │ password (hashed)     │
└──────────────┘  │       │ refreshToken          │
                  │       │ watchHistory[]  ───┐  │
┌──────────────┐  │       │ createdAt          │  │
│   comments   │  │       │ updatedAt          │  │
├──────────────┤  │       └──────────────────────┘
│ id (PK)      │  │              ▲  ▲
│ content      │  │              │  │
│ video ───────┼──┼──────────────┼──┼──┐
│ owner ───────┼──┼──────────────┘  │  │
│ createdAt    │  │                 │  │
│ updatedAt    │  │  ┌──────────────┘  │
└──────────────┘  │  │                 │
       ▲          │  │  ┌──────────────┘
       │          ▼  │  ▼
┌──────────────┐  ┌──────────────────────┐
│    likes     │  │        videos         │
├──────────────┤  ├──────────────────────┤
│ id (PK)      │  │ id (PK)               │
│ comment ─────┼──┘ videoFile            │
│ video        │  │ thumbnail             │
│ tweet        │  │ owner ───────────────►│ users
│ likedBy ─────┼──►users                 │
│ createdAt    │  │ title                 │
│ updatedAt    │  │ description           │
└──────────────┘  │ duration              │
                  │ views                 │
┌──────────────┐  │ isPublished           │
│ subscriptions│  │ createdAt             │
├──────────────┤  │ updatedAt             │
│ id (PK)      │  └──────────────────────┘
│ subscriber ──┼──► users
│ channel ─────┼──► users
│ createdAt    │
│ updatedAt    │    ┌──────────────┐
└──────────────┘    │    tweets    │
                    ├──────────────┤
                    │ id (PK)      │
                    │ owner ───────┼──► users
                    │ content      │
                    │ createdAt    │
                    │ updatedAt    │
                    └──────────────┘
```

---

## 🔍 Core Concepts & Implementation

### 1. JWT Authentication

ChalChitra uses a **dual-token strategy** — a short-lived Access Token and a long-lived Refresh Token — ensuring security while keeping users logged in.

```
                    ┌─────────────────────────────────────┐
                    │           AUTH FLOW                  │
                    └─────────────────────────────────────┘

  Client                                         Server
    │                                              │
    │──── POST /api/v1/users/login ───────────────►│
    │     { username, password }                   │
    │                                              │  1. Find user in DB
    │                                              │  2. bcrypt.compare(password)
    │                                              │  3. Generate Access Token (15m)
    │                                              │  4. Generate Refresh Token (7d)
    │                                              │  5. Save Refresh Token to DB
    │◄─── 200 OK ─────────────────────────────────│
    │     Set-Cookie: accessToken  (httpOnly)      │
    │     Set-Cookie: refreshToken (httpOnly)      │
    │                                              │
    │──── GET /api/v1/users/profile ──────────────►│
    │     Cookie: accessToken=<jwt>                │
    │                                              │  verifyJWT middleware:
    │                                              │  1. Extract token from cookie / header
    │                                              │  2. jwt.verify(token, secret)
    │                                              │  3. Attach user to req.user
    │◄─── 200 OK (user data) ─────────────────────│
    │                                              │
    │  [Access Token expires]                      │
    │──── POST /api/v1/users/refresh-token ───────►│
    │     Cookie: refreshToken=<jwt>               │
    │                                              │  1. Verify refresh token
    │                                              │  2. Match with DB stored token
    │                                              │  3. Issue new Access + Refresh tokens
    │◄─── 200 OK (new tokens in cookies) ─────────│
```

**Key files:**
- `src/middlewares/auth.middleware.js` — `verifyJWT` middleware
- `src/models/user.model.js` — Token generation methods (`generateAccessToken`, `generateRefreshToken`)

---

### 2. Multer — File Uploads

Multer intercepts `multipart/form-data` requests and temporarily stores files on the local disk (`public/temp/`) before they are forwarded to Cloudinary.

```
                    ┌─────────────────────────────────────┐
                    │         FILE UPLOAD FLOW             │
                    └─────────────────────────────────────┘

  Client                    Multer                  Cloudinary
    │                         │                         │
    │── POST (video/avatar) ──►│                         │
    │   multipart/form-data    │                         │
    │                         │ Save to public/temp/     │
    │                         │ (diskStorage)            │
    │                         │                         │
    │                         │── uploadOnCloudinary() ──►│
    │                         │   (utils/cloudinary.js)  │  Upload & get URL
    │                         │                         │◄─ secure_url, public_id
    │                         │ Delete local temp file   │
    │◄── 201 Created ─────────│  (fs.unlinkSync)         │
    │    { videoUrl, ... }     │                         │
```

**Key middleware file:** `src/middlewares/multer.middleware.js` uses `diskStorage` to write incoming files into `public/temp/` with their original filenames, then passes the local path to the Cloudinary utility.

---

### 3. Cloudinary API

All media (videos, avatars, cover images, thumbnails) are hosted on Cloudinary. The utility in `src/utils/cloudinary.js` accepts a local temp path, streams the file to Cloudinary using `resource_type: "auto"` (handles both images and videos), then deletes the local temp file with `fs.unlinkSync`. Cloudinary returns a **secure HTTPS URL** which is stored in MongoDB as a string field on the relevant document.

---

### 4. MongoDB Aggregation Pipelines

Aggregation pipelines are used for **complex, multi-collection queries** that go beyond simple `find()` — such as fetching a user's channel profile with subscriber count, or getting paginated video feeds.

```
                    ┌─────────────────────────────────────────┐
                    │     AGGREGATION PIPELINE STAGES          │
                    └─────────────────────────────────────────┘

  Input Collection
       │
       ▼
  ┌─────────────┐
  │  $match     │  Filter documents (e.g., match by username)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  $lookup    │  Join with another collection (like SQL JOIN)
  │             │  e.g., join subscriptions to count subscribers
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  $addFields │  Compute new fields (e.g., subscribersCount, isSubscribed)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  $project   │  Shape the output — include/exclude fields
  └──────┬──────┘
         │
         ▼
     Final Result
```

**Key files:** `src/controllers/user.controller.js` (channel profile, watch history), `src/controllers/dashboard.controller.js` (channel stats), `src/controllers/video.controller.js` (video feed with filters).

---

### 5. Pagination

Pagination is implemented using **`mongoose-aggregate-paginate-v2`** — a plugin that wraps MongoDB aggregation pipelines to return paginated results, avoiding expensive full-collection scans.

```
                    ┌─────────────────────────────────────────┐
                    │         PAGINATION FLOW                  │
                    └─────────────────────────────────────────┘

  Client Request: GET /api/v1/videos?page=2&limit=10&query=music

       │
       ▼
  Build Aggregation Pipeline (match, sort, lookup...)
       │
       ▼
  Video.aggregatePaginate(pipeline, { page: 2, limit: 10 })
       │
       ▼
  ┌───────────────────────────────────────────────┐
  │  Response                                     │
  │  {                                            │
  │    docs: [ ...10 video objects... ],          │
  │    totalDocs: 84,                             │
  │    limit: 10,                                 │
  │    page: 2,                                   │
  │    totalPages: 9,                             │
  │    hasNextPage: true,                         │
  │    hasPrevPage: true                          │
  │  }                                            │
  └───────────────────────────────────────────────┘
```

The plugin is registered directly on the Mongoose model schema in `src/models/video.model.js`, enabling `Video.aggregatePaginate()` across the codebase.

---

### 6. Cookie Parser

`cookie-parser` is registered as an Express middleware in `app.js`. It parses the `Cookie` header on incoming requests and populates `req.cookies` — used by the `verifyJWT` middleware to extract the access token.

This dual-source approach means the API works for both **browser clients** (using cookies) and **mobile/API clients** (using Bearer headers).

---

### 7. CORS

CORS is configured in `app.js` to allow cross-origin requests only from the trusted origin defined in the `CORS_ORIGIN` environment variable. The `credentials: true` option is essential because the auth strategy uses **httpOnly cookies** — browsers only send these cross-origin when both server and client explicitly allow credentials.

---

## 📡 API Endpoints

### 👤 Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/users/register` | ❌ | Register new user (avatar + coverImage upload) |
| POST | `/api/v1/users/login` | ❌ | Login — returns access & refresh tokens |
| POST | `/api/v1/users/logout` | ✅ | Clear tokens |
| POST | `/api/v1/users/refresh-token` | ❌ | Get new access token via refresh token |
| GET | `/api/v1/users/current-user` | ✅ | Get logged-in user |
| PATCH | `/api/v1/users/update-account` | ✅ | Update name / email |
| PATCH | `/api/v1/users/avatar` | ✅ | Change avatar |
| PATCH | `/api/v1/users/cover-image` | ✅ | Change cover image |
| GET | `/api/v1/users/c/:username` | ✅ | Get channel profile (with subscriber count) |
| GET | `/api/v1/users/history` | ✅ | Get watch history |

### 🎥 Videos
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/videos` | ✅ | Get all videos (paginated, filterable) |
| POST | `/api/v1/videos` | ✅ | Upload new video |
| GET | `/api/v1/videos/:videoId` | ✅ | Get video by ID |
| PATCH | `/api/v1/videos/:videoId` | ✅ | Update video metadata |
| DELETE | `/api/v1/videos/:videoId` | ✅ | Delete video |
| PATCH | `/api/v1/videos/toggle/publish/:videoId` | ✅ | Publish/unpublish toggle |

### 💬 Comments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/comments/:videoId` | ✅ | Get all comments for a video (paginated) |
| POST | `/api/v1/comments/:videoId` | ✅ | Add comment |
| PATCH | `/api/v1/comments/c/:commentId` | ✅ | Update comment |
| DELETE | `/api/v1/comments/c/:commentId` | ✅ | Delete comment |

### 👍 Likes
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/likes/toggle/v/:videoId` | ✅ | Toggle like on video |
| POST | `/api/v1/likes/toggle/c/:commentId` | ✅ | Toggle like on comment |
| POST | `/api/v1/likes/toggle/t/:tweetId` | ✅ | Toggle like on tweet |
| GET | `/api/v1/likes/videos` | ✅ | Get all liked videos |

### 📋 Playlists
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/playlist` | ✅ | Create playlist |
| GET | `/api/v1/playlist/:playlistId` | ✅ | Get playlist by ID |
| PATCH | `/api/v1/playlist/:playlistId` | ✅ | Update playlist |
| DELETE | `/api/v1/playlist/:playlistId` | ✅ | Delete playlist |
| PATCH | `/api/v1/playlist/add/:videoId/:playlistId` | ✅ | Add video to playlist |
| PATCH | `/api/v1/playlist/remove/:videoId/:playlistId` | ✅ | Remove video from playlist |
| GET | `/api/v1/playlist/user/:userId` | ✅ | Get all playlists of a user |

### 📡 Subscriptions
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/subscriptions/c/:channelId` | ✅ | Toggle subscribe/unsubscribe |
| GET | `/api/v1/subscriptions/c/:channelId` | ✅ | Get channel's subscribers |
| GET | `/api/v1/subscriptions/u/:subscriberId` | ✅ | Get channels a user is subscribed to |

### 🐦 Tweets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/tweets` | ✅ | Create tweet |
| GET | `/api/v1/tweets/user/:userId` | ✅ | Get user's tweets |
| PATCH | `/api/v1/tweets/:tweetId` | ✅ | Update tweet |
| DELETE | `/api/v1/tweets/:tweetId` | ✅ | Delete tweet |

### 📊 Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/dashboard/stats` | ✅ | Get channel stats (views, subs, videos, likes) |
| GET | `/api/v1/dashboard/videos` | ✅ | Get all videos of the channel |

---

## 📮 Postman Collection

All API endpoints are documented and ready to test via the Postman collection.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://www.postman.com/SahityaThakurela/chalchitra)

> **How to use:**
> 1. Click the button above or import the collection JSON into Postman
> 2. Set the `base_url` environment variable to `http://localhost:8000`
> 3. Register a user and log in — the collection auto-saves the `accessToken` cookie
> 4. All protected routes will automatically use the saved token

The collection is organised by resource — Users, Videos, Comments, Likes, Playlists, Subscriptions, Tweets, and Dashboard — mirroring the route structure of the project.

---

## 👤 Author

**Sahitya Thakurela**

- GitHub: [@SahityaThakurela](https://github.com/SahityaThakurela)

---

<div align="center">

⭐ If you found this project helpful, please give it a star!

Made with ❤️ using Node.js + MongoDB

</div>