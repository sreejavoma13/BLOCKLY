import { db } from "../firebaseAdmin.js"
import express from 'express'
import { protect } from '../middleware/verifyJWT.js'
const router=express.Router()
import bcrypt from "bcrypt";

router.post('/check-user', async (req, res) => {
  const { email,password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const usersRef = db.collection('users');
    const query = await usersRef.where('email', '==', email).get();

    if (query.empty) {
      return res.status(404).json({ exists: false, message: "User not found" });
    } 
    const userDoc = query.docs[0];
    const userData = userDoc.data();
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      console.log("passwords are different");
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    console.log("passwords matched");
    res.status(200).json({ success: true, message: "Login successful", user: userData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
export default router;
