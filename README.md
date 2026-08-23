# Premium Law Firm

This is a full-stack monorepo for the Premium Law Firm management system. It uses **Next.js** for the frontend, **Express + Node.js** for the backend API, and **Prisma** with **PostgreSQL** for the database.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) and Docker Compose (for running the local database and Redis)

## Setup Instructions

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd premium-law-firm
```

### 2. Install Dependencies

This project is a monorepo (using npm workspaces). Running `npm install` from the root will install dependencies for all packages (frontend, backend, validations, etc.) and generate the Prisma client automatically.

```bash
npm install
```

### 3. Environment Variables

Create `.env` files for both the frontend and backend by copying the provided example files (if available), or configuring them manually:

**Backend (`backend/.env`)**
Needs the database URL and Redis connection:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/premium_law_firm?schema=public"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
# Add other secrets (JWT secrets, etc.) as required by the backend
```

**Frontend (`frontend/.env`)**
```env
NEXT_PUBLIC_API_URL="http://localhost:4000" # Adjust port to match your backend
```

### 4. Start Local Services (Database & Redis)

Start the local PostgreSQL and Redis containers in the background using Docker Compose:

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 5. Run Database Migrations & Seeding

Apply the Prisma migrations to create your database schema, and then seed the database with initial data:

```bash
# From the project root
npm run db:migrate
npm run db:seed
```
*Note: You can view your database at any time using Prisma Studio by running `npm run db:studio`.*

### 6. Start the Development Servers

You will need to start both the frontend and backend servers. We recommend using two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API will run on its designated port (default is usually `4000`).

---

## Deployment

The project is configured for continuous deployment using GitHub Actions (`.github/workflows/deploy.yml`). It automatically deploys the `main` branch to a Hostinger VPS. To set it up, ensure you have configured `VPS_HOST`, `VPS_USER`, and `VPS_SSH_KEY` in your GitHub repository secrets.
