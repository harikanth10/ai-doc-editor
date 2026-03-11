const db = require("../config/db");

const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const documentId = req.params.id;
      const userId = req.user.id;

      const [roles] = await db.execute(
        "SELECT role FROM document_roles WHERE document_id = ? AND user_id = ?",
        [documentId, userId]
      );

      if (roles.length === 0) {
        return res.status(403).json({ message: "No access to this document" });
      }

      const userRole = roles[0].role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkRole;
