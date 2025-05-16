# pet-sitter-app

A pet sitting web application that connects **pet owners** with trusted **pet sitters**, allowing for convenient and secure pet care arrangements.  
Users can register, browse sitters, book services, communicate via chat, and review their experiences.

## 📌 Project Description

This project aims to provide a reliable platform for connecting **pet owners** and **pet sitters**.  
It includes features like:

- User & Pet Sitter Authentication (Email login, validation)
- Pet Profiles & Account Management
- Pet Sitter Listings & Advanced Search
- Booking System
- Chat between owner & sitter
- Reviews & Ratings
- Secure Payment Integration (future phase)

## 🚀 Tech Stack

| Frontend     | Backend        | Database     | Styling     | Others           |
|--------------|----------------|--------------|-------------|------------------|
| Next.js      | Node.js + Express | MongoDB Atlas | Tailwind CSS | Axios, ESLint    |
| App Router   | JWT (for Auth) | Mongoose     | Custom Theme | Font: Satoshi    |

## 🧩 Features

### ✅ User Management
- Register with email, tel, and password validation
- Login / Logout
- Reset password (optional)
- Social Login (Google/Facebook - optional)

### 🐶 Pet Owner
- Dashboard for pet & booking management
- Create/update/delete pet profiles
- Search pet sitters by location & filters
- Book services with sitters
- Leave reviews & ratings
- Chat with sitters

### 🧑‍🦱 Pet Sitter
- Dashboard for schedule & booking management
- Set availability, accept/reject bookings
- Calendar view for appointments
- Withdraw earnings (future)

### 💸 Payments (Planned)
- Booking payments & sitter payouts
- View invoice & transaction history

### 🔎 Search & Filter
- Filter by pet type, rating, experience
- Map view of available sitters (optional)

## 📂 Folder Structure

bash
pet-sitter-app/
├── client/             # Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── app/
│   │   ├── styles/
│   │   ├── services/   # Axios API calls
│   │   └── fonts/      # Satoshi font
├── server/             # Node.js backend (WIP)


## 🧪 How to Run Locally

bash
# Clone project
git clone https://github.com/<your-username>/pet-sitter-app.git
cd pet-sitter-app/client

# Install dependencies
npm install

# Run development server
npm run dev

Open [http://localhost:3000](http://localhost:3000) in your browser.

![Screenshot 2025-05-13 214708](https://github.com/user-attachments/assets/e77a799f-fc61-44df-83f2-2defdc006292)




## 👨‍👩‍👧 Team Members

- Nofffie 👑 (Project Owner / Frontend / Designer)
- Member A
- Member B
- Member C
- Member D

## 📅 Current Status
- [x] Project setup with Tailwind + Satoshi font
- [x] Custom color theme configured
- [ ] Landing Page
- [ ] Auth (Register / Login)
- [ ] Dashboard (Owner / Sitter)
- [ ] Booking System
- [ ] Chat / Review
- [ ] Payment integration

## 📌 License

MIT License — for educational use under TechUp Bootcamp.
