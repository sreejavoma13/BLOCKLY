import { db, admin } from "../firebaseAdmin.js";
import bcrypt from "bcryptjs";

export const getPagesRef = (userId) => {
    return db.collection("users").doc(userId).collection("pages");
};

// Create Page
export const createPage = async (data) => {
    const pagesRef = getPagesRef(data.userId);
    const docRef=await pagesRef.add({
        user: data.userId,
        parent: data.parentId ?? null,
        title: data.title ?? "untitled",
        content:data.content ?? "",
        isFavorite: false,
        isTrashed: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: docRef.id, ...data, content:""};
};

// Display Pages (for a user)
export const displayPages = async (userId) => {
    const pagesRef = getPagesRef(userId);
    const snapshot = await pagesRef.where("user", "==", userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // const ownedPagesQuery = pagesRef.where('user', '==', userId);
    // const sharedPagesQuery = pagesRef.where('sharedEditors', 'array-contains', userId);
    //  const [ownedPagesSnap, sharedPagesSnap] = await Promise.all([
    //   ownedPagesQuery.get(),
    //   sharedPagesQuery.get()
    // ]);
    // const ownedPages = ownedPagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // const sharedPages = sharedPagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // const allPages = [...ownedPages, ...sharedPages];
    // const uniquePages = Array.from(new Map(allPages.map(p => [p.id, p])).values());
    // res.json(uniquePages);
};
// Display favorite Pages (for a user)
export const displayfavPages = async (userId) => {
    try {
        const pagesRef = getPagesRef(userId);
        const snapshot = await pagesRef
            .where("user", "==", userId)
            .where("isFavorite", "==", true)
            .get();

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching favorite pages:", error);
        throw error;
    }
};
// Update Page
export const updatePage = async (userId,pageId, updates) => {
    const pagesRef = getPagesRef(userId);
    const pageDoc = pagesRef.doc(pageId);
    console.log("Updating page:", pageId, updates);
    try{
        await pageDoc.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("page updated");
        
    }catch(error){
        console.log(error.message);
    }
    
};

// Delete Page (soft delete)
export const deletePage = async (userId,pageId) => {
    const pagesRef = getPagesRef(userId);
    const pageDoc = pagesRef.doc(pageId);
    await pageDoc.update({ isTrashed: true });
};

// Delete Page Permanently
export const deletePagePermt = async (userId,pageId) => {
    const pagesRef = getPagesRef(userId);
    const pageDoc = pagesRef.doc(pageId);
    const subPagesSnapshot = await pagesRef.where("parent", "==", pageId).get();

    // Recursively delete all child pages
    const deletePromises = subPagesSnapshot.docs.map(doc =>
        deletePagePermt(doc.id) // Recursive call
    );

    await Promise.all(deletePromises);

    // Delete the parent page itself
    await pageDoc.delete();
};

// Get child pages
export const getChildPages = async (userId,parentId) => {
    try {
        const pagesRef = getPagesRef(userId);
        const snapshot = await pagesRef.where("parent", "==", parentId).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching child pages:", error);
        throw error;
    }
};

export const emptyTrash = async (userId) => {
    const pagesRef = getPagesRef(userId);
    const trashedPages = await pagesRef
        .where("user", "==", userId)
        .where("isTrashed", "==", true)
        .get();

    console.log(`Found ${trashedPages.size} trashed pages for user ${userId}`);

    if (trashedPages.empty) {
        return { message: "No trashed pages to delete" };
    }

    const deletePromises = trashedPages.docs.map(doc =>
        deletePagePermt(userId,doc.id)
    );

    await Promise.all(deletePromises);

    return { message: "Trash emptied successfully" };
};

export const getPageById = async (userid, pageId) => {
    const pagesRef = getPagesRef(userid);
    const pageDoc = await pagesRef.doc(pageId).get();

    if (!pageDoc.exists) {
        throw new Error("Page not found");
    }

    return { id: pageDoc.id, ...pageDoc.data() };
};

export const duplicatePage = async (req, res) => {
  const { pageId } = req.body;
  const userId = req.user.id; // assuming you have auth middleware

  try {
    const originalPageRef = db.collection('pages').doc(pageId);
    const originalPageSnap = await originalPageRef.get();

    if (!originalPageSnap.exists) {
      return res.status(404).json({ message: "Original page not found" });
    }

    const originalPage = originalPageSnap.data();

    // Create a new page with same content but new ID
    const newPageRef = db.collection('pages').doc();
    await newPageRef.set({
      ...originalPage,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      owner: userId,
    });

    res.status(200).json({ newPageId: newPageRef.id });
  } catch (err) {
    console.error("Failed to duplicate page:", err);
    res.status(500).json({ message: "Server error while duplicating page" });
  }
};

// Get comments for a page
export const getComments = async (req, res) => {
    const { userId, pageId } = req.params;
    try {
        const commentsRef = getPagesRef(userId).doc(pageId).collection("comments");
        const snapshot = await commentsRef.orderBy("createdAt", "asc").get();
        const comments = snapshot.docs.map(doc => doc.data());
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch comments" });
    }
};

// Add a new comment
export const addComment = async (req, res) => {
    const { userId, pageId } = req.params;
    const { name, text } = req.body;

    if (!name || !text) return res.status(400).json({ error: "Name and text required" });

    try {
        const commentsRef = getPagesRef(userId).doc(pageId).collection("comments");
        await commentsRef.add({
            name,
            text,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        res.status(201).json({ message: "Comment added" });
    } catch (err) {
        res.status(500).json({ error: "Failed to add comment" });
    }
};
//save page to profile
export const savePageToUser = async (req, res) => {
    const { sourceUserId, email, password, pageId } = req.body;

    if (!email || !password || !pageId || !sourceUserId) {
        return res.status(400).json({ error: "sourceUserId, email, password, and pageId are required" });
    }

    try {
        // 🔑 Find target user in Firestore
        const usersRef = admin.firestore().collection("users");
        const userQuery = await usersRef.where("email", "==", email).limit(1).get();

        if (userQuery.empty) {
            return res.status(404).json({ error: "User not found with this email" });
        }

        const userDoc = userQuery.docs[0];
        const userData = userDoc.data();

        // 🔐 Verify password (if you stored hashedPassword)
        
        const passwordMatch = await bcrypt.compare(password, userData.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const targetUserId = userDoc.id; // Firestore document ID for user

        // 📖 Get original page from source user
        const originalPageRef = getPagesRef(sourceUserId).doc(pageId);
        const originalPageSnap = await originalPageRef.get();

        if (!originalPageSnap.exists) {
            return res.status(404).json({ error: "Original page not found" });
        }

        const originalPage = originalPageSnap.data();

        // 💾 Save to target user's collection
        const targetPagesRef = getPagesRef(targetUserId);
        const newDocRef = await targetPagesRef.add({
            ...originalPage,
            user: targetUserId,
            isFavorite: false,
            isTrashed: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            message: "Page saved to user's profile successfully",
            newPageId: newDocRef.id
        });
    } catch (error) {
        console.error("Error saving page to user:", error);
        res.status(500).json({ error: "Failed to save page to user" });
    }
};