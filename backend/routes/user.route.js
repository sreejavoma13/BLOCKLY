import express from 'express'
import { protect } from '../middleware/verifyJWT.js'
const router=express.Router()
import { db } from "../firebaseAdmin.js"

router.get("/profile", protect, async (req, res) => {
  try {
    const userId = req.user.userId; 
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const userData = userDoc.data();
    res.json({
      userId,  
      name: userData.name,
      email: userData.email,
      role: userData.role,
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;