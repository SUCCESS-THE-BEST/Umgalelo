
# Umgalelo
 
> Umgalelo is a burial management platform for South African societies. Members can register, create or join societies and manage their finances, track contributions, process claims, coordinate events, and communicate with members.


## Table of Contents
 
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#how-to-access-umgalelo)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)


---


## Overview
 
Umgalelo is a web-based platform built to modernise how burial societies are run in South Africa. Traditionally managed through paper records, WhatsApp groups, and word of mouth, these community financial structures needed a simple, accessible digital home.
 
The platform allows society admins to manage members, track monthly contributions, process claims, schedule events, and communicate via a built-in society chat without any technical background.


## Features
 
### Member Management
- Register with email, password and South African ID number
- Join or create a burial society
- Browse available societies by province
- Log in as member, treasurer or admin

### Contributions & Payments
- Log monthly payments per member
- Track paid, pending, and late contributions
- Download contribution statements as PDF
- Send payment reminders to members

### Claims
- Submit claims with deceased details and death certificate upload
- Admin approval workflow: pending, approved, rejected, paid
- Society wallet tracks total funds collected vs claims paid

### Events & Calendar
- Add funeral and meeting events to the society calendar
- Filter by event type
- View event details in a modal

### Real-Time Chat
- Built-in society chat powered by Socket.IO
- Typing indicators
- Shows society messages per society

### Notifications
- In-app notification bell with unread count
- Notifications expiry feature
- Read and unread notifications tracking

### Auth & Security
- JWT-based authentication
- Email verification on registration
- Password reset via email link
- Google OAuth support 

---

## Tech Stack
 
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL |
| Auth | JWT + Passport.js (Google OAuth) |
| Real-time | Socket.IO |
| Email | Brevo SMTP |
| PDF Export | jsPDF + jsPDF AutoTable |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Fonts | Google Fonts (Poppins, DM Sans, Inknut Antiqua) |
| Dev Server | Nodemon |

---

## How to access Umgalelo

### Prerequisites
 
- [Node.js](https://nodejs.org/) v18 or higher
- MySQL 8+
- A Gmail account for email functionality 

### Installation
 
```bash
# Clone the repository
git clone https://github.com/SUCCESS-THE-BEST/Umgalelo.git
cd umgalelo
 
# Install dependencies
npm install
```

---

### Database Setup
 
1. Start MySQL via XAMPP Control Panel
2. Open `http://localhost/phpmyadmin`
3. Create a new database named `umgalelo`
4. Select the `umgalelo` database → click **Import**
5. Choose `umgalelo.sql` from the project root → click **Import**


---

### Environment Variables

Create a `.env` file in the project root and fill in your credentials:
 
```env

PORT=3000
 
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=umgalelo
DB_PORT=3306
 
JWT_SECRET=your_jwt_secret_here

# Brevo (formerly Sendinblue) SMTP credentials
# Get yours at https://app.brevo.com → SMTP & API
BREVO_SMTP_USER=
BREVO_SMTP_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

### Running the App
 
```bash
# Development (auto-restart on changes)
npm run dev
 
# Production
npm start
```
 
Open `http://localhost:3000` in your browser.
 
---
 
## Demo Credentials
 
| Role | Email | Password |
|---|---|---|
| Admin | sindi@admin.com | Demo1234! |
| Member | sindi@member.com | Demo1234! |
 
---

# For Contributions

## Branch Structure
- main → Final version
- test → testing branch
- each member should create their own branch

## Rules
- Do not push directly to **main**
- Work in your own branch
- Merge to **test** when your feature works

## Team
 
Built by the Umgalelo development team as part of a Development Software project.
 
> *"Umuntu ngumuntu ngabantu"* - A person is a person through other people.