const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ✅ CREATE DOCUMENT
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const [result] = await db.execute(
      "INSERT INTO documents (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, userId]
    );

    res.json({
      message: "Document created",
      documentId: result.insertId
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET ALL DOCUMENTS (ONLY LOGGED USER)
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const [docs] = await db.execute(
      "SELECT * FROM documents WHERE user_id = ?",
      [userId]
    );

    res.json(docs);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ GET SINGLE DOCUMENT
router.get("/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;

    const [doc] = await db.execute(
      "SELECT * FROM documents WHERE id = ? AND user_id = ?",
      [docId, userId]
    );

    if (doc.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(doc[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ UPDATE DOCUMENT
router.put("/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.id;

    await db.execute(
      "UPDATE documents SET title = ?, content = ? WHERE id = ? AND user_id = ?",
      [title, content, docId, userId]
    );

    res.json({ message: "Document updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ DELETE DOCUMENT
router.delete("/:id", async (req, res) => {
  try {
    const docId = req.params.id;
    const userId = req.user.id;

    await db.execute(
      "DELETE FROM documents WHERE id = ? AND user_id = ?",
      [docId, userId]
    );

    res.json({ message: "Document deleted" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
