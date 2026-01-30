# To-Do API Documentation

## Overview

A Node.js REST API for managing tasks with user authentication. Built with Express-like routing and MongoDB.

## Setup

```bash
npm install
```

Create a `.env` file:

```
PORT=6000
MONGODB_CONNECTION_URL=your_mongodb_url
```

Start the server:

```bash
node app.js
```

Server runs on `http://localhost:6000`

---

## Authentication

All protected routes require Basic Authentication in the header:

```
Authorization: Basic base64(username:password)
```

Example: `Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=`

---

## Routes

### 1. **User Signup**

- **Method:** `POST`
- **Route:** `/auth/signup`
- **Auth Required:** No

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "secure_password",
  "email": "john@example.com"
}
```

**Response:** `200 OK`

```
User created successfully
```

---

### 2. **User Login**

- **Method:** `POST`
- **Route:** `/auth/login`
- **Auth Required:** No

**Request Body:**

```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**Response:** `200 OK`

```json
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com"
}
```

---

### 3. **Get All Tasks**

- **Method:** `GET`
- **Route:** `/todo`
- **Auth Required:** Yes (Basic Auth)

**Response:** `200 OK`

```json
[
  {
    "_id": "task_id",
    "userId": "user_id",
    "title": "Complete project",
    "description": "Finish the to-do API",
    "status": "in-progress",
    "createdAt": "2024-01-11T11:45:00Z"
  }
]
```

---

### 4. **Create Task**

- **Method:** `POST`
- **Route:** `/todo`
- **Auth Required:** Yes (Basic Auth)

**Request Body:**

```json
{
  "title": "Complete project",
  "description": "Finish the to-do API",
  "status": "pending"
}
```

**Response:** `200 OK`

```
Task created successfully
```

---

### 5. **Update Task**

- **Method:** `PUT`
- **Route:** `/todo`
- **Auth Required:** Yes (Basic Auth)

**Request Body:**

```json
{
  "id": "task_id",
  "title": "Updated title",
  "status": "completed"
}
```

**Response:** `200 OK`

```
Task updated successfully
```

---

### 6. **Delete Task**

- **Method:** `DELETE`
- **Route:** `/todo`
- **Auth Required:** Yes (Basic Auth)

**Request Body:**

```json
{
  "id": "task_id"
}
```

**Response:** `200 OK`

```
Task deleted successfully
```

---

## Task Status Values

- `pending` (default)
- `in-progress`
- `completed`

## Error Responses

- `400` - Invalid request
- `401` - Unauthorized
- `404` - Not found
- `409` - Conflict (username exists)
- `500` - Server error
