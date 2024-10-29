import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression'; // Import compression
import authRoutes from './routes/authRoutes.js';
import techniquesRoutes from './routes/techniquesRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import db from './config/db.js';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import setupSocket from './socketSetup.js';

dotenv.config();

const app = express();

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

db.sync({ alter: true })
  .then(() => console.log('Database synchronized...'))
  .catch(err => {
    console.error('Error synchronizing the database:', err);
  });

// Ajoute le middleware de compression pour toutes les réponses
app.use(compression());

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  console.log('Cookies: ', req.cookies);
  console.log('Headers: ', req.headers);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/techniques', techniquesRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const server = http.createServer(app);
const io = setupSocket(server);

app.set('io', io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 8081;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
