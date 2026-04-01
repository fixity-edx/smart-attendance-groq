# Smart Attendance & Leave Management System ✅
Groq AI + JWT Auth + RBAC + Neumorphism UI

✅ React (Vite) + TailwindCSS (Neumorphism / Soft UI)  
✅ Node.js + Express + MongoDB Atlas  
✅ AI: Groq generates attendance summary report + leave request message  
✅ Security: JWT, bcrypt, RBAC, validation, sanitization, Helmet, rate-limit, optional CSRF  

---

## Folder Structure
```
smart-attendance-groq-rbac/
  frontend/
  backend/
  README.md
```

---

# Features

## Student
- Log attendance (once per day)
- Submit leave request (AI leave message auto generated)
- View attendance logs + leave status

## Admin
- Approve / Reject leave requests
- AI attendance summary report (auto regenerated whenever attendance/leave changes)

## Optional
- Attendance analytics (percentage)
- Optional email notifications via Resend

---

# 1) Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend: `http://localhost:5000`

Fill `.env`:
- `MONGODB_URI`
- `JWT_SECRET`
- `GROQ_API_KEY`

---

# 2) Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

---

# RBAC - Create Admin
All signups are created as `role=student`.

Make admin:
MongoDB Atlas → `users` collection → change role:
```json
"role": "admin"
```

Login again → admin dashboard enabled.

---

# Groq AI Setup
From console.groq.com:
```
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
```

---

# Deployment (Free Tier)

## Backend → Render
- Root: `backend`
- Build: `npm install`
- Start: `npm start`

## Frontend → Vercel
- Root: `frontend`
- Env var:
```
VITE_API_BASE_URL=https://<render-backend-url>
```

---

# Security Notes (for Viva)
- bcrypt hashing
- JWT + token expiry
- logout invalidation (blacklist TTL)
- helmet
- rate limiter
- validation + sanitization
- optional CSRF (`ENABLE_CSRF=1`)
- HTTPS-ready

---

## Author
Final Year BTech Mini Project - Smart Attendance System
