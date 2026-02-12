"use client";

export default function SignUp({ params }) {
  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      surname: formData.get("surname"),
    };
    console.log(data);

    // make a POST request to the server to create a new user
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/user/newUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("User created successfully!");
        // is user created correctly, send user to their dashboard
        window.location.href = `/user/${data.username}`;
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during sign up:", error);
      alert("An error occurred during sign up. Please try again.");
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div
        style={{
          border: "1px solid black",
          padding: "20px",
          borderRadius: "8px",
          backgroundColor: "#fbc5746c",
          fontFamily: "Arial, sans-serif",
          width: "420px",
        }}>
        <h2 style={{ textAlign: "center" }}>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username" style={{ display: "block", marginTop: 8 }}>
            Username
          </label>
          <input
            id="username"
            name="username"
            required
            type="text"
            placeholder="Username"
            style={{
              width: "100%",
              padding: "8px",
              margin: "4px 0 12px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <label htmlFor="name" style={{ display: "block", marginTop: 8 }}>
            First name
          </label>
          <input
            id="name"
            name="name"
            style={{
              width: "100%",
              padding: "8px",
              margin: "4px 0 12px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            type="text"
            required
            placeholder="name"
          />

          <label htmlFor="surname" style={{ display: "block", marginTop: 8 }}>
            Surname
          </label>
          <input
            id="surname"
            name="surname"
            style={{
              width: "100%",
              padding: "8px",
              margin: "4px 0 12px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
            type="text"
            required
            placeholder="surname"
          />

          <label htmlFor="email" style={{ display: "block", marginTop: 8 }}>
            Email
          </label>
          <input
            id="email"
            name="email"
            required
            type="email"
            placeholder="Email"
            style={{
              width: "100%",
              padding: "8px",
              margin: "4px 0 12px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <label htmlFor="password" style={{ display: "block", marginTop: 8 }}>
            Password
          </label>
          <input
            id="password"
            name="password"
            required
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "8px",
              margin: "4px 0 12px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          <button
            type="submit"
            style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "none", backgroundColor: "#fbc267", fontWeight: "bold" }}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}
