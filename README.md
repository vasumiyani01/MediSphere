# 🏥 MediSphere — Integrated Smart Healthcare Ecosystem

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Django](https://img.shields.io/badge/Backend-Python%203%20%7C%20Django-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3%20(WAL%20Mode)-003B57?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> A modern, full-stack healthcare management portal engineered to seamlessly connect **Patients, Doctors, Pharmacies, Diagnostic Clinics, and Administrators** into one unified, secure, and real-time digital ecosystem.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Directory Structure](#-directory-structure)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Security & Authentication](#-security--authentication)
- [Contributors](#-contributors)

---

## 🌟 Overview

**MediSphere** addresses the critical fragmentation in healthcare workflows by providing a centralized operational suite. Built with high performance and accessibility in mind, it provides:
- **Patients** with seamless doctor discovery, appointment booking, disease awareness, and medicine availability checks.
- **Healthcare Providers** (Doctors & Clinics) with streamlined patient queues and digital consultations.
- **Pharmacies** with live inventory control and digital prescription fulfillment.
- **Administrators** with comprehensive verification pipelines, metrics analytics, and audit logging.

---

## 🚀 Key Features

### 👥 Multi-Stakeholder Role-Based Access Control (RBAC)
- **Citizens / Patients:** Search qualified doctors by specialization, explore licensed clinics, review medicine dosages, and report health symptoms.
- **Doctors:** Dedicated consultation workspace, schedule management, and electronic prescription generation.
- **Pharmacies:** Live pharmaceutical inventory tracking (stock levels, batch records, price index, supplier logs).
- **Admin & Governance:** User approval pipeline, helpdesk ticket management, security logs, and real-time ecosystem metrics.

### 🔐 Enterprise-Grade Authentication & Safety
- **OTP Verification via Email:** Automated 6-digit one-time password generation dispatched via Nodemailer for account registration and password resets.
- **Cryptographic Security:** Salted BCrypt password hashing and session tokens with protection against CSRF and SQL injection.
- **User Verification Workflows:** Unapproved accounts are held in a pending queue until administrative clearance.

### 💊 Medical & Pharmacy Operations
- **Symptom & Disease Knowledge Base:** Searchable directory mapping diseases to symptoms, transmission modes, and clinical recommendations.
- **Pharmaceutical Directory:** Detailed registry of drugs, categories, manufacturer details, active ingredients, and prescription prerequisites.
- **Helpdesk & Support Ticketing:** Integrated issue management system with statuses (`Pending`, `Open`, `Resolved`, `Rejected`).

---

## 🏗 System Architecture

```
                      ┌───────────────────────────────────────┐
                      │    MediSphere Client (React + Vite)   │
                      │  Tailwind CSS UI • Responsive Layout  │
                      └──────────────────┬────────────────────┘
                                         │  HTTP / REST APIs
                                         ▼
                 ┌─────────────────────────────────────────────────┐
                 │          Unified Dual Backend Architecture      │
                 ├────────────────────────┬────────────────────────┤
                 │   Node.js / Express    │     Python / Django    │
                 │  • RESTful API Engine  │   • ORM & Admin Panel  │
                 │  • Nodemailer OTP Auth │   • App Modules        │
                 │  • Helpdesk & Metrics  │   • Portal Management  │
                 └───────────┬────────────┴───────────┬────────────┘
                             │                        │
                             ▼                        ▼
                      ┌───────────────────────────────────────┐
                      │    High-Performance SQLite Database   │
                      │  WAL Mode • ACID Compliant Relational │
                      └───────────────────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, Lucide Icons |
| **Backend (Node.js)** | Node.js, Express.js, Express Session, CORS, Dotenv |
| **Backend (Python)** | Python 3, Django, Django REST Framework, Django ORM |
| **Database** | SQLite3 with WAL (Write-Ahead Logging) & Normal Synchronous Mode |
| **Security & Auth** | BCrypt.js, Nodemailer (TLS/SMTP), Session Cookies |
| **Tools & Tooling** | Git, GitHub, Postman, Vite Dev Server, Nodemon |

---

## 📁 Directory Structure

```plaintext
MediSphere/
├── accounts/                  # Django authentication and user profiles module
├── citizens/                  # Citizen & patient portal modules
├── custom_admin/              # Administrative control center & reporting
├── diseases/                  # Clinical diseases directory & symptom mapping
├── doctors/                   # Doctor profiles, schedules & consultation workflows
├── medicines/                 # Pharmaceutical inventory management module
├── pharmacies/                # Pharmacy registration & distribution management
├── portal/                    # Main web portal application
│   ├── frontend/              # Modern React.js (Vite) single-page client
│   │   ├── src/
│   │   │   ├── components/    # Reusable UI modules (Doctors, Clinics, Medicines, etc.)
│   │   │   ├── App.jsx        # Root application layout & state routing
│   │   │   └── main.jsx       # React entry point
│   │   ├── index.html         # HTML5 root template
│   │   ├── package.json       # Frontend dependencies
│   │   └── vite.config.js     # Vite compilation & proxy configuration
│   ├── static/                # Static assets (stylesheets, branding images)
│   └── templates/             # Django HTML templates
├── MediSphere/                # Core Django project configuration (settings, WSGI, URLs)
├── db.sqlite3                 # Production-grade relational database
├── manage.py                  # Django administrative executable
├── server.js                  # Production Node.js / Express API microservice
├── package.json               # Backend Node.js service dependencies
└── README.md                  # Comprehensive project documentation
```

---

## 🔌 API Endpoints Reference

### Authentication & Account Service
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/accounts/send-otp/` | Generate and dispatch 6-digit verification OTP |
| `POST` | `/api/accounts/verify-otp/` | Validate OTP for new user registration |
| `POST` | `/api/accounts/register/` | Register new account with hashed credentials |
| `POST` | `/api/accounts/login/` | Authenticate user and initiate session |
| `GET` | `/api/accounts/logout/` | Terminate session and clear authentication |
| `GET` | `/api/accounts/user-status/` | Fetch session metadata for active user |
| `POST` | `/api/accounts/forgot-password/` | Trigger password recovery OTP workflow |

### Inventory & Clinical Directory
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/backend/api/diseases/` | Retrieve disease encyclopedia & clinical advisory |
| `GET` | `/backend/api/medicines/` | Fetch full catalog of pharmaceutical products |
| `POST` | `/backend/api/medicines/add/` | Add new medicine entry to active inventory |
| `POST` | `/backend/api/medicines/edit/:id/` | Update medicine dosage, pricing, and stock details |
| `POST` | `/backend/api/medicines/delete/:id/` | Remove medicine listing from inventory |

### Admin & Helpdesk Operations
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/backend/api/metrics/` | Fetch real-time KPI counts (Users, Doctors, Medicines) |
| `GET` | `/backend/api/pending-verifications/` | List pending user accounts requiring approval |
| `POST` | `/backend/api/approve-user/:userId/` | Grant verified status to healthcare provider |
| `GET` | `/backend/api/logs/` | Access system audit trail & activity history |
| `POST` | `/api/accounts/helpdesk/send/` | Submit a new helpdesk support inquiry |
| `POST` | `/backend/api/helpdesk/resolve/:ticketId/` | Mark support ticket as resolved |

---

## ⚡ Getting Started

### Prerequisites
Make sure you have the following installed on your workstation:
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (v3.10 or higher) & **pip**
- **Git**

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vasumiyani01/MediSphere.git
   cd MediSphere
   ```

2. **Install Node.js Backend Dependencies:**
   ```bash
   npm install
   ```

3. **Install React Frontend Dependencies:**
   ```bash
   cd portal/frontend
   npm install
   cd ../..
   ```

4. **Install Python / Django Requirements (Optional for Django Engine):**
   ```bash
   pip install django django-cors-headers
   ```

---

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=8000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password
SESSION_SECRET=your_super_secret_session_key
```

> **Note:** For Gmail, generate an **App Password** from your Google Security console to allow secure SMTP dispatch.

---

### Running the Application

#### Option A: Running with the Node.js Express Server + React Vite Client

1. **Start the API Backend Server:**
   ```bash
   # From root folder
   npm run dev
   # Server runs on http://localhost:8000
   ```

2. **Launch the React Frontend Client:**
   ```bash
   cd portal/frontend
   npm run dev
   # Web portal accessible at http://localhost:5173
   ```

#### Option B: Running with the Django Server
```bash
python manage.py migrate
python manage.py runserver 8000
```

---

## 🔒 Security & Authentication

- **SQL Injection Prevention:** Parametrized SQL queries across all Express database connectors.
- **Password Security:** Multi-round BCrypt cryptographic salt-and-hash encryption.
- **Session Protection:** Secure cookie management with configurable domain scope and session timeouts.
- **Data Integrity:** SQLite WAL mode ensures database resilience during concurrent read/write operations.

---

## 🤝 Contributors

- **Vasu Miyani** ([@vasumiyani01](https://github.com/vasumiyani01)) — Full-Stack Architecture & Module Design
- **Mayank Rojesara** ([@mayank122340](https://github.com/mayank122340)) — Full-Stack Development, APIs & Cloud Integration
