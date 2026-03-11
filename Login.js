import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users")) || [];

      const matchedUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (matchedUser) {
        localStorage.setItem("loggedIn", "true");
        navigate("/dashboard");
      } else {
        alert("Invalid credentials");
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Segoe UI",
        background:
          "linear-gradient(-45deg,#6a11cb,#2575fc,#4facfe,#00f2fe)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 12s ease infinite",
      }}
    >
      <style>
        {`

        @keyframes gradientBG {
          0%{background-position:0% 50%;}
          50%{background-position:100% 50%;}
          100%{background-position:0% 50%;}
        }

        @keyframes fadeUp{
          from{
            opacity:0;
            transform:translateY(40px);
          }
          to{
            opacity:1;
            transform:translateY(0);
          }
        }

        .card{
          animation:fadeUp .6s ease;
        }

        .input{
          width:100%;
          padding:12px;
          border-radius:8px;
          border:1px solid #ccc;
          margin-bottom:15px;
          font-size:14px;
          transition:all .25s;
        }

        .input:focus{
          outline:none;
          border-color:#2575fc;
          box-shadow:0 0 6px rgba(37,117,252,.4);
        }

        .btn{
          width:100%;
          padding:12px;
          border:none;
          border-radius:8px;
          background:#2575fc;
          color:white;
          font-size:15px;
          font-weight:600;
          cursor:pointer;
          transition:.25s;
        }

        .btn:hover{
          background:#1a5fe0;
          transform:scale(1.03);
        }

        .spinner{
          border:3px solid rgba(255,255,255,.3);
          border-top:3px solid white;
          border-radius:50%;
          width:16px;
          height:16px;
          animation:spin 1s linear infinite;
          display:inline-block;
        }

        @keyframes spin{
          to{transform:rotate(360deg);}
        }

        `}
      </style>

      <div
        className="card"
        style={{
          width: "360px",
          padding: "40px",
          borderRadius: "16px",
          backdropFilter: "blur(14px)",
          background: "rgba(255,255,255,.15)",
          boxShadow: "0 10px 40px rgba(0,0,0,.25)",
          textAlign: "center",
          color: "white",
        }}
      >
        {/* Logo */}
        <div
  style={{
    width: "60px",
    height: "60px",
    background: "white",
    borderRadius: "12px",
    margin: "0 auto 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2575fc",
    fontFamily: "Segoe UI",
  }}
>
  H
</div>

        <h2 style={{ marginBottom: "6px" }}>Welcome Back</h2>
        <p style={{ fontSize: "13px", opacity: 0.8 }}>
          Login to continue editing documents
        </p>

        <form onSubmit={handleLogin} style={{ marginTop: "25px" }}>
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPass ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "12px",
                top: "10px",
                cursor: "pointer",
                fontSize: "12px",
                color: "#2575fc",
                background: "white",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              {showPass ? "Hide" : "Show"}
            </span>
          </div>

          <button className="btn" type="submit">
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          New user?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              cursor: "pointer",
              fontWeight: "bold",
              textDecoration: "underline",
            }}
          >
            Create account
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;