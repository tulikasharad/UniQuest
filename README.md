# UniQuest

**UniQuest** is a full-stack student opportunity and notice platform built using the **MERN stack**.

The platform helps students discover and share opportunities such as internships, hackathons, events, academic updates, club announcements, and project opportunities in one place.

## Features

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Create opportunity/notice posts
- View all posts
- Edit your own posts
- Delete your own posts
- Like/unlike posts
- Search posts by title and description
- Filter posts by category
- Deadline support for posts
- User ownership and permission control
- Form validation
- Loading states
- Empty states
- Error handling
- Responsive user interface
- MongoDB Atlas database

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

### Database
- MongoDB Atlas

## Project Structure

```text
UniQuest/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── ...
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Like.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── posts.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── package.json
└── README.md


```
## Architecture

```text
React Frontend
       │
       │ HTTP Requests
       ▼
Express.js REST API
       │
       ▼
Mongoose
       │
       ▼
MongoDB Atlas
```
## Authentication flow
```text
Register/Login
      │
      ▼
Express API
      │
      ▼
Password verification
      │
      ▼
JWT Token
      │
      ▼
React Frontend
      │
      ▼
Authenticated API Requests
```
## Database Structure

The application uses MongoDB Atlas with the following main collections:

### Users

Stores registered user information.
users
├── name
├── email
├── password
└── createdAt
Passwords are hashed using bcrypt before being stored.

### Posts

Stores opportunities and notices created by users.
posts
├── title
├── description
├── category
├── deadline
├── userId
├── authorName
└── createdAt

### Likes

Stores likes made by users on posts.
likes
├── userId
└── postId

## Authentication

UniQuest uses JWT authentication.

- A user registers with their name, email, and password.
- The password is hashed using bcrypt.
- The user logs in using their credentials.
- The backend generates a JWT token.
- The frontend uses the token for protected requests.
- Protected actions such as creating, editing, deleting, and liking posts require authentication.
## Authorization

Users can only edit or delete posts that they created.

The backend checks the authenticated user's ID against the post owner's ID before allowing edit or delete operations.

This prevents users from modifying or deleting posts belonging to other users.