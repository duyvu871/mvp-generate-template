# Express Web Application with Handlebars

A full-stack web application built with Express.js and Handlebars for clean server-side rendering and rapid development.

## Features

- Express.js server setup
- Handlebars templating engine
- Server-side rendering
- Responsive modern UI design
- CORS enabled
- Security headers with Helmet
- Static file serving
- Error handling
- User management example
- API endpoints

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

## Application Structure

### Pages

- **Home (/)** - Welcome page with user preview and features
- **Users (/users)** - List all users
- **User Detail (/users/:id)** - Individual user profile
- **About (/about)** - Information about the application

### API Endpoints

- `GET /api/users` - Get all users as JSON

## Project Structure

```
src/
├── index.js                 # Main application entry point
views/
├── layouts/
│   └── main.handlebars     # Main layout template
├── home.handlebars         # Homepage
├── users.handlebars        # Users list page
├── user-detail.handlebars  # User profile page
├── about.handlebars        # About page
├── 404.handlebars          # 404 error page
└── error.handlebars        # Error page
public/
├── css/
│   └── style.css           # Application styles
└── js/
    └── app.js              # Frontend JavaScript
```

## Features Overview

### Server-Side Rendering
- Handlebars templates with layouts and partials
- Helper functions for formatting and logic
- Dynamic content rendering

### Modern UI
- Responsive design that works on all devices
- Modern CSS with gradients and animations
- Clean typography and spacing
- Interactive elements

### User Management
- Sample user data and profiles
- User listing and detail views
- Profile actions and interactions

### Security
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization

## Handlebars Helpers

The application includes several custom Handlebars helpers:

- `eq` - Equality comparison
- `formatDate` - Date formatting
- `json` - JSON stringification

## Development Features

- Hot reloading with nodemon
- Static file serving
- Error pages with stack traces in development
- Console logging for debugging

## Environment Variables

- `PORT` - Port number for the server (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the application
- `npm run dev` - Run in development mode with auto-restart

## Customization

### Adding New Pages

1. Create a new Handlebars template in the `views/` directory
2. Add a route in `src/index.js`
3. Add navigation links in the main layout

### Styling

- Modify `public/css/style.css` for styling changes
- The CSS uses CSS Grid and Flexbox for layouts
- Modern CSS features like CSS variables can be added

### Adding API Endpoints

```javascript
app.get('/api/endpoint', (req, res) => {
  res.json({ message: 'Hello API' });
});
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Progressive enhancement for older browsers

## License

MIT
