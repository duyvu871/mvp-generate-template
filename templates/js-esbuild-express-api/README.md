# Express API Application with ESBuild

A RESTful API built with Express.js and ESBuild for fast development and production builds.

## Features

- Express.js server setup
- ESBuild for fast bundling
- RESTful API endpoints
- CORS enabled
- Security headers with Helmet
- Error handling middleware
- JSON request/response handling
- Basic CRUD operations for users
- Development with watch mode
- Production builds with minification

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

#### Development mode (with watch):
```bash
npm run dev
```

#### Build for production:
```bash
npm run build:prod
```

#### Run production build:
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
dist/
├── index.js                # Built application (generated)
esbuild.config.mjs          # ESBuild configuration
```

## Environment Variables

- `PORT` - Port number for the server (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the built application
- `npm run dev` - Run in development mode with watch
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with minification

## License

MIT
