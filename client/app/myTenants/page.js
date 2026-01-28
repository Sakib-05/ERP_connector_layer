"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function MyTenants(params) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadTenants() {
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/tenants");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response:", data);
      setTenants(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load tenants:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  if (loading) {
    return <h1 style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>Loading...</h1>;
  }
  if (error) {
    return <h1 style={{ padding: "10px", fontFamily: "Arial, sans-serif", color: "white", backgroundColor: "red" }}>Error: {error}</h1>;
  }

  return (
    <div>
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
      <h1 style={{ fontFamily: "Arial, sans-serif" }}>My Tenants</h1>
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        {tenants.map(tenant => (
          <div
            key={tenant.tenantId}
            className="tenant-card"
            style={{
              fontFamily: "Arial, sans-serif",
              border: "1px solid black",
              borderRadius: "8px",
              backgroundColor: "#ddddddc3",
              width: "300px",
              padding: "10px",
              margin: "10px 0",
              color: "black",
            }}>
            <Link href={`/myTenants/${tenant.tenantId}`}>
              <h3 style={{ margin: 0, color: "black", padding: "5px", backgroundColor: "#ffffff6c" }}>Tenant Name: {tenant.tenantName}</h3>
              <p style={{ margin: 0, color: "black", padding: "5px" }}>tenant type: {tenant.tenantType}</p>
              <p style={{ margin: 0, color: "black", padding: "5px" }}>Tenant ID: {tenant.tenantId}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
