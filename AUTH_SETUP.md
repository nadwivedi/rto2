# RTO Admin Panel - Authentication Setup Guide

## Overview
This guide explains how to set up and use the authentication system for the RTO Admin Panel.

## Features
- ✅ Login-only authentication (no public signup)
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ Admin creation script
- ✅ Automatic token verification
- ✅ Logout functionality

---

## 🚀 Quick Setup

### 1. Install Dependencies

The required packages (`bcryptjs` and `jsonwebtoken`) have already been installed in the backend.

### 2. Environment Variables (Optional)

Add to `backend/.env`:
```env
JWT_SECRET=your-super-secret-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/rto
```

If not set, defaults will be used.

---

## 👨‍💼 Creating Admin Users

### On Local Machine

```bash
cd backend
node scripts/createAdmin.js
```

### On VPS/Server

```bash
cd /path/to/rto/backend
node scripts/createAdmin.js
```

### Interactive Prompts

The script will ask for:
1. **Admin Name**: Full name of the admin
2. **Username**: Login username (will be converted to lowercase)
3. **Email**: Admin email address
4. **Password**: Secure password (minimum 6 characters)
5. **Confirm Password**: Confirm the password

### Example:
```
=== Create New Admin User ===

Enter admin name: John Doe
Enter username: admin
Enter email: admin@rto.com
Enter password: ******
Confirm password: ******

✅ Admin user created successfully!

Admin Details:
---------------
Name: John Doe
Username: admin
Email: admin@rto.com
Role: admin

You can now login with these credentials.
```

---

## 🔐 Login System

### Login Page
- Access the login page at: `http://localhost:5173/login`
- Enter your username and password
- Click "Sign In"

### After Login
- You'll be redirected to `/dashboard`
- A JWT token is stored in localStorage
- All admin routes are now accessible

### Logout
- Click the "Logout" button in the navigation bar
- Token is removed from localStorage
- Redirected to login page

---

## 🛡️ Protected Routes

All admin panel routes are protected and require authentication:
- `/dashboard` - Main dashboard (Driving License page)
- `/vehicle-registration` - Vehicle Registration
- `/national-permit` - National Permit
- `/cg-permit` - CG Permit
- `/temporary-permit` - Temporary Permit
- `/fitness` - Fitness Certificate
- `/insurance` - Insurance
- `/dealer-bill` - Dealer Bill
- `/setting` - Settings
- And all other admin routes...

If not authenticated, users are automatically redirected to `/login`.

---

## 🔧 Technical Details

### Backend Structure

#### Models
- `backend/models/Admin.js` - Admin user model with password hashing

#### Controllers
- `backend/controllers/authController.js` - Login, verify, logout logic

#### Middleware
- `backend/middleware/auth.js` - JWT token verification

#### Routes
- `backend/routes/auth.js` - Authentication endpoints
  - `POST /api/auth/login` - Login endpoint
  - `GET /api/auth/verify` - Verify token
  - `POST /api/auth/logout` - Logout endpoint

### Frontend Structure

#### Pages
- `admin/src/pages/Login.jsx` - Login page component

#### Context
- `admin/src/context/AuthContext.jsx` - Authentication state management

#### Components
- `admin/src/components/ProtectedRoute.jsx` - Route protection wrapper

---

## 🔄 API Endpoints

### Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "...",
      "username": "admin",
      "email": "admin@rto.com",
      "name": "John Doe",
      "role": "admin"
    }
  }
}
```

### Verify Token
```http
GET http://localhost:5000/api/auth/verify
Authorization: Bearer <token>
```

### Logout
```http
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <token>
```

---

## 🔒 Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds = 10
2. **JWT Tokens**: Tokens expire after 7 days
3. **Token Verification**: Every request verifies the JWT token
4. **Protected Routes**: Frontend routes protected with ProtectedRoute component
5. **Account Status**: Admins can be deactivated (isActive flag)
6. **Last Login Tracking**: Tracks last login timestamp

---

## 📝 Admin Management

### Admin Fields
- `username`: Unique username (lowercase)
- `email`: Unique email address
- `password`: Hashed password
- `name`: Full name
- `role`: 'admin' or 'super_admin'
- `isActive`: Boolean to enable/disable account
- `lastLogin`: Timestamp of last login
- `createdAt`: Account creation timestamp
- `updatedAt`: Last updated timestamp

---

## 🐛 Troubleshooting

### "Invalid credentials" error
- Check if username and password are correct
- Ensure the admin user exists in the database
- Verify MongoDB connection

### "Token has expired" error
- Login again to get a new token
- Tokens expire after 7 days

### Cannot create admin user
- Check MongoDB connection
- Ensure username/email is unique
- Password must be at least 6 characters

### Redirected to login after refresh
- Check if token is stored in localStorage
- Verify backend server is running
- Check browser console for errors

---

## 🚀 Deployment Notes

### On VPS

1. **Create Admin User:**
```bash
cd /var/www/rto/backend
NODE_ENV=production node scripts/createAdmin.js
```

2. **Set Environment Variables:**
```bash
# In /var/www/rto/backend/.env
JWT_SECRET=your-very-secure-secret-key-min-32-characters
MONGODB_URI=mongodb://localhost:27017/rto
```

3. **Restart Backend:**
```bash
pm2 restart rto-backend
```

---

## ✅ Testing the Setup

1. **Create an admin user** using the script
2. **Start the backend** server (`npm run dev` in backend folder)
3. **Start the frontend** server (`npm run dev` in admin folder)
4. **Visit** `http://localhost:5173` (should redirect to `/login`)
5. **Login** with your credentials
6. **Verify** you're redirected to dashboard and can access all pages
7. **Test logout** functionality

---

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Check the backend server logs
3. Verify MongoDB is running and connected
4. Ensure all dependencies are installed

---

**Last Updated**: December 2024
**Version**: 1.0.0
