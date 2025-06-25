import express, { Request, Response } from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

// Handlebars configuration
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(process.cwd(), 'views/layouts'),
  partialsDir: path.join(process.cwd(), 'views/partials'),
  helpers: {
    eq: (a: any, b: any) => a === b,
    formatDate: (date: Date) => date.toLocaleDateString(),
    json: (obj: any) => JSON.stringify(obj)
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(process.cwd(), 'views'));

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Sample data
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: new Date('2024-01-15') },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: new Date('2024-02-20') },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', createdAt: new Date('2024-03-10') }
];

// Routes
app.get('/', (req: Request, res: Response) => {
  res.render('home', {
    title: 'Welcome to TypeScript + ESBuild Express App',
    message: 'This is a full-stack web application built with Express, Handlebars, TypeScript, and ESBuild!',
    users: users,
    buildInfo: {
      language: 'TypeScript',
      buildTool: 'ESBuild',
      viewEngine: 'Handlebars'
    }
  });
});

app.get('/users', (req: Request, res: Response) => {
  res.render('users', {
    title: 'Users List',
    users: users,
    totalUsers: users.length
  });
});

app.get('/users/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).render('404', {
      title: 'User Not Found',
      message: `User with ID ${id} was not found.`
    });
  }
  
  res.render('user-detail', {
    title: `User: ${user.name}`,
    user: user
  });
});

app.get('/about', (req: Request, res: Response) => {
  res.render('about', {
    title: 'About This App',
    technologies: [
      { name: 'Node.js', description: 'JavaScript runtime' },
      { name: 'Express.js', description: 'Web framework' },
      { name: 'TypeScript', description: 'Type-safe JavaScript' },
      { name: 'ESBuild', description: 'Fast bundler' },
      { name: 'Handlebars', description: 'Template engine' }
    ]
  });
});

// API endpoints
app.get('/api/users', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: users,
    count: users.length
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: `The page "${req.originalUrl}" was not found.`
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Error:', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.listen(port, () => {
  console.log(`🚀 TypeScript + ESBuild Server running on port ${port}`);
  console.log(`📍 Open your browser: http://localhost:${port}`);
  console.log(`🔧 Built with: TypeScript + ESBuild + Handlebars`);
});
