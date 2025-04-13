import express from "express";
import { createdPost, deletePost, getPostById, getPosts, updatePost } from "../Controllers/PostController.js";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.post("/", protectRoute, createdPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.put("/:id", protectRoute, updatePost);
router.delete("/:id", protectRoute, deletePost);

export default router;