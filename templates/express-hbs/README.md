# Express + Handlebars Server

A beautiful Express.js application with Handlebars templating that displays real-time server information.

## Features

- 🌐 **Express.js** - Fast and minimalist web framework
- 🎨 **Handlebars** - Semantic templating engine
- 🕒 **Real-time Clock** - Live server time display
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎭 **Modern UI** - Beautiful gradient design with animations
- 🔄 **Auto-refresh** - Automatic time updates every 30 seconds
- 🚀 **Fast Performance** - Optimized for speed

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

- `GET /` - Home page with time display
- `GET /api/time` - JSON API endpoint for current server time

## Project Structure

```
├── src/
│   └── index.js          # Main server file
├── views/
│   ├── layouts/
│   │   └── main.handlebars    # Main layout
│   ├── home.handlebars        # Home page
│   ├── 404.handlebars         # 404 error page
│   └── error.handlebars       # Server error page
├── public/
│   ├── css/
│   │   └── style.css          # Styles
│   └── js/
│       └── app.js             # Client-side JavaScript
└── package.json
```

## Technologies Used

- **Express.js** - Web framework
- **Express-Handlebars** - Template engine
- **Moment.js** - Date/time manipulation
- **Font Awesome** - Icons
- **CSS Grid & Flexbox** - Modern layouts

## License

MIT 