# POSify - Clean & Functional Authentication API

## Overview

Ultra-clean user authentication and registration system with zero unused code and proper team management flow.

## What's Actually Used

### **Schemas (Only 5 total):**

- `loginSchema` - User login validation
- `userRegisterSchema` - User registration (step 1)
- `adminRegisterSchema` - Add team members to existing organizations
- `superAdminRegisterSchema` - System super admin
- `organizationRegisterSchema` - Organization creation (step 2)

### **API Routes:**

- `POST /api/register` - Create user (step 1)
- `POST /api/organizations/register` - Create organization (step 2)
- `POST /api/register/admin` - Add team members (admin/staff)
- `POST /api/register/super-admin` - Create super admin
- `POST /api/auth/signin` - Login (NextAuth)

## **Admin User Flow (The Main Flow)**

### **Step 1: User Registration**

```javascript
// User creates account (gets "staff" role temporarily)
const user = await fetch("/api/register", {
  method: "POST",
  body: JSON.stringify({
    name: "John Doe",
    email: "john@restaurant.com",
    password: "secure123",
    confirmPassword: "secure123",
    acceptTerms: true,
  }),
});
// Response: User with "staff" role, no organization
```

### **Step 2: User Login**

```javascript
// User logs in with their credentials
const login = await fetch("/api/auth/signin", {
  method: "POST",
  body: JSON.stringify({
    email: "john@restaurant.com",
    password: "secure123",
  }),
});
// Response: JWT session with user data
```

### **Step 3: Organization Creation**

```javascript
// User creates organization and gets promoted to admin
const org = await fetch("/api/organizations/register", {
  method: "POST",
  body: JSON.stringify({
    userId: user.data._id,
    organizationName: "John's Restaurant",
    businessType: "restaurant",
  }),
});
// Response: Organization created + User promoted to "admin" + Full permissions
```

### **Step 4: Team Management**

```javascript
// Admin can now add team members (admin/staff)
const teamMember = await fetch("/api/register/admin", {
  method: "POST",
  body: JSON.stringify({
    name: "Jane Staff",
    email: "jane@restaurant.com",
    password: "secure123",
    organizationId: org.data.organization._id,
    role: "staff", // or 'admin'
  }),
});
// Response: New team member added to organization
```

## User Roles & Permissions

### **Super Admin**

- System-wide access
- No organization restriction
- All permissions (`["*"]`)
- Can manage all organizations

### **Admin (Organization Owner)**

- Full organization access
- All permissions (`["*"]`)
- Can add/remove team members
- Can manage organization settings
- **Gets promoted from "staff" when creating organization**

### **Staff**

- Limited organization access
- Basic permissions (`[]`)
- Can perform assigned tasks
- Restricted by organization limits
- **Initial role for new registrations**

## Organization Structure

### **Default Limits (Free Plan)**

- Users: 2 (including admin)
- Menu Items: 50
- Orders per Month: 100
- Locations: 1

### **Business Types**

- Restaurant, Cafe, Bakery, Bar, Food-truck, Retail

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT-based sessions with NextAuth
- Role-based access control
- Organization-scoped data isolation
- Input validation with Zod schemas
- Consistent error handling

## Current State

- ✅ **5 schemas** instead of 50+
- ✅ **Zero unused code**
- ✅ **Clean separation** of concerns
- ✅ **Simple two-step** registration
- ✅ **Proper validation** with Zod
- ✅ **Consistent error handling**
- ✅ **Team management** ready
- ✅ **All code functional** and tested
- ✅ **Admin flow** perfectly implemented

## **Key Points:**

1. **User starts as "staff"** - Can log in immediately
2. **User logs in** - Gets session with their data
3. **User creates org** - Gets promoted to "admin" + full permissions
4. **Admin manages team** - Can add staff members
5. **Perfect separation** - User creation ≠ Organization creation

The system is ready for production use! 🚀
