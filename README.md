# 🏦 Mini Bank Web App

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://mini-bank-web-app-1dt5.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-13AA52?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.8-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 🔗 Quick Links

| 🌐 Live Demo | 📂 Repository |
|---|---|
| [https://mini-bank-web-app-1dt5.vercel.app](https://mini-bank-web-app-1dt5.vercel.app) | [GitHub](https://github.com/saturnarians/mini-bank-web-app) |

---

## 📝 Overview

Mini Bank Web App is a TypeScript-based banking application built with Next.js and React. It features user authentication, account management, and basic transaction processing with role-based access control.

---

## ✅ Implemented Features

### 🔐 **Authentication & Authorization**
- User registration with email verification (OTP-based)
- User login with JWT authentication
- Role-based access control (User, Admin, SuperAdmin roles)
- Password hashing with bcryptjs
- Protected routes and authentication middleware
- Transaction PIN support

### 👤 **User Management**
- User registration with account type selection (Checking, Savings, Investment)
- User profile management (name, email, phone, address)
- User details update functionality
- Multiple user roles with hierarchical relationships

### 💳 **Account Management**
- Create and manage bank accounts (Checking, Savings, Investment types)
- View account details and balances
- Account status tracking (Active, Pending, Closed, Suspended)
- Account activity logging

### 💰 **Transaction Features**
- Internal fund transfers between accounts
- Transaction history tracking
- Running balance calculations
- Transaction status management (Pending, Approved, Completed, Rejected)
- Transaction descriptions and metadata
- External transfer form (UI component - backend integration in progress)

### 📊 **Admin Panel**
- Admin account management interface
- View and manage user accounts
- System logs page (placeholder for audit data)
- Admin action logging capability

### 🎨 **User Interface**
- Responsive dashboard for users
- Navigation system with role-based routing
- Form validation with React Hook Form + Zod
- Radix UI components for accessibility
- Tailwind CSS styling
- Login and registration pages
- Profile/settings pages
- Account and transaction management UI

### 📧 **Email Integration**
- Email verification system with OTP
- Resend API integration configured
- Email notification setup ready

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|---|
| **Frontend** | Next.js 16.1, React 19.2, TypeScript 5.0 |
| **Styling** | Tailwind CSS 4.1 |
| **UI Components** | Radix UI, custom components |
| **Forms** | React Hook Form + Zod validation |
| **State Management** | Redux Toolkit |
| **Backend** | Next.js API routes |
| **Database** | MongoDB + Prisma 5.8 ORM |
| **Authentication** | JWT (jose), bcryptjs |
| **Email** | Resend API, Nodemailer |
| **Hosting** | Vercel |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB account (Atlas free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saturnarians/mini-bank-web-app.git
   cd mini-bank-web-app
