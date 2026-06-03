# Fitness Tracker

A full-stack fitness tracker built with Next.js, Prisma, MySQL, JWT authentication, and Tailwind CSS.

## Features

- User signup, login, logout, and protected dashboard routes
- HTTP-only cookie JWT authentication
- MySQL schema managed by Prisma migrations
- Workout sessions with editable exercise rows
- Goal tracking with progress bars and status updates
- Dashboard summary for workouts, exercises, calories, active goals, and recent activity

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a MySQL database:

   ```sql
   CREATE DATABASE fitness_tracker;
   ```

3. Copy `.env.example` to `.env` and update the values:

   ```bash
   DATABASE_URL="mysql://root:password@localhost:3306/fitness_tracker"
   JWT_SECRET="replace-with-a-long-random-secret"
   NEXT_PUBLIC_APP_NAME="Fitness Tracker"
   ```

4. Run migrations and seed demo data:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

Demo account after seeding:

- Email: `demo@fitness.local`
- Password: `demo1234`
