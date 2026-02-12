"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLogin = async event => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      email: formData.get("email"),
      password: formData.get("password"),
    };
    // check if the credentials are correct, if so, send user to their dashboard
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/user/verifyLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        alert("Login successful!");
        // is login successful, send user to their dashboard
        router.push(`/user/${responseData.username}`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
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
      <form
        onSubmit={handleLogin}
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
        <input type="text" placeholder="enter your email" style={inputStyle} name="email" required />
        <br />
        <label htmlFor="password">Password:</label>
        <input type="password" placeholder="enter your password" style={inputStyle} name="password" required />
        <button
          style={{ width: "100px", marginInline: " auto", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
          type="submit">
          Login
        </button>
        {/* section to allow user to create an account */}
        <p style={{ textAlign: "center", margin: "10px 0" }}>
          create an account?{" "}
          <Link href="/sign-up" style={{ color: "blue", textDecoration: "underline" }}>
            sign up here
          </Link>
        </p>
      </form>
    </div>
  );
}
