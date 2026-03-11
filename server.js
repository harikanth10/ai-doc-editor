const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const db = require("./config/db");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const checkRole = require("./middleware/checkRole");

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", authRoutes);

// 🔐 Protected test route
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted ✅",
    user: req.user
  });
});

// ================= DOCUMENT ROUTES =================

// ✅ Create Document (Creator = OWNER)
app.post("/api/documents", authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    const [result] = await db.execute(
      "INSERT INTO documents (title, content, user_id) VALUES (?, ?, ?)",
      [title, content, req.user.id]
    );

    // 🔥 Assign OWNER role
    await db.execute(
      "INSERT INTO document_roles (document_id, user_id, role) VALUES (?, ?, ?)",
      [result.insertId, req.user.id, "owner"]
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

// ✅ Get All Documents (Owner + Shared)
app.get("/api/documents", authMiddleware, async (req, res) => {
  try {
    const [documents] = await db.execute(
      `SELECT d.* 
       FROM documents d
       JOIN document_roles dr ON d.id = dr.document_id
       WHERE dr.user_id = ?`,
      [req.user.id]
    );

    res.json(documents);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUBLIC: Get Single Document (Anyone can view)
app.get("/api/documents/:id", async (req, res) => {
  try {
    const [documents] = await db.execute(
      "SELECT * FROM documents WHERE id = ?",
      [req.params.id]
    );

    if (documents.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(documents[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Get Role (Logged users only)
app.get(
  "/api/documents/:id/role",
  authMiddleware,
  async (req, res) => {
    try {
      const [roles] = await db.execute(
        "SELECT role FROM document_roles WHERE document_id = ? AND user_id = ?",
        [req.params.id, req.user.id]
      );

      if (roles.length === 0) {
        return res.json({ role: "viewer" }); // default
      }

      res.json({ role: roles[0].role });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Update Document (Owner + Editor only)
app.put(
  "/api/documents/:id",
  authMiddleware,
  checkRole(["owner", "editor"]),
  async (req, res) => {
    try {
      const { title, content } = req.body;

      await db.execute(
        "UPDATE documents SET title = ?, content = ? WHERE id = ?",
        [title, content, req.params.id]
      );

      res.json({ message: "Document updated successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Delete Document (Owner only)
app.delete(
  "/api/documents/:id",
  authMiddleware,
  checkRole(["owner"]),
  async (req, res) => {
    try {
      await db.execute(
        "DELETE FROM documents WHERE id = ?",
        [req.params.id]
      );

      res.json({ message: "Deleted successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ✅ Share Document (Owner only)
app.post(
  "/api/documents/:id/share",
  authMiddleware,
  checkRole(["owner"]),
  async (req, res) => {
    try {
      const { userId, role } = req.body;

      await db.execute(
        "INSERT INTO document_roles (document_id, user_id, role) VALUES (?, ?, ?)",
        [req.params.id, userId, role]
      );

      res.json({ message: "User added successfully" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ================= SOCKET.IO REAL-TIME =================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-document", (documentId) => {
    socket.join(documentId);
    console.log(`User joined document ${documentId}`);
  });

  socket.on("send-changes", (data) => {
    socket.to(data.documentId).emit("receive-changes", data.content);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// ================= START SERVER =================

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});