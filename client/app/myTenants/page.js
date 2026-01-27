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
      <h1 style={{ fontFamily: "Arial, sans-serif" }}>My Tenants</h1>
      <ul>
        {tenants.map(tenant => (
          <li key={tenant.tenantId} style={{ fontFamily: "Arial, sans-serif" }}>
            <Link href={`/myTenants/${tenant.tenantId}`}>
              <p>Tenant ID: {tenant.tenantId}</p>
              <p>Tenant Name: {tenant.tenantName}</p>
              <p>tenant type: {tenant.tenantType}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
