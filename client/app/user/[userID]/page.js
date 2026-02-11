import React from "react";

export default function page(params) {
  // get the username from the url
  const { username } = React.use(params);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <h1>Welcome, {username}!</h1>
    </div>
  );
}
