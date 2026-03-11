import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      background: "#f1f3f4"
    }}>
      <h1 style={{ fontSize: "40px" }}>DocSync</h1>

      <button
        onClick={() => navigate("/editor")}
        style={{
          padding: "12px 24px",
          background: "#1a73e8",
          color: "white",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        Create New Document
      </button>
    </div>
  )
}
