// routes/share.js
import express from 'express';
const router = express.Router();
import admin from 'firebase-admin';
const db = admin.firestore();

// Generate share links
router.post('/:pageId', async (req, res) => {
  const { pageId } = req.params;

  try {
    const viewLink = `http://localhost:5173/page/${pageId}?access=view`;
    const editLink = `http://localhost:5173/page/${pageId}?access=edit`;

    // (Optional) Store in Firestore
    const pageRef = db.collection('pages').doc(pageId);
    await pageRef.set({
      sharedLinks: {
        view: {
          link:viewLink,
          permission:"view",},
        edit: 
        {link:editLink,permission:"edit"}
      }
    },{merge:true});

    res.json({ viewLink, editLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate share links' });
  }
});

export default router;
