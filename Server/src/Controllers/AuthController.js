import bcrypt from "bcryptjs";
import User from "../Models/AuthModel.js";
import { generateToken } from "../Libs/Utils.js";

export const signup = async(req, res) => {
    const {name, email, password} = req.body;
    try {
        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters long"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "This email is already registered"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        generateToken(newUser._id, res);

        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
        });

    } catch (error) {
        console.error("Signup Controller Error:", error);
        res.status(500).json({message: "Internal Server Error in SignUp Controller", error: error.message});
    }
};

export const login = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
        });
    } catch (error) {
        console.error("Login Controller Error:", error);
        res.status(500).json({message: "Internal Server Error in Login Controller", error: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error("Logout Controller Error:", error);
        res.status(500).json({message: "Internal Server Error in Logout Controller", error: error.message});
    }
}

