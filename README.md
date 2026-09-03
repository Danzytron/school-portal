# School Portal System

A full-stack School Portal web application built with modern technologies but styled with a nostalgic **2015 university portal** aesthetic.

> ⚠️ **Demo Application** — This project is for demonstration/development purposes. The included credentials are for development environments only.

---

## Features

- **Multi-role authentication** — Student, Teacher, and Admin dashboards
- **Student Portal** — View grades, attendance, schedule, enrollment, fees, documents
- **Teacher Portal** — Manage grades, attendance, announcements, upload documents
- **Admin Panel** — Full CRUD management for all entities, reports, charts
- **Enrollment System** — Student enrollment workflow with approval process
- **Grade Management** — Teacher submission → Admin review → Student viewing
- **Attendance Tracking** — Bulk attendance marking with statistics
- **Announcement System** — Role-targeted announcements with read tracking
- **School Fees** — Fee breakdown and payment history
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Security** — Role-based access control, input validation, CSRF protection

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 + TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Laravel 13 (PHP 8.4) |
| Database | PostgreSQL 16 |
| Authentication | Laravel Sanctum |
| API | RESTful JSON API |

---

## System Architecture

```
┌─────────────────┐     HTTP/JSON     ┌──────────────────┐     SQL      ┌──────────────┐
│                 │  ←──────────────→  │                  │  ←────────→  │              │
│   Next.js 16    │    REST API        │   Laravel 13     │   Eloquent   │ PostgreSQL   │
│   TypeScript    │    Port 3000       │   PHP 8.4        │   ORM        │  Port 5432   │
│   Tailwind CSS  │                    │   Sanctum Auth   │              │              │
│                 │                    │                  │              │              │
└─────────────────┘                    └──────────────────┘              └──────────────┘
     Frontend                              Backend                        Database
```

---

## Installation

### Prerequisites

- **Node.js** v20+ (LTS)
- **PHP** 8.3+ with extensions: `pdo_pgsql`, `pgsql`, `mbstring`, `curl`, `openssl`, `fileinfo`, `zip`
- **Composer** 2.x+
- **PostgreSQL** 14+

### 1. Clone the Repository

```bash
git clone <repository-url>
cd school-portal
```

### 2. PostgreSQL Setup

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database and user
CREATE DATABASE school_portal;
CREATE USER school_portal_user WITH PASSWORD 'school_portal_pass';
GRANT ALL PRIVILEGES ON DATABASE school_portal TO school_portal_user;
\q
```

### 3. Backend Setup (Laravel)

```bash
cd backend

# Install PHP dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate application key
php artisan key:generate

# Install Sanctum API scaffolding
php artisan install:api

# Run database migrations
php artisan migrate

# Seed demo data
php artisan db:seed

# Start the development server
php artisan serve
# Backend runs at http://localhost:8000
```

### 4. Frontend Setup (Next.js)

```bash
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
# Frontend runs at http://localhost:3000
```

---

## Environment Variables

### Backend (.env)

```env
APP_NAME="School Portal"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=school_portal
DB_USERNAME=postgres
DB_PASSWORD=password

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Demo Accounts

> ⚠️ **Development/Demo Only** — Do NOT use these credentials in production.

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Admin | admin@schoolportal.test | password | — |
| Teacher | teacher@schoolportal.test | password | — |
| Student | student@schoolportal.test | password | 2026-00001 |

---

## API Documentation

See [docs/api-documentation.md](docs/api-documentation.md) for the complete API reference.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Authenticate user |
| POST | `/api/logout` | Logout user |
| GET | `/api/user` | Get current user |
| GET | `/api/students` | List students |
| GET | `/api/subjects` | List subjects |
| GET | `/api/enrollments` | List enrollments |
| GET | `/api/grades` | List grades |
| POST | `/api/attendance` | Record attendance |
| GET | `/api/announcements` | List announcements |

---

## Development Commands

### Backend

```bash
# Start server
php artisan serve

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Fresh migration + seed
php artisan migrate:fresh --seed

# Run tests
php artisan test

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Start production server
npm start
```

---

## Project Structure

```
school-portal/
├── frontend/                   # Next.js Application
│   ├── app/                    # App Router pages
│   │   ├── login/              # Login page
│   │   ├── student/            # Student portal (12 pages)
│   │   ├── teacher/            # Teacher portal (10 pages)
│   │   └── admin/              # Admin panel (18 pages)
│   ├── components/             # Reusable components
│   │   ├── layout/             # Layout components
│   │   └── ui/                 # UI component library
│   ├── lib/                    # Utilities & API client
│   └── types/                  # TypeScript interfaces
│
├── backend/                    # Laravel Application
│   ├── app/
│   │   ├── Models/             # 24 Eloquent models
│   │   ├── Http/
│   │   │   ├── Controllers/    # 21 API controllers
│   │   │   ├── Requests/       # 29 form validation classes
│   │   │   ├── Resources/      # 20 API resource classes
│   │   │   └── Middleware/     # Role & audit middleware
│   │   ├── Services/           # 10 service classes
│   │   └── Policies/           # 12 authorization policies
│   ├── database/
│   │   ├── migrations/         # 24 migration files
│   │   └── seeders/            # Demo data seeders
│   └── routes/api.php          # API route definitions
│
├── docs/                       # Documentation
│   ├── architecture.md
│   ├── api-documentation.md
│   └── database-schema.md
│
└── README.md                   # This file
```

---

## Database Schema

See [docs/database-schema.md](docs/database-schema.md) for the full ER diagram and table descriptions.

---

## License

This project is for educational and demonstration purposes.
