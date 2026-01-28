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

  const router = useRouter();
  return (
    <div>
      <h1 style={{ fontFamily: "Arial, sans-serif" }}>Login Page</h1>
      <label htmlFor="username">Username:</label>
      <input type="text" />
      <label htmlFor="password">Password:</label>
      <input type="password" />
      <button type="button" onClick={() => handleLogin()}>
        Login
      </button>
    </div>
  );
}
