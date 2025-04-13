import express from "express";
import {
  registerCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../Controllers/CompanyController.js";

const router = express.Router();

// Routes for company management
router.post("/", registerCompany); // POST /api/companies
router.get("/", getAllCompanies); // GET /api/companies
router.get("/:id", getCompanyById); // GET /api/companies/:id
router.put("/:id", updateCompany); // PUT /api/companies/:id
router.delete("/:id", deleteCompany); // DELETE /api/companies/:id

export default router;