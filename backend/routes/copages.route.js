import express from "express";
import { savePage, getPages, getPageById } from "../controllers/copages.controller.js";
const router = express.Router();

router.post("/pages/save", savePage);       // Save or update a page
router.get("/pages/:email", getPages);      // Get all pages for a user
router.get("/pages/:email/:pageId", getPageById); // Get single page content

export default router;
