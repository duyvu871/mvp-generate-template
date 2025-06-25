# Express API Application with TypeScript

A RESTful API built with Express.js and TypeScript for type safety and better development experience.

## Features

- Express.js server setup
- TypeScript for type safety
- RESTful API endpoints with typed responses
- CORS enabled
- Security headers with Helmet
- Error handling middleware
- JSON request/response handling
- Basic CRUD operations for users
- Type definitions for API models

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

#### Development mode (TypeScript directly):
```bash
npm run dev
```

#### Build and run:
```bash
npm run build
npm start
```

#### Type checking only:
```bash
npm run typecheck
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
├── index.ts                 # Main application entry point
├── types/
│   └── index.ts            # Type definitions
├── routes/
│   └── api.ts              # API routes with types
└── middleware/
    └── errorHandler.ts     # Error handling middleware
dist/                       # Compiled JavaScript output
tsconfig.json               # TypeScript configuration
```

## Type Definitions

### User Interface
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}
```

### API Response Interface
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
```

## Environment Variables

- `PORT` - Port number for the server (default: 3000)

## Scripts

- `npm start` - Run the compiled application
- `npm run dev` - Run TypeScript directly with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm run typecheck` - Check types without compilation

## License

MIT
