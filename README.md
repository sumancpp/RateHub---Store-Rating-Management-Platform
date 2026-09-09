# RateHub — Store Rating Management Platform

RateHub is a production-grade, full-stack web application designed to allow users to discover registered stores, view community ratings, and submit verified ratings. It provides specialized dashboards and access controls for three distinct roles: **System Administrator**, **Normal User**, and **Store Owner**, all unified under a single secure authentication system.

---

## Features

### 1. Unified Authentication & Access Control
- Single login interface routing users dynamically to their role-specific dashboard.
- Public user registration strictly defaulting to the `USER` role.
- Session tokens issued via secure, `httpOnly`, `SameSite=Lax` cookies with bearer token support.
- Password hashing using `bcryptjs` (salt rounds: 10).
- Password change functionality for authenticated accounts requiring current password verification.
- Backend Role-Based Access Control (RBAC) enforced independently of client requests.

### 2. System Administrator
- Real-time platform dashboard featuring database aggregate metrics:
  - Total registered users
  - Total registered stores
  - Total submitted ratings
- User Management:
  - Filterable by name, email, address, and role.
  - Whitelisted column sorting (name, email, address, role, date).
  - Detailed account inspector (including store rating if the user is a Store Owner).
  - Ability to create users with any role (`ADMIN`, `USER`, `STORE_OWNER`).
- Store Management:
  - Whitelisted sorting (name, email, address, rating, date).
  - Ability to create stores and assign them to existing Store Owners.

### 3. Normal User
- Searchable store directory:
  - Search by store name and physical address.
  - Whitelisted column sorting (name, address, rating).
  - Displays overall store rating and the current user's submitted rating.
- Interactive 1–5 star rating submission.
- Rating modification (updates existing rating record rather than duplicating).
- Strict validation preventing duplicate ratings, out-of-range ratings, or fractional scores.

### 4. Store Owner
- Scoped owner dashboard derived strictly from the authenticated session.
- Store summary displaying current average rating (or "No ratings yet" when unrated) and total review count.
- Customer ratings table showing the customers who rated the store (name, email, address, rating, date).
- Sortable customer rating columns.

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Vanilla CSS design system.
- **Backend**: Node.js, Express.js (ES Modules).
- **Database**: PostgreSQL.
- **ORM**: Prisma ORM v5.
- **Validation**: Zod.
- **Security & Headers**: Helmet, CORS, express-rate-limit, cookie-parser.
- **Testing**: Jest, Supertest.

---

## Project Structure

```
├── .gitignore                     # Root gitignore excluding .env, node_modules, build artifacts
├── package.json                   # Root orchestrator scripts
├── README.md                      # Project documentation
│
├── backend/
│   ├── .env.example               # Backend environment variables template
│   ├── .gitignore                 # Backend gitignore
│   ├── package.json               # Backend dependencies and scripts
│   ├── prisma/
│   │   ├── schema.prisma          # Relational PostgreSQL schema definition
│   │   ├── migrations/            # SQL migration history
│   │   └── seed.js                # Database seed script for development/demo
│   ├── scripts/
│   │   └── db-runner.js           # Embedded PostgreSQL service runner for zero-setup local dev
│   ├── src/
│   │   ├── config/                # Environment variable parsing and Prisma singleton
│   │   ├── controllers/           # Business logic layer (auth, admin, store, user, storeOwner)
│   │   ├── middleware/            # Auth JWT, RBAC guards, rate limiter, centralized error handler
│   │   ├── routes/                # Express API REST route definitions
│   │   ├── validators/            # Zod validation schemas
│   │   ├── app.js                 # Express application configuration
│   │   └── server.js              # Server HTTP listener entrypoint
│   └── tests/                     # Automated test suites (auth, authorization, ratings, validation)
│
└── frontend/
    ├── .env.example               # Frontend environment variables template
    ├── index.html                 # HTML5 template with typography and meta tags
    ├── package.json               # Frontend dependencies and build scripts
    ├── vite.config.js             # Vite configuration with API proxy
    └── src/
        ├── components/            # Navbar, ProtectedRoute, StarRating, ChangePasswordModal
        ├── context/               # AuthContext managing user state and session checks
        ├── pages/                 # Login, Register, AdminDashboard, UserDashboard, StoreOwnerDashboard
        ├── services/              # API client wrapper
        ├── index.css              # Clean, professional, responsive CSS design system
        ├── App.jsx                # Main application component with route declarations
        └── main.jsx               # React DOM entrypoint
```

---

## Prerequisites

- **Node.js** (v18.x or higher)
- **npm** (v9.x or higher)
- **PostgreSQL** (Optional external installation: if external PostgreSQL is not running, the application includes a local embedded PostgreSQL runner via `npm run db:start`).

---

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd "RateHub — Store Rating Management Platform"
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Ensure the configuration matches your local environment:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ratehub_dev?schema=public
JWT_SECRET=super_secret_jwt_key_for_ratehub_dev_testing_123
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

*(Optional)* Copy `frontend/.env.example` to `frontend/.env` if customizing the API URL:
```bash
cp frontend/.env.example frontend/.env
```

### 3. Install Dependencies
Install dependencies for both backend and frontend:
```bash
npm run install:all
```

---

## Database Initialization & Seeding

### 1. Start Local PostgreSQL Database
If you do not have a system PostgreSQL service running on port 5432:
```bash
npm run db:start
```
*(This initializes a local database cluster in `.postgres-data/` on port 5432 and keeps it running).*

### 2. Run Database Migrations
Apply the Prisma migration to sync the database schema:
```bash
npm run db:migrate
```

### 3. Seed Development Data
Populate the database with sample users, stores, and ratings:
```bash
npm run db:seed
```

---

## Running the Application

In separate terminal windows:

### 1. Start Backend API (Port 5000)
```bash
npm run dev:backend
```

### 2. Start Frontend Application (Port 5173)
```bash
npm run dev:frontend
```

Open your browser and navigate to: **http://localhost:5173**

---

## Development Test Accounts

> [!NOTE]
> The credentials below are generated by `npm run db:seed` for **local development and demonstration purposes only**.

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@ratehub.local` | `Password@123` | Full access to platform metrics, users, and stores |
| **Store Owner** | `owner@ratehub.local` | `Password@123` | Owner of *Central Organic Grocery & Fresh Market* |
| **Normal User 1** | `user1@ratehub.local` | `Password@123` | Standard user with submitted rating for Fresh Market |
| **Normal User 2** | `user2@ratehub.local` | `Password@123` | Standard user with submitted rating for Fresh Market |

---

## API Overview

### Authentication
- `POST /api/auth/register` — Public registration (strictly creates `USER` role).
- `POST /api/auth/login` — Authenticate credentials and receive session cookie/token.
- `POST /api/auth/logout` — Clear session cookie.
- `GET  /api/auth/me` — Retrieve currently authenticated user profile.

### User Account
- `PUT  /api/users/password` — Change password for authenticated account.

### Administrator (`ADMIN` role required)
- `GET  /api/admin/dashboard` — Platform aggregate metrics (total users, stores, ratings).
- `GET  /api/admin/users` — Filter (`name`, `email`, `address`, `role`) and sort users.
- `GET  /api/admin/users/:id` — Inspect user account and associated store ratings.
- `POST /api/admin/users` — Create a new user with any role (`ADMIN`, `USER`, `STORE_OWNER`).
- `GET  /api/admin/stores` — List all registered stores with sortable overall ratings.
- `POST /api/admin/stores` — Create a new store assigned to a Store Owner.

### Stores & Ratings
- `GET  /api/stores` — List stores with overall rating and user's submitted rating (search by `name`, `address`).
- `GET  /api/stores/:id` — Retrieve store details.
- `POST /api/stores/:id/ratings` — Submit a rating between 1 and 5 (`USER` role required).
- `PUT  /api/stores/:id/ratings` — Modify existing rating between 1 and 5 (`USER` role required).

### Store Owner (`STORE_OWNER` role required)
- `GET  /api/store-owner/dashboard` — Overview of owner's store and average rating.
- `GET  /api/store-owner/ratings` — List of customers who rated the store with sortable columns.

---

## Security Implementation

1. **Password Security**:
   - Minimum 8, maximum 16 characters, requiring at least one uppercase letter and one special character.
   - Hashed using `bcryptjs` with salt work factor 10. Passwords and hashes are never exposed in responses.
2. **Backend Input Validation**:
   - Strict Zod validation on request bodies, route parameters, and query parameters.
   - Name restricted to 20–60 characters.
   - Address capped at 400 characters.
   - Ratings strictly validated as integers between 1 and 5.
3. **Database Security & Relational Integrity**:
   - Parameterized SQL queries via Prisma ORM preventing SQL injection.
   - Database-level unique constraint on `(userId, storeId)` to prevent duplicate ratings.
   - Relational foreign keys with cascading delete rules.
4. **CORS & HTTP Security**:
   - CORS explicitly bound to the configured frontend origin with credentials enabled.
   - Helmet middleware enabled for standard security headers.
   - Rate limiting applied to `/api/auth/login` and `/api/auth/register` to mitigate brute-force abuse.
5. **Git Security**:
   - `.gitignore` configured to ensure all `.env` files, build directories, and database storage remain untracked.

---

## Running Automated Tests

Run the backend test suite:
```bash
cd backend && npm test
```

The test suite covers:
- **Authentication**: Successful registration, duplicate email rejection, invalid password rejection, valid login, invalid login, logout.
- **Authorization & RBAC**: Unauthenticated 401 handling, role enforcement (403 for unauthorized routes), store owner access boundaries.
- **Ratings**: Ratings 1 and 5 accepted, out-of-range ratings rejected (0, 6), decimals rejected, strings rejected, duplicate ratings blocked, rating modification.
- **Validation**: Name length boundaries (20–60 chars), address length (<=400 chars), email formatting.
