import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './Routes/AuthRoute.js';
import cookieParser from 'cookie-parser';
import { connectDB } from './Libs/Db.js';
import postRoutes from './Routes/PostRoute.js';
import profileRoutes from './Routes/ProfileRoute.js';
import uploadRoutes from './Routes/UploadRoute.js';
import fileUpload from 'express-fileupload';
import companyRoutes from './Routes/CompanyRoute.js';
import './Cron.js'; 

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/companies', companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  if (err instanceof fileUpload.LimitsFileSizeError) {
    return res.status(400).json({ message: 'File size exceeds 5MB limit' });
  }
  res.status(500).json({ message: 'Something went wrong on the server', error: err.message });
});

// Connect to DB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();