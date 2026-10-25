import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder first, then root directory as fallback
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import waitlistRoutes from './routes/waitlistRoutes.js';
import { PRACTICE_CONFIG } from './config/schedule.js';
import { resetAndSeedDemoData } from './services/seedService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev convenience
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/waitlist', waitlistRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Nourish Wellness Backend',
    practiceTimezone: PRACTICE_CONFIG.timezone,
    timestamp: new Date().toISOString(),
  });
});

// Demo Data Reset Endpoint (resets database to initial Section 8 state)
app.post('/api/reset-demo', async (req, res) => {
  try {
    await resetAndSeedDemoData();
    res.status(200).json({
      success: true,
      message: 'Database reset to clean demonstration state successfully.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset demo database: ' + err.message,
    });
  }
});

// Serve compiled frontend in single-service deployment (if frontend/dist exists)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log(`[Static] Production build detected: serving frontend from ${frontendDist}`);
  app.use(express.static(frontendDist));

  // Catch-all route to serve React's index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(frontendDist, 'index.html'));
  });
} else {
  // Root info fallback for API-only dev mode
  app.get('/', (req, res) => {
    res.send('Nourish Wellness Practice API is running.');
  });
}

// Global API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// Start server
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`\n=================================================`);
      console.log(` Nourish Wellness Practice Backend`);
      console.log(` Server running on: http://localhost:${PORT}`);
      console.log(` Practice Timezone: ${PRACTICE_CONFIG.timezone}`);
      console.log(` Practice Hours:    ${PRACTICE_CONFIG.workHours.start} - ${PRACTICE_CONFIG.workHours.end}`);
      console.log(`=================================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Backend Error] Port ${PORT} is already in use by another process.`);
        console.error(`Please stop any running backend processes on port ${PORT}.\n`);
      } else {
        console.error(`\n[Backend Error] Server error:`, err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start Nourish server:', error);
    process.exit(1);
  }
}

startServer();
