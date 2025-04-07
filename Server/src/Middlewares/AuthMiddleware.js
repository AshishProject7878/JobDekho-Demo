import User from "../Models/AuthModel.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized - Token Invalid" });
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({ message: "Unauthorized - User Not Found" });
        }

        req.user = user;  
        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error); // log full error
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}