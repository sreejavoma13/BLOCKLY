import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js"
import {db,admin} from "../firebaseAdmin.js"
import bcrypt from "bcrypt";


export const signup=async (req,res)=>{
    const { idToken,password } = req.body;
    try{
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;
        console.log(decodedToken);
        const hashedPassword = await bcrypt.hash(password, 10);
        const usersRef = db.collection("users");
        const userDoc = usersRef.doc(uid);
        const docSnapshot = await userDoc.get();
        if (!docSnapshot.exists) {
            console.log("Creating new user in Firestore...");
            await userDoc.set({
                firebaseUid: uid,
                email: email,
                password:hashedPassword,
                name: name || "unnamed",
                role:"user",
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            console.log(" User already exists. Updating lastLogin...");
            await userDoc.update({
                lastLogin: admin.firestore.FieldValue.serverTimestamp()
            });
        }
        const savedUser = await userDoc.get();
        const savedUserData=savedUser.data()
        console.log(savedUser.data());
        if (!savedUserData.firebaseUid) {
            throw new Error("firebaseUid missing in Firestore user document");
        }
        const token=generateTokenAndSetCookie(res, savedUserData);
        res.status(201).json({
            success: true,
            message: "User authenticated successfully",
            user: savedUser.data(),
            token
        });
    }catch(error){
        res.status(400).json({ success: false, message: error.message });
    }
}

export const login = async (req, res) => {
    const { idToken } = req.body;
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;

        const usersRef = db.collection("users");
        const userDoc = usersRef.doc(uid);
        const docSnapshot = await userDoc.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({
                success: false,
                message: "User not found. Please sign up first.",
            });
        }

        // Update lastLogin timestamp
        await userDoc.update({
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });

        const savedUser = await userDoc.get();
        const savedUserData = savedUser.data();

        if (!savedUserData.firebaseUid) {
            throw new Error("firebaseUid missing in Firestore user document");
        }

        const token = generateTokenAndSetCookie(res, savedUserData);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: savedUserData,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
