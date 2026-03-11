import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [status, setStatus] = useState("Saved");

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  /* ================= EXEC FORMAT ================= */

  const exec = (command, value = null) => {
    if (!isLoggedIn) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
  };

  /* ================= FONT SIZE ================= */

  const changeFontSize = (size) => {
    exec("fontSize", size);
  };

  /* ================= FONT FAMILY ================= */

  const changeFont = (font) => {
    exec("fontName", font);
  };

  /* ================= AI FUNCTION ================= */

  const callAI = async (endpoint) => {
    try {
      const text = editorRef.current.innerText;

      if (!text.trim()) {
        alert("Editor is empty");
        return;
      }

      setStatus("AI Processing...");

      const res = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (data.result) {
        editorRef.current.innerText = data.result;
        setStatus("AI Updated");
      } else {
        setStatus("Saved");
      }
    } catch (err) {
      console.error(err);
      alert("AI failed");
      setStatus("Saved");
    }
  };

  /* ================= SOCKET ================= */

  useEffect(() => {
    if (!id) return;
    socket.emit("join-document", id);
  }, [id]);

  useEffect(() => {
    socket.on("receive-changes", (content) => {
      if (editorRef.current) {
        editorRef.current.innerHTML = content;
      }
    });

    return () => socket.off("receive-changes");
  }, []);

  /* ================= LOAD DOCUMENT ================= */

  useEffect(() => {
    const savedDocs =
      JSON.parse(localStorage.getItem("documents")) || [];
    setDocuments(savedDocs);

    const currentDoc = savedDocs.find((doc) => doc.id === id);
    if (!currentDoc) {
      navigate("/dashboard");
      return;
    }

    setTitle(currentDoc.title);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = currentDoc.content || "";
      }
    }, 0);
  }, [id, navigate]);

  /* ================= SAVE ================= */

  const handleSave = () => {
    if (!isLoggedIn) return;

    const updatedDocs = documents.map((doc) =>
      doc.id === id
        ? {
            ...doc,
            title,
            content: editorRef.current.innerHTML,
            lastEdited: Date.now(),
          }
        : doc
    );

    localStorage.setItem("documents", JSON.stringify(updatedDocs));
    setDocuments(updatedDocs);
    setStatus("Saved");
  };

  const handleDelete = () => {
    if (!isLoggedIn) return;

    const updatedDocs = documents.filter((doc) => doc.id !== id);
    localStorage.setItem("documents", JSON.stringify(updatedDocs));
    navigate("/dashboard");
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>

      {/* ================= TOP BAR ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 30px",
          background: "white",
          borderBottom: "1px solid #ddd",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#2563eb",
              borderRadius: "6px",
            }}
          />
          <input
            value={title}
            disabled={!isLoggedIn}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              fontSize: "18px",
              border: "none",
              outline: "none",
              fontWeight: 600,
            }}
          />
          <span style={{ fontSize: "13px", color: "gray" }}>{status}</span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          {isLoggedIn && (
            <button onClick={handleDelete} style={{ color: "red" }}>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ================= ADVANCED TOOLBAR ================= */}

      <div
        style={{
          background: "white",
          padding: "10px 20px",
          borderBottom: "1px solid #ddd",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >

        {/* FONT FAMILY */}

        <select onChange={(e) => changeFont(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times</option>
          <option value="Courier New">Courier</option>
          <option value="Verdana">Verdana</option>
        </select>

        {/* FONT SIZE */}

        <select onChange={(e) => changeFontSize(e.target.value)}>
          <option value="1">10</option>
          <option value="2">13</option>
          <option value="3">16</option>
          <option value="4">18</option>
          <option value="5">24</option>
          <option value="6">32</option>
        </select>

        <button onClick={() => exec("bold")}><b>B</b></button>
        <button onClick={() => exec("italic")}><i>I</i></button>
        <button onClick={() => exec("underline")}><u>U</u></button>

        <button onClick={() => exec("insertUnorderedList")}>• List</button>
        <button onClick={() => exec("insertOrderedList")}>1. List</button>

        <button onClick={() => exec("justifyLeft")}>Left</button>
        <button onClick={() => exec("justifyCenter")}>Center</button>
        <button onClick={() => exec("justifyRight")}>Right</button>

        <button onClick={() => exec("undo")}>Undo</button>
        <button onClick={() => exec("redo")}>Redo</button>

        <input
          type="color"
          onChange={(e) => exec("foreColor", e.target.value)}
        />

        <input
          type="color"
          onChange={(e) => exec("hiliteColor", e.target.value)}
        />

        <button onClick={() => callAI("summarize")}>Summarize</button>
        <button onClick={() => callAI("rewrite")}>Rewrite</button>
        <button onClick={() => callAI("grammar")}>Fix Grammar</button>

      </div>

      {/* ================= PAGE ================= */}

      <div
        style={{
          padding: "40px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "850px",
            minHeight: "1100px",
            background: "white",
            padding: "90px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            borderRadius: "6px",
          }}
        >
          <div
            ref={editorRef}
            contentEditable={isLoggedIn}
            suppressContentEditableWarning
            style={{
              outline: "none",
              fontSize: "16px",
              lineHeight: "1.7",
            }}
            onInput={() => {
              if (!isLoggedIn) return;
              setStatus("Editing...");
              socket.emit("send-changes", {
                documentId: id,
                content: editorRef.current.innerHTML,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Editor;