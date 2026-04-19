<div align="center">

<br />

<img width="120" src="https://img.icons8.com/fluency/120/hospital.png" alt="Clinic Management System Logo" />

<h1>Clinic Management System</h1>

<p><strong>A production-ready, full-stack clinic & appointment management platform</strong><br/>
Built for multi-doctor medical facilities with intelligent scheduling, role-based access, and automated billing logic.</p>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js 14](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io)

<br/>

![GitHub repo size](https://img.shields.io/github/repo-size/mahmoud-atta1/Clinic-Management-System?style=flat-square&color=blue)
![GitHub last commit](https://img.shields.io/github/last-commit/mahmoud-atta1/Clinic-Management-System?style=flat-square&color=green)
![License](https://img.shields.io/badge/license-MIT-orange?style=flat-square)

<br/>

[**📋 Features**](#-features) &nbsp;•&nbsp;
[**🛠️ Tech Stack**](#️-tech-stack) &nbsp;•&nbsp;
[**🏗️ Architecture**](#️-architecture) &nbsp;•&nbsp;
[**🚀 Getting Started**](#-getting-started) &nbsp;•&nbsp;
[**👥 Roles**](#-roles--permissions) &nbsp;•&nbsp;
[**📊 Business Rules**](#-business-rules) &nbsp;•&nbsp;
[**🤝 Contributing**](#-contributing)

<br/>

</div>

---

## 📸 Overview

> This system is designed to streamline daily operations for a medical clinic — from the moment a patient books an appointment to the doctor's clinical notes and the receptionist's payment reconciliation. Every workflow is thoughtfully engineered to mirror a real production environment.

<br/>

---

## ✨ Features

<br/>

### 🔐 Advanced Security & Authentication

| Feature | Description |
|---|---|
| **Role-Based Access Control (RBAC)** | Four distinct roles — Admin, Doctor, Receptionist, Patient — each with their own protected routes and UI |
| **JWT Authentication** | Stateless authentication using JSON Web Tokens stored in secure HTTP-only cookies |
| **Password Hashing** | All credentials are hashed with `bcrypt` before being stored — never plain text |
| **Input Validation** | Every API endpoint is protected by `Joi` schema validation to ensure strict data integrity |
| **Auth Middleware** | Route-level guards that verify tokens and enforce role permissions on every request |

<br/>

### 📅 Intelligent Appointment Workflow

| Feature | Description |
|---|---|
| **Double-Booking Prevention** | MongoDB Unique Indexes enforce atomic slot locking — two patients can never book the same doctor at the same time |
| **Cancellation Policy** | Patients may only cancel appointments **more than 2 hours** before their scheduled session |
| **Consultation Pricing** | New patient visit → **300 EGP** · Follow-up visit → **150 EGP** |
| **Follow-up Eligibility** | A follow-up can only be booked if the patient has at least one previously *completed* consultation on record |
| **Real-Time Availability** | Doctors' available slots are computed dynamically based on existing bookings and working hours |

<br/>

### 🏢 Multi-Role Dashboards

Each role has its own purpose-built dashboard, designed around real clinical workflows:

```
┌─────────────────────────────────────────────────────────────────┐
│  👑  ADMIN         Strategic overview, staff management         │
│  🩺  DOCTOR        Daily queue, clinical notes, patient stats   │
│  🗂️  RECEPTIONIST  All doctors view, check-in, payments         │
│  👤  PATIENT       3-step booking, history, appointment status  │
└─────────────────────────────────────────────────────────────────┘
```

<br/>

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | v18+ | JavaScript runtime |
| **Express.js** | v4 | Web framework & REST API |
| **TypeScript** | v5 | Type safety across the entire codebase |
| **MongoDB** | Atlas/Local | Primary database |
| **Mongoose** | v8 | MongoDB ODM with schema modeling |
| **JSON Web Token** | Latest | Stateless authentication |
| **bcrypt** | Latest | Password hashing |
| **Joi** | Latest | Request body & query validation |
| **Dayjs** | Latest | Lightweight date/time manipulation |

<br/>

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | v14 | React framework with App Router |
| **TypeScript** | v5 | Type-safe component development |
| **Tailwind CSS** | v3 | Utility-first CSS framework |
| **Framer Motion** | Latest | Smooth animations & transitions |
| **Axios** | Latest | HTTP client for API calls |
| **Lucide React** | Latest | Clean, consistent icon system |

<br/>

---

## 🏗️ Architecture

### Project Structure

```
Clinic-Management-System/
│
├── 📁 backend/
│   └── src/
│       ├── 📁 modules/
│       │   ├── 📁 appointment/
│       │   │   ├── appointment.controller.ts   # Request handlers
│       │   │   ├── appointment.service.ts      # Business logic
│       │   │   ├── appointment.model.ts        # Mongoose schema
│       │   │   └── appointment.routes.ts       # Express routes
│       │   │
│       │   ├── 📁 user/
│       │   │   ├── user.controller.ts
│       │   │   ├── user.service.ts
│       │   │   ├── user.model.ts
│       │   │   └── user.routes.ts
│       │   │
│       │   └── 📁 doctor/
│       │       ├── doctor.controller.ts
│       │       ├── doctor.service.ts
│       │       ├── doctor.model.ts
│       │       └── doctor.routes.ts
│       │
│       ├── 📁 middlewares/
│       │   ├── auth.middleware.ts             # JWT verification & RBAC
│       │   ├── error.middleware.ts            # Global error handler
│       │   └── validate.middleware.ts         # Joi validation wrapper
│       │
│       └── 📁 utils/
│           └── ApiFeatures.ts                 # Filtering, sorting, pagination
│
└── 📁 frontend/
    └── app/
        ├── 📁 admin/                          # Admin portal
        ├── 📁 doctor/                         # Doctor portal
        ├── 📁 receptionist/                   # Receptionist portal
        └── 📁 patient/                        # Patient portal
```

<br/>

### Key Engineering Decisions

#### 🧩 Module-Based Architecture
Each domain (Appointment, User, Doctor) is encapsulated in its own self-contained module with its own controller, service, model, and routes. This makes the codebase scalable — adding a new feature never requires touching existing modules.

#### ⚡ `ApiFeatures` Utility Class
A powerful reusable class that attaches to any Mongoose query and adds dynamic filtering, full-text search, multi-field sorting, and page-based pagination.

```typescript
const features = new ApiFeatures(Appointment.find(), req.query)
  .filter()
  .search()
  .sort()
  .paginate();

const appointments = await features.query;
```

#### 🛡️ Centralized Error Handling
A single global Express middleware catches all errors — whether from Mongoose (duplicate keys, cast errors, validation), JWT (invalid/expired tokens), or custom `AppError` instances — and transforms them into clean, consistent JSON responses with appropriate HTTP status codes.

#### 🔒 Atomic Booking with Unique Indexes
```typescript
// Mongoose Schema — prevents double booking at the database level
AppointmentSchema.index(
  { doctor: 1, date: 1, timeSlot: 1 },
  { unique: true }
);
```
Even under high concurrency, the database engine itself enforces this constraint — making it completely race-condition-proof.

<br/>

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) `v18` or higher
- [MongoDB](https://www.mongodb.com/) (local installation or [MongoDB Atlas](https://www.mongodb.com/atlas))
- `npm` or `yarn`

<br/>

### 1. Clone the Repository

```bash
git clone https://github.com/mahmoud-atta1/Clinic-Management-System.git
cd Clinic-Management-System
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
# ─── Server ───────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── Database ─────────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/clinic-db

# ─── Authentication ───────────────────────────────────
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
```

> ⚠️ **Never commit your `.env` file.** It is already included in `.gitignore`.

### 4. Run the Application

```bash
# Terminal 1 — Start the backend server
cd backend
npm run dev
# Server running at → http://localhost:5000

# Terminal 2 — Start the frontend
cd frontend
npm run dev
# App running at → http://localhost:3000
```

<br/>

---

## 👥 Roles & Permissions

### 👑 Admin
The Admin has full system access and is responsible for managing the entire clinic infrastructure.

- ✅ Create, update, and deactivate doctor and receptionist accounts
- ✅ View all appointments across all doctors
- ✅ Access system-wide analytics and performance metrics
- ✅ Manage clinic settings and working hours
- ❌ Cannot book appointments (patient-only action)

### 🩺 Doctor
Each doctor has a private dashboard focused on their own patients and schedule.

- ✅ View their real-time daily appointment queue
- ✅ Add, edit, and view clinical notes on patient records
- ✅ See patient visit history and consultation count
- ✅ Mark appointments as completed or cancelled
- ❌ Cannot manage other doctors' schedules or data

### 🗂️ Receptionist
The Receptionist is the operational hub of the clinic — managing day-to-day workflows.

- ✅ View and manage appointments across **all** doctors
- ✅ Handle patient check-in and walk-in registration
- ✅ Process payments — Cash or Online
- ✅ Update appointment statuses in real time
- ❌ Cannot access clinical notes or medical records

### 👤 Patient
Patients have a self-service portal for booking and tracking their own care.

- ✅ Complete a guided **3-step booking flow** (Choose Doctor → Choose Slot → Confirm)
- ✅ View all upcoming and past appointments
- ✅ Cancel appointments (subject to the 2-hour cancellation policy)
- ✅ Track appointment status (Pending → Confirmed → Completed)
- ❌ Cannot access other patients' data

<br/>

---

## 📊 Business Rules

These rules are enforced at both the API level and the database level.

```
╔══════════════════════════════════════════════════════════════╗
║                    PRICING LOGIC                             ║
╠══════════════════════════════════════════════════════════════╣
║  New Consultation   →   300 EGP                             ║
║    └─ No prior visit history required                        ║
║                                                              ║
║  Follow-up Visit    →   150 EGP                             ║
║    └─ Requires: at least 1 COMPLETED prior consultation      ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║                  CANCELLATION POLICY                         ║
╠══════════════════════════════════════════════════════════════╣
║  ✅  Allowed   →   More than 2 hours before appointment      ║
║  ❌  Blocked   →   Less than 2 hours before appointment      ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║               DOUBLE-BOOKING PREVENTION                      ║
╠══════════════════════════════════════════════════════════════╣
║  Unique Index on: [doctor_id + date + time_slot]             ║
║  Enforcement: MongoDB engine (database level)                ║
║  Result: Atomic — safe under any concurrency level           ║
╚══════════════════════════════════════════════════════════════╝
```

<br/>

---

## 🔌 API Reference

### Authentication Endpoints

```
POST   /api/v1/auth/register        Register a new user
POST   /api/v1/auth/login           Login & receive JWT cookie
POST   /api/v1/auth/logout          Clear auth cookie
GET    /api/v1/auth/me              Get current user profile
PATCH  /api/v1/auth/update-password Change password
```

### Appointment Endpoints

```
GET    /api/v1/appointments         List all appointments (Admin / Receptionist)
GET    /api/v1/appointments/my      List current user's appointments (Patient)
GET    /api/v1/appointments/:id     Get single appointment details
POST   /api/v1/appointments         Book a new appointment (Patient)
PATCH  /api/v1/appointments/:id     Update appointment status
DELETE /api/v1/appointments/:id     Cancel appointment
```

### Doctor Endpoints

```
GET    /api/v1/doctors              List all active doctors
GET    /api/v1/doctors/:id          Get doctor profile & info
GET    /api/v1/doctors/:id/slots    Get available time slots for a given date
```

### User Management (Admin only)

```
GET    /api/v1/users                List all users
POST   /api/v1/users                Create a new staff account
GET    /api/v1/users/:id            Get user by ID
PATCH  /api/v1/users/:id            Update user details
DELETE /api/v1/users/:id            Deactivate user account
```

<br/>

---

## 🤝 Contributing

Contributions, issues, and feature requests are always welcome!

1. **Fork** the repository
2. **Clone** your fork locally
   ```bash
   git clone https://github.com/your-username/Clinic-Management-System.git
   ```
3. **Create** a new feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Commit** your changes using conventional commits
   ```bash
   git commit -m "feat: add your feature description"
   ```
5. **Push** to your branch
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open** a Pull Request on GitHub

> Please make sure your code follows the existing TypeScript patterns and includes appropriate input validation.

<br/>

---

You are free to use, modify, and distribute this project for personal or commercial purposes.

<br/>

---

<div align="center">

**Built with ❤️ by [Mahmoud Atta](https://github.com/mahmoud-atta1)**

<br/>

*"Developed as a high-fidelity demonstration of a production-level medical management workflow."*

<br/>

⭐ **If you found this project useful, please consider giving it a star!** ⭐

</div>
