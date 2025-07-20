import express from 'express'
import { createPage, displayPages, updatePage, deletePage, deletePagePermt, getChildPages,displayfavPages,emptyTrash,getPageById,getComments,addComment} from "../controllers/pages.controller.js";
import { protect } from '../middleware/verifyJWT.js'
import { duplicatePage } from '../controllers/pages.controller.js';
import { checkEditAccess } from '../middleware/checkAccess.js';
import admin from 'firebase-admin';
const db = admin.firestore();

const router=express.Router()
router.post("/pages", protect,async (req, res) => {
    try {
        const result=await createPage({
            ...req.body,
            userId: req.user.userId 
        });
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all pages for a user
router.get("/pages/:userId",protect, async (req, res) => {
    try {
        const pages = await displayPages(req.params.userId);
        res.status(200).json(pages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//Get all favorite pages for a user
router.get("/pages/fav/:userId",protect,async(req,res)=>{
    try{
        const favpages=await displayfavPages(req.params.userId);
        res.status(200).json(favpages)
    }catch(error){
        res.status(500).json({ error: err.message });
    }

});

// Get child pages of a parent page
router.get("/pages/children/:parentId",protect, async (req, res) => {
    try {
        const children = await getChildPages(req.params.parentId);
        res.status(200).json(children);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Page
router.put("/pages/:userId/:pageId/",protect,checkEditAccess, async (req, res) => {
    try {
        await updatePage(req.params.userId,req.params.pageId, req.body);
        res.status(200).json({ message: "Page updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft Delete Page
router.patch("/pages/trash/:userId/:pageId",protect,checkEditAccess, async (req, res) => {
    try {
        await deletePage(req.params.userId,req.params.pageId);
        res.status(200).json({ message: "Page moved to trash" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanently Delete Page
router.delete("/pages/:userId/:pageId",protect, async (req, res) => {
    try {
        await deletePagePermt(req.params.userId,req.params.pageId);
        res.status(200).json({ message: "Page permanently deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete("/pages/trash/:userId", protect, async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await emptyTrash(userId); // call controller function
        res.status(200).json(result);
    } catch (err) {
        console.error("Error emptying trash:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/pages/single/:userid/:pageId", protect, async (req, res) => {
    const { userid, pageId } = req.params;

    try {
        const page = await getPageById(userid, pageId); // call controller
        res.status(200).json(page);
    } catch (err) {
        console.error("Error fetching single page:", err);
        res.status(404).json({ error: err.message });
    }
});

router.post('/duplicate', duplicatePage);


router.post('/:pageId/addEditor', async (req, res) => {
  const { pageId } = req.params;
  const { userId } = req.body;

  try {
    const pageRef = db.collection('pages').doc(pageId);
    const pageDoc = await pageRef.get();
    if (!pageDoc.exists) return res.status(404).json({ message: "Page not found" });

    // Add userId to sharedEditors array if not already there
    await pageRef.update({
      sharedEditors: admin.firestore.FieldValue.arrayUnion(userId)
    });

    res.json({ message: "User added as editor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add user as editor" });
  }
});
router.get("/:userId/:pageId/comments", protect, getComments);
router.post("/:userId/:pageId/comments", protect, addComment);

export default router;
