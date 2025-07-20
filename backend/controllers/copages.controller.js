import { db, admin } from "../firebaseAdmin.js";

export const savePage = async (req, res) => {
  const { email, pageId, title, content } = req.body;
  try {
    if (!email || !title || !content) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const usersRef = db.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const pagesRef = userDoc.ref.collection("copages");
    const pageRef = pageId ? pagesRef.doc(pageId) : pagesRef.doc();

    await pageRef.set({
      title,
      content, // save quill delta JSON
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: pageId ? undefined : admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.status(200).json({ success: true, message: "Page saved", pageId: pageRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPages = async (req, res) => {
  const { email } = req.params;
  try {
    const usersRef = db.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const pagesRef = userDoc.ref.collection("copages");
    const pagesSnapshot = await pagesRef.orderBy("updatedAt", "desc").get();

    const pages = pagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ success: true, pages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPageById = async (req, res) => {
  const { email, pageId } = req.params;
  try {
    const usersRef = db.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userDoc = userSnapshot.docs[0];
    const pageRef = userDoc.ref.collection("copages").doc(pageId);
    const pageSnapshot = await pageRef.get();

    if (!pageSnapshot.exists) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    res.status(200).json({ success: true, page: pageSnapshot.data() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
