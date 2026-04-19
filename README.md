# 🏥 Professional Clinic Management System

A production-ready Clinic & Appointment Management System designed for a multi-doctor facility. This project features a robust role-based dashboard system, dynamic scheduling, and automated billing logic.

## 🚀 Key Features

### 🔐 Advanced Security & Auth
- **Role-Based Access Control (RBAC)**: Distinct workflows for Admin, Doctor, Receptionist, and Patient.
- **Smart Validation**: Full input validation using **Joi** to ensure data integrity.
- **Secure Persistence**: JWT-based authentication with HTTP-only cookies and bcrypt hashing.

### 📅 Intelligent Appointment Workflow
- **Concurrency Protection**: Atomic slot booking using MongoDB Unique Indexes to prevent double-booking.
- **Business Rule Enforcement**: 
  - Patients can only cancel appointments up to 2 hours before the session.
  - **Consultation vs Follow-up Logic**: Automated pricing (300 EGP for New / 150 EGP for Follow-up).
  - **History Verification**: Follow-up booking is restricted unless a primary consultation was previously completed.

### 🏢 Multi-Role Dashboards
- **Admin**: Strategic overview, personnel onboarding, and system-wide management.
- **Doctor**: Real-time daily queue, patient statistics, and clinical notes management.
- **Receptionist**: Centralized command center for all doctors, check-in management, and payment reconciliation (Cash/Online).
- **Patient**: Seamless 3-step booking journey, status tracking, and medical history.

## 🛠️ Technical Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose).
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS (UI), Framer Motion.
- **Utilities**: Dayjs, Joi, JWT, Axios, Lucide React.

## 📐 Architecture Highlights
- **Module-based Design**: Each feature set (Appointment, User, Doctor) is its own self-contained module for scalability.
- **ApiFeatures Utility**: A powerful backend helper for dynamic filtering, searching, and pagination across any resource.
- **Unified Error Handling**: A centralized global error middleware that transforms complex DB errors into user-friendly messages.

## 🚦 Getting Started

1. **Clone & Install**: `npm install` in both root and `client`.
2. **Environment**: Configure `.env` with `MONGO_URI` and `JWT_SECRET`.
3. **Run Dev**: `npm run dev` for backend, `cd client && npm run dev` for frontend.

---
*Developed as a high-fidelity demonstration of a production-level medical management workflow.*
