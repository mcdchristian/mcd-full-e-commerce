# Modern E-Commerce Platform

A professional, full-stack e-commerce solution built with **Next.js**, **Express**, and **Sequelize**. This project features a custom server integration allowing seamless communication between a robust Node.js backend and a high-performance React frontend.

## 🚀 Overview

This platform is designed to provide a premium shopping experience with a focus on performance, security, and scalability. It integrates modern web technologies to handle everything from product discovery to secure payments.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Icons**: Lucide React
- **Payments**: Stripe Elements

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL / MariaDB
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens) with Cookies
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
│   ├── app.js          # Express app configuration & Next.js integration
│   └── server.js       # Entry point for the backend server
├── scripts/            # Database seeding and maintenance scripts
└── package.json        # Root dependencies and scripts
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB

### Installation

1. **Clone the repository**:
   ```bash
   git clone < https://github.com/mcdchristian/mcd-full-e-commerce.git>
   cd e-commerce
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
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASS=your_db_password
   DB_HOST=localhost
   JWT_SECRET=your_jwt_secret
   STRIPE_SECRET_KEY=your_stripe_key
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 📜 License

This project is licensed under the ISC License.

## ✍️ Auteur

**Del'or Mutaliko** - *Backend Developer*
