import express from "express";
import { protect } from "../middleware/verifyJWT.js";
import { emptyTrash } from "../controllers/pages.controller.js";

const router = express.Router();

// Empty Trash Route
router.delete("/:userid", protect, async (req, res) => {
    try {
        const result = await emptyTrash(req.params.userid);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error emptying trash:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
