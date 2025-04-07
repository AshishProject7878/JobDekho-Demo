import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoute from "./Routes/AuthRoute.js";
// import userRoutes from "./Routes/UserRoute.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./Libs/Db.js";
import postRoutes from "./Routes/PostRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));

app.use("/api/auth", authRoute);
app.use("/api/posts", postRoutes);
// app.use("/api/users", userRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port: " + PORT);
    connectDB();
}) 