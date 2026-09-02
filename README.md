# Modern E-Commerce Platform

[![CI](https://github.com/mcdchristian/mcd-full-e-commerce/actions/workflows/ci.yml/badge.svg)](https://github.com/mcdchristian/mcd-full-e-commerce/actions/workflows/ci.yml) ![Node.js](https://img.shields.io/badge/Node.js-✓-green.svg) ![Express](https://img.shields.io/badge/Express-✓-black.svg) ![Next.js](https://img.shields.io/badge/Next.js-✓-black.svg) ![Stripe](https://img.shields.io/badge/Stripe-✓-blue.svg)
A professional, full-stack e-commerce solution built with **Next.js**, **Express**, and **Sequelize**. This project features a custom server integration allowing seamless communication between a robust Node.js backend and a high-performance React frontend.

## 🚀 Overview

This platform is designed to provide a premium shopping experience with a focus on performance, security, and scalability. It integrates modern web technologies to handle everything from product discovery to secure payments.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context providers (`frontend/store`)
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Payments**: Stripe Elements

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL / MariaDB
- **ORM**: Sequelize
- **Authentication**: JWT bearer tokens, restored from browser storage on load
- **Security**: Helmet, CORS, Bcryptjs
- **Payments**: Stripe SDK & Webhooks

## ✨ Key Features

- **Custom Next.js Server**: Express-hosted Next.js application for unified routing and backend control.
- **Product Management**: Dynamic product catalog with category filtering.
- **Shopping Cart**: Real-time cart management with local and server-side persistence.
- **Secure Checkout**: Full Stripe integration with support for webhooks to handle asynchronous payment events.
- **Authentication System**: Secure user registration and login with role-based access control (Admin/Customer).
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop views.

## 📁 Project Structure

```text
.
├── frontend/           # Next.js application source
├── src/
│   ├── config/         # Database and environment configurations
│   ├── models/         # Sequelize data models
│   ├── routes/         # Express API routes
│   ├── controllers/    # Business logic for API endpoints
│   ├── middleware/     # Auth, request id and validation middleware
│   ├── services/       # Stripe and notification integrations
│   ├── utils/          # Logger, pagination and response helpers
│   ├── app.js          # Express app configuration & Next.js integration
│   └── server.js       # Entry point for the backend server
├── tests/              # node:test unit suite (`npm test`)
├── scripts/            # Database seeding and maintenance scripts
├── .github/workflows/  # Continuous integration
└── package.json        # Root dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mcdchristian/mcd-full-e-commerce.git
   cd mcd-full-e-commerce
   ```

2. **Install dependencies**:
   ```bash
   # Install root/backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Create the database**:
   ```bash
   sudo mysql
   ```
   Then, at the prompt:
   ```sql
   CREATE DATABASE ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'ecommerce'@'localhost' IDENTIFIED BY 'a-password-you-choose';
   CREATE USER 'ecommerce'@'127.0.0.1' IDENTIFIED BY 'a-password-you-choose';
   GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce'@'localhost';
   GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce'@'127.0.0.1';
   ```

   Two notes that save an afternoon. On Debian and Ubuntu, MySQL's `root`
   authenticates through the Unix socket, so `sudo mysql` works and
   `mysql -u root -p` reports "Access denied" whatever you type. And MySQL
   treats `localhost` and `127.0.0.1` as different hosts — granting only one
   of them is the usual cause of an "Access denied" that appears after a setup
   that otherwise looked fine.

4. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```

   The server refuses to start without `DB_NAME`, `DB_USER`, `DB_HOST`,
   `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `APP_URL`,
   and names the ones you missed. `JWT_EXPIRES_IN` defaults to `7d`,
   `DB_LOGGING` follows `NODE_ENV`.

   Leaving the Stripe placeholders in place is fine for everything except
   payment: the server warns at boot, and checkout answers `503` with a message
   saying so. Real test keys live at
   https://dashboard.stripe.com/test/apikeys.

5. **Seed the database**:
   ```bash
   npm run seed
   ```
   Creates five categories, 250 products and an admin account
   (`admin@example.com` / `password123`). It drops the existing tables first,
   so never point it at a database you care about — it refuses to run at all
   when `NODE_ENV=production` unless `ALLOW_DESTRUCTIVE_SEED=true`.

6. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`, or at the
   `PORT` you set. Set `APP_URL` to match — Stripe redirects back to it after
   checkout.

## 🧪 Testing

The backend suite runs on Node's built-in test runner — no extra dependency,
no database required:

```bash
npm test          # run once
npm run test:watch  # re-run on change
```

The suite covers the request-validation middleware, the role gate, the central
error handler, the order status transitions, and the pagination, logging,
field-allowlist, environment and Stripe-configuration helpers. Every push and pull request also runs it on Node 20 and 22 and builds
the Next.js app, through the workflow in `.github/workflows/ci.yml`.

## ⚠️ Error Responses

Controllers never write error responses themselves. Expected failures are
raised as `AppError` and travel through `next()` to a single handler:

```js
const AppError = require('../utils/AppError');

if (!product) {
  throw AppError.notFound('Product not found');
}
```

Every failure comes back in the same shape, with the request id that ties it
to the server log line:

```json
{ "message": "Product not found", "requestId": "0f8c…" }
```

Only a message we chose ourselves is repeated to the client. Anything
unexpected — a dropped connection, a driver fault — is logged in full and
answered with a generic sentence under a 500, so schema and driver details
stay server side. The stack is added to the body in development only.

## 🔐 Admin Endpoints

Routes behind `authorize('admin')`, reachable with the token of an account
whose `role` is `admin` — the seeded one, or any user promoted in the database:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/products` | Create a product |
| `PUT` | `/api/products/:id` | Update a product |
| `DELETE` | `/api/products/:id` | Delete a product |
| `PATCH` | `/api/orders/:id/status` | Advance an order |

Order statuses follow a fixed path: `pending → paid → shipped → delivered`,
with `cancelled` reachable until the parcel ships. `delivered` and `cancelled`
are terminal. A rejected move answers `409` and lists what the order can
actually become.

## 🩺 Health Check

`GET /api/health` reports process uptime and database connectivity. It answers
`503` with `status: "degraded"` when the database is unreachable, which makes
it usable as a readiness probe.

## 📜 License

This project is licensed under the ISC License.

## ✍️ Auteur

**Del'or Mutaliko** - *Backend Developer*
