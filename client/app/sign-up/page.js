'use client';

export default function SignUp(params) {

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
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
        }}>
        <h2 style={{ textAlign: "center" }}>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input
            required
            type="text"
            placeholder="Username"
            style={{
              width: "100%",
              padding: "8px",
              margin: "8px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",              
            }}
          />
          <input
            required
            type="email"
            placeholder="Email"
            style={{
              width: "100%",
              padding: "8px",
              margin: "8px 0",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <input
            required
            type="password"
            placeholder="Password"
            style={{
              width: "100%",
              padding: "8px",
              margin: "8px 0",
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
