// import { useNavigate } from 'react-router-dom'

// export default function Login() {
//     const navigate = useNavigate()
//     return (
//     <main
//       aria-label="Start page"
//       style={{
//         height: '100svh',
//         display: 'flex',
//         background: '#18375d',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: '16px',
//         boxSizing: 'border-box'
//       }}
//     >
//      <div style={{ textAlign: 'center' }}>
//         <h1 style={{ color: 'white' }}>Login Page</h1>
//         <h3 style={{ color: 'white' }}>This is a placeholder for the login page. Implement authentication here.</h3>
//         <button
//           onClick={() => navigate('/app')}
//           style={{
//             padding: '16px 28px',
//             borderRadius: '12px',
//             border: 'none',
//             cursor: 'pointer',
//             background: 'rgba(255,255,255,0.92)',
//             color: '#0b2540',
//             marginTop: '20px'
//           }}
//         >
//           Continue to Upload Page
//         </button>
//       </div>

//     </main>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../images/icon.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e) {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // For now i'll just allow login...later when IT stuff is sorted, backend authentication
    navigate("/app");
  }

  return (
    <main
      style={{
        height: "100svh",
        display: "flex",
        background: "#18375d",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "60px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 10px 30px rgba(255, 255, 255, 0.25)",
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "400px",
            height: "300px",
            marginBottom: "20px",
          }}
        />

        {/* <h1 style={{ paddingBottom: "10px", color: "#18375d" }}>
          Student Analysis Tool
        </h1> */}
        {/* return <img src={icon} alt="Logo" />; */}
        <p
          style={{
            marginBottom: "15px",
            color: "#555",
            fontSize: "25px",
            textAlign: "center",
          }}
        >
          <b>Please log in to continue</b>
        </p>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "40px" }}>
            <input
              type="email"
              value={email}
              placeholder="Email Address"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "8px",
                border: "2px solid #22304A",
                backgroundColor: "white",
                color: "black",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "8px",
                border: "2px solid #22304A",
                backgroundColor: "white",
                color: "black",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "red", marginBottom: "12px" }}>{error}</div>
          )}

          <button
            type="submit"
            style={{
              padding: "16px 28px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              background: "#22304A",
              color: "white",
              marginTop: "20px",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            LOG IN
          </button>
        </form>
      </div>
    </main>
  );
}
