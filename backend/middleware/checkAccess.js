// middleware/checkAccess.js
export const checkEditAccess = (req, res, next) => {
  const { access } = req.query;

  if (access === "view") {
    return res.status(403).json({ message: "You have read-only access" });
  }
  next();
};
