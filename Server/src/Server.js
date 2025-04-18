import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./Routes/AuthRoute.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./Libs/Db.js";
import postRoutes from "./Routes/PostRoute.js";
import profileRoutes from "./Routes/ProfileRoute.js";
import uploadRoutes from "./Routes/UploadRoute.js";
import fileUpload from "express-fileupload";
import companyRoutes from "./Routes/CompanyRoute.js";

// Load environment variables first 
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies (for form data)
app.use(cookieParser()); // Parse cookies
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

// Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/companies", companyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ message: 'Something went wrong on the server' });
});

// Start server and connect to DB
app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
    connectDB();
});