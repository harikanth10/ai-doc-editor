import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔥 NEW

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) navigate("/login");

    const savedDocs =
      JSON.parse(localStorage.getItem("documents")) || [];
    setDocuments(savedDocs);
  }, [navigate]);

  const handleCreate = () => {
    const newDoc = {
      id: Date.now().toString(),
      title: "Untitled Document",
      content: "",
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    localStorage.setItem("documents", JSON.stringify(updatedDocs));

    navigate(`/editor/${newDoc.id}`);
  };

  const handleDelete = (id) => {
    const updatedDocs = documents.filter(
      (doc) => doc.id !== id
    );
    setDocuments(updatedDocs);
    localStorage.setItem("documents", JSON.stringify(updatedDocs));
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  // 🔥 FILTER DOCUMENTS BASED ON SEARCH
  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: "#f1f3f4", minHeight: "100vh" }}>
      
      {/* 🔵 NAVBAR */}
      <div
        style={{
          height: "64px",
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "#1a73e8",
              borderRadius: "4px",
            }}
          ></div>
          <h2 style={{ margin: 0, fontWeight: 500 }}>Docs</h2>
        </div>

        {/* 🔥 SEARCH INPUT NOW WORKS */}
        <div
          style={{
            flex: 1,
            maxWidth: "600px",
            margin: "0 40px",
          }}
        >
          <input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 20px",
              borderRadius: "24px",
              border: "1px solid #dadce0",
              background: "#f1f3f4",
              outline: "none",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "#5f6368",
              borderRadius: "4px",
              opacity: 0.6,
            }}
          ></div>

          <div
            onClick={handleLogout}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "#1a73e8",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            H
          </div>
        </div>
      </div>

      {/* START NEW */}
      <div style={{ padding: "40px" }}>
        <h3 style={{ fontWeight: 500 }}>
          Start a new document
        </h3>

        <div
          onClick={handleCreate}
          style={{
            width: "180px",
            height: "220px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "50px",
            color: "#1a73e8",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          +
        </div>
      </div>

      {/* DOCUMENTS */}
      <div style={{ padding: "0 40px 40px 40px" }}>
        <h3 style={{ fontWeight: 500 }}>
          Your documents
        </h3>

        {filteredDocs.length === 0 ? (
          <p style={{ color: "gray" }}>No matching documents.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 180px)",
              gap: "20px",
              marginTop: "20px",
            }}
          >
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  padding: "15px",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <div
                  onClick={() =>
                    navigate(`/editor/${doc.id}`)
                  }
                  style={{
                    height: "120px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                ></div>

                <p
                  style={{
                    margin: 0,
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                  onClick={() =>
                    navigate(`/editor/${doc.id}`)
                  }
                >
                  {doc.title}
                </p>

                <button
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    right: "10px",
                    background: "#d93025",
                    color: "white",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;




