# 🔐 Sara7a App

A secure anonymous messaging platform built with **Node.js**, **Express.js**, and **MongoDB**. Users can receive anonymous messages through a shareable profile link — with full authentication, OTP verification, and role-based access control.

---

## ✨ Features

### 🔑 Authentication
- Signup & Login with email/password
- **Google OAuth 2.0** (signup & login via Gmail)
- Email confirmation via **6-digit OTP** (expires in 2 minutes)
- OTP brute-force protection — locked for 5 minutes after 5 failed attempts
- Forgot password flow: send OTP → verify → reset
- JWT **Access Token + Refresh Token** architecture
- Token revocation on logout

### 👤 User Management
- Get & update profile (name, phone, gender)
- Upload profile picture & cover images via **Cloudinary**
- Phone number **encrypted at rest** (AES encryption)
- Freeze / restore / hard-delete accounts
- Admin can freeze or delete any user account
- Share public profile via `/users/:userId/profile`

### 💬 Messages
- Send anonymous messages to any user (no auth required)
- Attach up to **2 images** per message (uploaded to Cloudinary)
- Owner can view, freeze, and hard-delete their messages
- Hard delete only allowed after freezing

---

## 🛠 Tech Stack

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)
![Google OAuth](https://img.shields.io/badge/Google_OAuth-4285F4?style=flat&logo=google&logoColor=white)
![Joi](https://img.shields.io/badge/Joi-0080FF?style=flat)
![Nodemailer](https://img.shields.io/badge/Nodemailer-22B573?style=flat)

---

## 📁 Project Structure

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js   # Routes
│   │   ├── auth.service.js      # Business logic
│   │   └── auth.validation.js   # Joi schemas
│   ├── user/
│   │   ├── user.controller.js
│   │   ├── user.service.js
│   │   └── user.validation.js
│   └── message/
│       ├── message.controller.js
│       ├── message.service.js
│       └── message.validation.js
├── db/
│   └── models/                  # Mongoose models
├── middleware/
│   ├── auth.middleware.js        # Authentication & Authorization
│   └── validation.middleware.js # Joi validation middleware
└── utils/
    ├── security/                 # JWT, hashing, encryption
    ├── email/                    # Nodemailer + templates
    └── multer/                   # Local & Cloudinary upload
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB
- Cloudinary account
- Google OAuth credentials

### Installation

```bash
git clone https://github.com/MohamedSalah50/saraha-app.git
cd saraha-app
npm install
```

### Environment Variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/saraha

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRATION=1d
REFRESH_TOKEN_EXPIRATION=7d

# Google OAuth
CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_ID=your_google_client_id

# Encryption
ENCRYPTION_KEY=your_encryption_key

# Email (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_api_key
CLOUD_API_SECRET=your_api_secret
```

### Run

```bash
# Development
npm run dev

# Production
npm start
```

---

## 📮 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register with email | ❌ |
| POST | `/auth/login` | Login with email | ❌ |
| POST | `/auth/signupWithGmail` | Register with Google | ❌ |
| POST | `/auth/loginWithGmail` | Login with Google | ❌ |
| PATCH | `/auth/confirmEmail` | Verify OTP | ❌ |
| PATCH | `/auth/forgot-password` | Send reset OTP | ❌ |
| PATCH | `/auth/verifyForgotCode` | Verify reset OTP | ❌ |
| PATCH | `/auth/resetForgetPassword` | Reset password | ❌ |

### User
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/` | Get my profile | ✅ |
| GET | `/users/:userId/profile` | View public profile | ❌ |
| PATCH | `/users/updatePassword` | Change password | ✅ |
| PATCH | `/users/updateBasicProfile` | Update name/phone/gender | ✅ |
| PATCH | `/users/image` | Upload profile picture | ✅ |
| PATCH | `/users/profile-cover-images` | Upload cover images | ✅ |
| GET | `/users/refreshToken` | Get new access token | ✅ Refresh |
| DELETE | `/users/{:userId}/freeze` | Freeze account | ✅ |
| PATCH | `/users/{:userId}/restore` | Restore account | ✅ |
| DELETE | `/users/{:userId}/hard` | Hard delete account | ✅ Admin |
| POST | `/users/logout` | Logout & revoke token | ✅ |

### Messages
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/messages/:recieverId` | Send anonymous message | ❌ |
| GET | `/messages/:messageId` | Get message by ID | ✅ |
| DELETE | `/messages/:messageId/freeze` | Freeze message | ✅ |
| DELETE | `/messages/:messageId/hardDelete` | Hard delete message | ✅ |

---

## 🔒 Security Highlights

- Passwords hashed with **bcrypt**
- Phone numbers **AES-encrypted** at rest
- OTP brute-force protection (5 attempts → 5 min ban)
- OTP expires after **2 minutes**
- JWT token revocation on logout via **RevokeToken model**
- Role-based access control (user / admin)
- Joi validation on all inputs

---

## 📬 Postman Collection

> Test all endpoints with the published collection:

[![Postman](https://img.shields.io/badge/Postman-Collection-FF6C37?style=flat&logo=postman&logoColor=white)](https://documenter.getpostman.com/view/42944447/2sB34ijzWW)

---

## 📄 License

MIT © [Mohamed Salah](https://github.com/MohamedSalah50)
