# TaskFlow

TaskFlow is a full-stack todo application built with React, TanStack Query, Express, and MongoDB. It supports creating, editing, deleting, searching, and filtering todos by completion status.

## Features

- Create todos
- Edit todo titles
- Mark todos as active or completed
- Delete todos
- Search todos by title
- Filter todos by All, Active, or Completed status
- Refresh todo data manually
- Debounced server-side search with immediate client-side filtering

## Project Structure

```text
client/             React + Vite frontend
  src/App.jsx       Main application component
  src/services/     API client functions
server/             Express + MongoDB backend
  server.js         API server entry point
  routes/           Todo API routes
  models/           Mongoose models
  config/           Database connection
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database, local or MongoDB Atlas

## Setup

1. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

2. Install backend dependencies:

   ```bash
   cd ../server
   npm install
   ```

3. Create `server/.env` with your MongoDB connection string:

   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

   Keep this file private. It is ignored by Git.

## Run The Application

Start the backend in one terminal:

```bash
cd server
node server.js
```

Start the frontend in a second terminal:

```bash
cd client
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

The API runs at `http://localhost:5000/api/todos`.

## Client Commands

Run these from the `client` directory:

```bash
npm run dev       # Start the Vite development server
npm run build     # Create a production build
npm run lint      # Run ESLint
npm run preview   # Preview the production build
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/todos` | Return todos, optionally filtered by `search` and `status` |
| `POST` | `/api/todos` | Create a todo with a `title` |
| `PUT` | `/api/todos/:id` | Update a todo's `title` and `completed` state |
| `DELETE` | `/api/todos/:id` | Delete a todo |

Example filtered request:

```text
GET /api/todos?search=buy&status=active
```

Valid status values are `all`, `active`, and `completed`.
