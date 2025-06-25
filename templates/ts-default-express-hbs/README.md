# Express + Handlebars (TypeScript)

A full-stack web application template using Express.js, Handlebars templating engine, and TypeScript for type safety.

## Features

- **Express.js** - Fast and minimal web framework
- **Handlebars** - Powerful templating engine with layouts and partials
- **TypeScript** - Type safety and modern JavaScript features
- **Modern UI** - Responsive design with gradient backgrounds and animations
- **Security** - Helmet.js for security headers and CORS protection
- **SEO Friendly** - Server-side rendering with proper meta tags
- **Error Handling** - Custom 404 and error pages
- **Static Assets** - CSS and JavaScript optimization

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

#### Type checking only:
```bash
npm run typecheck
```

## Project Structure

```
src/
├── index.ts              # Main application entry point
views/
├── layouts/
│   └── main.handlebars   # Main layout template
├── home.handlebars       # Home page template
├── users.handlebars      # Users listing page
├── user-detail.handlebars # User profile page
├── about.handlebars      # About page
├── 404.handlebars        # 404 error page
└── error.handlebars      # General error page
public/
├── css/
│   └── style.css         # Main stylesheet
└── js/
    └── app.js            # Frontend JavaScript
dist/                     # Built application (generated)
├── index.js              # Compiled and bundled output
esbuild.config.mjs        # ESBuild configuration
tsconfig.json             # TypeScript configuration
```

## Pages and Routes

### Web Pages
- **/** - Home page with welcome message and user preview
- **/users** - Users listing page
- **/users/:id** - Individual user profile page
- **/about** - About page with technology information

### API Endpoints
- **GET /api/users** - JSON API for users data

### Error Pages
- **404** - Custom not found page
- **500** - Custom error page with debug info (development only)

## Handlebars Features

### Layouts
- Main layout with navigation and footer
- Consistent styling across all pages

### Helpers
- `formatDate` - Format dates for display
- `eq` - Equality comparison
- `json` - Convert objects to JSON strings

### Partials
- Reusable components for common UI elements

## TypeScript Features

### Type Definitions
- **User Interface** - Typed user data model
- **Express Types** - Full type safety for requests and responses
- **Custom Error Types** - Structured error handling

### Benefits
- Compile-time error checking
- IntelliSense and autocompletion
- Refactoring safety
- Better documentation through types

## ESBuild Configuration

### Development
- Source maps for debugging
- Fast incremental builds
- Watch mode for hot reloading

### Production
- Code minification
- Bundle optimization
- External dependency handling

## Styling Features

### Modern CSS
- CSS Grid and Flexbox layouts
- Gradient backgrounds
- Smooth animations and transitions
- Responsive design for all devices

### Components
- Card-based layouts
- Interactive buttons with hover effects
- Loading states and animations
- Professional color scheme

## Environment Variables

- `PORT` - Port number for the server (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Run the built application
- `npm run dev` - Run in development mode with watch
- `npm run build` - Build for development
- `npm run build:prod` - Build for production with minification
- `npm run typecheck` - Check types without compilation

## Browser Features

### Keyboard Shortcuts
- **Alt + H** - Navigate to Home
- **Alt + U** - Navigate to Users
- **Alt + A** - Navigate to About

### JavaScript Utilities
- Notification system
- Smooth scrolling
- Interactive button states
- Number formatting helpers

## Security Features

- **Helmet.js** - Security headers protection
- **CORS** - Cross-origin resource sharing
- **Content Security Policy** - XSS protection
- **Input validation** - Server-side validation

## Performance Optimizations

- **ESBuild** - Fast compilation and bundling
- **Static asset serving** - Optimized delivery
- **Minified production builds** - Reduced file sizes
- **Source maps** - Development debugging

## Development Tips

### Adding New Pages
1. Create a new Handlebars template in `views/`
2. Add route handler in `src/index.ts`
3. Update navigation in `views/layouts/main.handlebars`

### Custom Handlebars Helpers
```typescript
// In src/index.ts
helpers: {
  customHelper: (input: string) => {
    return input.toUpperCase();
  }
}
```

### Adding API Endpoints
```typescript
// In src/index.ts
app.get('/api/new-endpoint', (req: Request, res: Response) => {
  res.json({ data: 'your data here' });
});
```

## Deployment

### Build for Production
```bash
npm run build:prod
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure proper `PORT` if needed
- Ensure all dependencies are installed

### Static Assets
- CSS and JS files are served from `public/` directory
- Images and other assets can be added to `public/`

## License

MIT

---

Built with ❤️ using TypeScript, ESBuild, Express.js, and Handlebars
