# B2B SaaS Collaboration Workspace

A modern real-time collaboration platform built with the MERN stack, featuring secure authentication, workspace management, team channels, and live messaging powered by Socket.IO.

## Features

### Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Persistent Sessions
- Secure Password Hashing (bcrypt)

### Workspace Management
- Create Workspaces
- View Workspaces
- Delete Workspaces
- Join Existing Workspaces
- Workspace Membership

### Channels
- Create Channels
- Delete Channels
- Channel List
- Workspace-based Organization

### Real-Time Collaboration
- Real-Time Messaging
- Online Presence
- Typing Indicators
- Read Receipts
- Automatic Reconnection
- Optimistic UI Updates

### Chat
- Message History
- Real-Time Updates
- Unread Message Counts
- Channel-based Conversations

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Context API
- Socket.IO Client

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB Atlas
- Mongoose
- JWT
- bcrypt
- Zod
- Socket.IO

---

# Project Structure

```
client/
    src/
        components/
        contexts/
        hooks/
        lib/
        pages/
        services/
        types/

server/
    src/
        config/
        middleware/
        modules/
            auth/
            workspace/
            channel/
            message/
        socket/
        shared/
```

---

# Architecture

The application follows a feature-based architecture.

Each module contains its own:

- Routes
- Controller
- Service
- Validation
- Types
- Models (where applicable)

Business logic is kept inside services while controllers remain thin.

Socket.IO events are separated from REST APIs to keep the application modular and maintainable.

---

# Installation

## Clone

```bash
git clone https://github.com/<your-username>/<repo-name>.git
```

## Install dependencies

### Client

```bash
cd client
npm install
```

### Server

```bash
cd server
npm install
```

---

# Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173
```

---

# Run Development

Backend

```bash
cd server
npm run dev
```

Frontend

```bash
cd client
npm run dev
```

---

# Build

Backend

```bash
npm run build
```

Frontend

```bash
npm run build
```

---

# Current Functionality

- Secure Authentication
- Workspace CRUD
- Join Workspace
- Channel Management
- Real-Time Messaging
- User Presence
- Typing Indicators
- Read Receipts
- Automatic Socket Reconnection

---

# Future Enhancements

- File Sharing
- User Roles & Permissions
- Workspace Invitations
- Emoji Reactions
- Message Editing
- Message Deletion
- Notifications
- Search
- Voice & Video Calling

---

# Author

**Romana Parkar**

GitHub: https://github.com/<your-username>

LinkedIn: https://linkedin.com/in/<your-linkedin>
