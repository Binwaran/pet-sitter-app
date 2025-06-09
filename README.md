# 🐾 Pet Sitter App

A full-stack web application that connects pet owners with trusted pet sitters for reliable, secure, and convenient pet care. The platform supports real-time messaging, booking management, sitter availability, and more.

## 📌 Project Overview

This project was built as part of the **TechUp Bootcamp Final Project**, designed to simulate a real-world full-stack SaaS product. It supports both pet owners and sitters with features like:

* Email/password login
* Pet profile management
* Pet sitter discovery via filters
* Booking and schedule handling
* Real-time chat
* Reviews & ratings system
* (Coming soon) Payment & sitter payouts

## 🔧 Tech Stack

| Frontend             | Backend           | Database            | Styling      | Others                    |
| -------------------- | ----------------- | ------------------- | ------------ | ------------------------- |
| Next.js (App Router) | Node.js + Express | Supabase (Postgres) | Tailwind CSS | Clerk Auth, Satoshi Font  |
| TypeScript           | RESTful API       | Supabase Realtime   | Custom Theme | Supabase Storage (images) |

---

## 🧩 Core Features

### 👤 Authentication & User Roles

* Email/password authentication via Clerk
* Separate roles for Pet Owners and Pet Sitters
* Dashboard routing based on user role

### 🐕 Pet Owner

* Create/update/delete pet profiles
* Browse and search sitters by filters
* Book available sitters
* Leave reviews and ratings
* Real-time chat with sitters

### 👩‍⚕️ Pet Sitter

* Create profile with availability and experience
* Manage bookings (Accept/Reject)
* Set holidays/unavailable days
* View calendar with upcoming appointments
* (Future) Withdraw earnings

### 💬 Messaging System

* Real-time chat between owner and sitter
* Chat list with unread count
* Upload images in chat
* Message scrollback (infinite load)

### 📆 Booking System

* Time-slot based booking (1+ hr min)
* Unavailable time blocks for confirmed bookings
* Automatic blocking on sitter’s holiday
* Booking modal with validation and error handling

### 🔍 Advanced Search & Filter

* Search by keyword
* Filter by pet type, rating, experience
* Mobile + Desktop friendly filter UI

---

## 🗂 Folder Structure

```
pet-sitter-app-dev/
├── client/               # Next.js Frontend
│   ├── app/              # App Router pages
│   ├── components/       # Reusable components
│   ├── services/         # Supabase/Clerk helpers
│   ├── styles/           # Tailwind config & global styles
│   ├── public/assets/    # Icons & illustrations
│   └── middleware.js     # Clerk middleware
├── server/ (optional)    # For future Node.js/Express backend
```

---

## 🧪 Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/pet-sitter-app-dev.git
cd pet-sitter-app-dev/client

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Visit in browser
http://localhost:3000
```

---

## 🖼️ Screenshots

(Include key screenshots such as: landing page, dashboard, booking modal, chat window)

---

## 👩‍💻 Team Members

* **Nofffie (Binwaran)** – Product Owner, Frontend Dev, UI/UX, Project Lead
* **Earth (MisaterE)** – Backend & Database
* **Tin (Tin.Tnk)** – Realtime Messaging
* **Big (B1GOT)** – Booking Logic
* **Mac (wutt S)** – Search & Filter

---

## 📅 Project Status

* ✅ Initial Setup + Tailwind Theme
* ✅ Auth System with Clerk
* ✅ Pet Sitter Profile & Dashboard
* ✅ Booking Modal with Validation
* ✅ Realtime Chat with Images
* 🚧 Payment Integration (Next Phase)
* 🚧 Notifications & Email (Planned)

---

## 📜 License

MIT License — built for educational purposes under TechUp Bootcamp 🚀
