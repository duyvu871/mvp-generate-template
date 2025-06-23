const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Handlebars
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, '../views/layouts'),
  partialsDir: path.join(__dirname, '../views/partials')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to format time
const formatTime = (format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment().format(format);
};

// Routes
app.get('/', (req, res) => {
  const serverTime = formatTime();
  const serverTimeFormatted = formatTime('dddd, MMMM Do YYYY, h:mm:ss a');
  
  res.render('home', {
    title: 'Express + Handlebars Server',
    serverTime: serverTime,
    serverTimeFormatted: serverTimeFormatted,
    timestamp: Date.now()
  });
});

app.get('/api/time', (req, res) => {
  res.json({
    serverTime: formatTime(),
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    url: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📅 Server started at: ${formatTime('dddd, MMMM Do YYYY, h:mm:ss a')}`);
}); 