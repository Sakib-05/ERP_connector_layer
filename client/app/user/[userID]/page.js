"use client";
import React from "react";
import { useState, use } from "react";

export default function dashboard({ params }) {
  const { userID } = use(params);

  const [view, setView] = useState("dashboard");

  const activeStyle = {
    background: "linear-gradient(90deg,#ff8a00,#ffb74d)",
    color: "#fff",
    boxShadow: "0 6px 18px rgba(255,133,0,0.18)",
    padding: "15px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  };

  const baseStyle = { padding: "15px", borderRadius: "4px", cursor: "pointer", fontFamily: "Arial, sans-serif" };

  return (
    <div>
      <header style={{ textAlign: "right", fontFamily: "Arial, sans-serif", fontWeight: "bold" }}>
        <h1 style={{ margin: "0px", padding: "10px", color: "#fd4f15" }}>E-invoicing platform</h1>
      </header>

      <main style={{ display: "flex", backgroundColor: "#c9c9c96c", height: "100vh" }}>
        {/* this will be the side navbar */}
        {/* dashboard */}
        {/* Entities */}
        {/* Invoices */}
        {/* profile*/}

        <section style={{ width: "200px", marginInline: "10px"}}>
          <h4 style={view == "dashboard" ? activeStyle : baseStyle} onClick={() => setView("dashboard")}>
            Dashboard
          </h4>
          <h4 style={view == "entities" ? activeStyle : baseStyle} onClick={() => setView("entities")}>
            Entities
          </h4>
          <h4 style={view == "invoices" ? activeStyle : baseStyle} onClick={() => setView("invoices")}>
            Invoices
          </h4>
          <h4 style={view == "profile" ? activeStyle : baseStyle} onClick={() => setView("profile")}>
            Profile
          </h4>
        </section>
        <section style={{ backgroundColor: "white", margin: "10px", padding: "20px", borderRadius: "8px", flex: 1 }}>
          <h4>{view}</h4>
          <h4>hello {userID}</h4>
        </section>
      </main>
    </div>
  );
}
