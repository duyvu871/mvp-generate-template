# Express API Application

A RESTful API built with Express.js featuring CRUD operations, middleware, and error handling.

## Features

- Express.js server setup
- RESTful API endpoints
- CORS enabled
- Security headers with Helmet
- Error handling middleware
- JSON request/response handling
- Basic CRUD operations for users

## Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

### Running the Application

#### Development mode (with auto-restart):
```bash
npm run dev
```

#### Production mode:
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints

#### General
- `GET /` - Welcome message and available endpoints
- `GET /health` - Health check endpoint

#### Users API
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user by ID
- `DELETE /api/users/:id` - Delete user by ID

### Request/Response Examples

#### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "User created successfully"
}
```

## Project Structure

```
src/
├── index.js                 # Main application entry point
├── routes/
│   └── api.js              # API routes
└── middleware/
    └── errorHandler.js     # Error handling middleware
```

## Environment Variables

- `PORT` - Port number for the server (default: 3000)

## Scripts

- `npm start` - Run the application
- `npm run dev` - Run in development mode with auto-restart

## License

MIT
