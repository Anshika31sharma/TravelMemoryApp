import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import tripDayRoutes from './routes/tripDayRoutes.js';
import photoRoutes from './routes/photoRoutes.js';
import tagRoutes from './routes/tagRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Serve uploaded photos
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/trips/:tripId/days', tripDayRoutes);
app.use('/api/trips/:tripId/photos', photoRoutes);
app.use('/api/tags', tagRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Travel Memory Map API running on http://localhost:${PORT}`);
});
