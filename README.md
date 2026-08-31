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

3. **Environment Setup**:
   Copy `.env.example` to `.env` in the root directory and fill it in:
   ```bash
   cp .env.example .env
   ```

   The server refuses to start without `JWT_SECRET`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET` and `APP_URL`. `JWT_EXPIRES_IN` is optional and
   defaults to `7d`.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

5. **Seed the database** (optional):
   ```bash
   npm run seed
   ```
   Creates five categories, 250 products and an admin account
   (`admin@example.com` / `password123`). It drops the existing tables first,
   so never point it at a database you care about.

## 🧪 Testing

The backend suite runs on Node's built-in test runner — no extra dependency,
no database required:

```bash
npm test          # run once
npm run test:watch  # re-run on change
```

Every push and pull request also runs the suite on Node 20 and 22 and builds
the Next.js app, through the workflow in `.github/workflows/ci.yml`.

## 🩺 Health Check

`GET /api/health` reports process uptime and database connectivity. It answers
`503` with `status: "degraded"` when the database is unreachable, which makes
it usable as a readiness probe.

## 📜 License

This project is licensed under the ISC License.

## ✍️ Auteur

**Del'or Mutaliko** - *Backend Developer*
