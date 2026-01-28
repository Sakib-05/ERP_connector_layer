"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const handleLogin = async () => {
    // Call the authentication check endpoint
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/auth/check");
      const data = await response.json();

      if (data.authenticated) {
        // If authenticated, redirect to myTenants page
        router.push("/myTenants");
      } else {
        // If not authenticated, redirect to external authentication URL
        window.location.href = "https://evening-thicket-01409-436e1b971897.herokuapp.com/auth/login";
      }
    } catch (error) {
      console.error("Error during authentication check:", error);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "8px 0",
    boxSizing: "border-box",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  const router = useRouter();
  return (
    <div style={{ margin: 0 }}>
      <header
        style={{
          textAlign: "center",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          backgroundColor: "#fbc267",
          margin: "0",
          fontSize: "24px",
        }}>
        ERP CONNECTOR LAYER PROJECT
      </header>
      <div
        style={{
          border: "1px solid black",
          padding: "20px",
          maxWidth: "400px",
          borderRadius: "8px",
          margin: "50px auto",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          backgroundColor: "#fbc5746c",
        }}>
        <h1 style={{ fontFamily: "Arial, sans-serif", textAlign: "center" }}>Login Page</h1>
        <label htmlFor="email">Email:</label>
        <input type="text" placeholder="enter your email" style={inputStyle} />
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" placeholder="enter your password" style={inputStyle} />
        <button
          style={{ width: "100px", marginInline: " auto", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          type="button"
          onClick={() => handleLogin()}>
          Login
        </button>
      </div>
    </div>
  );
}
