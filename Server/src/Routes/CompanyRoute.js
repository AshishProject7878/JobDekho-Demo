import express from "express";
import {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  rateCompany,
} from "../Controllers/CompanyController.js";
import { protectRoute } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", getAllCompanies);
router.get("/:id", getCompanyById);
router.post("/", protectRoute, registerCompany);
router.put("/:id", protectRoute, updateCompany);
router.delete("/:id", protectRoute, deleteCompany);
router.post("/:id/rate", protectRoute, rateCompany);

export default router;