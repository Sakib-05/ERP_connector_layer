"use client";
import { useState, Fragment, useEffect } from "react";
import { usePathname } from "next/navigation";
import React from "react";

export default function Invoices({ params }) {
  // Nextjs 15+ passes params differently, so need to use React.use to get params
  // this is a dynamic folder named `[tenantId]`, so the router will pass the value on
  // `params.tenantId`.
  const { tenantId } = React.use(params);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tenant, setTenant] = useState(null);


  const pathname = usePathname();

  async function getTenantData(tenantId) {
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/tenants");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response:", data);
      const tenant = data.find(t => t.tenantId === tenantId);
      setTenant(tenant);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load tenant data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInvoices() {
    try {
      const response = await fetch(`https://evening-thicket-01409-436e1b971897.herokuapp.com/invoices/${tenantId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Response:", data);
      setInvoices(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load invoices:", err);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    // reload this when tenantId changes
    if (tenantId) {
      loadInvoices();
      getTenantData(tenantId);
    }
  }, [tenantId]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // that returns the the date in form Month,day number, year
  function formatDate(dateString) {
    let justDate = dateString.split("T")[0];
    let dateParts = justDate.split("-");
    let year = dateParts[0];
    let month = months[parseInt(dateParts[1]) - 1];
    let day = dateParts[2];
    return `${month}, ${day}, ${year}`;
  }

  const colStyle = { fontWeight: "bold", paddingLeft: "6px" };
  const rowStyle = { fontFamily: "Arial, sans-serif", margin: 0, paddingLeft: "6px" };

  if (loading) {
    return <h1 style={{ padding: "10px", fontFamily: "Arial, sans-serif" }}>Loading...</h1>;
  }
  if (error) {
    return <h1 style={{ padding: "10px", fontFamily: "Arial, sans-serif", color: "white", backgroundColor: "red" }}>Error: {error}</h1>;
  }

  return (
    <>
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
      <p>Current pathname: {pathname}</p>
      {tenant && (
        <div style={{ padding: "10px", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
          <h2>Tenant Details</h2>
          <p><strong>Name:</strong> {tenant.tenantName}</p>
          <p><strong>Type:</strong> {tenant.tenantType}</p>
          <p><strong>ID:</strong> {tenant.tenantId}</p>
        </div>
      )}
      <br />

      {/* columns */}
      {/* Name, SentToContact (true/false need ot change to sent/not sent), InvoiceNumber, Reference, DateString, [CurrencyCode,AmountDue,Total, TotalTax] */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          border: "1px solid black",
          borderRadius: "10px",
          padding: "12px",
          marginInline: "80px",
          columnGap: "12px",
          rowGap: "12px",
        }}>
        <div
          style={{
            gridColumn: "1 / -1",
            backgroundColor: "#fbc5746c",
            borderBottom: "1px solid black",
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            columnGap: "12px",
            alignItems: "center",
            padding: "6px 0",
            fontFamily: "Arial, sans-serif",
          }}>
          <div style={colStyle}>Contact</div>
          <div style={colStyle}>status</div>
          <div style={colStyle}>InvoiceNumber</div>
          <div style={colStyle}>Reference</div>
          <div style={colStyle}>Received Date</div>
          <div style={colStyle}>Total</div>
        </div>

        {invoices.map(invoice => (
          <Fragment key={invoice.InvoiceID}>
            <p style={rowStyle}>{invoice.Contact.Name}</p>
            <p style={rowStyle}>{invoice.SentToContact ? "Sent" : "Not Sent"}</p>
            <p style={rowStyle}>{invoice.InvoiceNumber}</p>
            <p style={rowStyle}>{invoice.Reference ? invoice.Reference : "No Reference"}</p>
            <p style={rowStyle}>{formatDate(invoice.DateString)}</p>
            <div style={{ paddingLeft: "6px" }}>
              <p style={{ fontFamily: "Arial, sans-serif", margin: 0 }}>
                {invoice.CurrencyCode} {invoice.AmountDue}
              </p>
              <p style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", color: "gray", margin: 0 }}>
                VAT: {invoice.CurrencyCode} {invoice.TotalTax}
              </p>
            </div>
            {/* a madeup div to act as a horizontal line separator */}
            <div style={{ gridColumn: "1 / -1", borderTop: "1px solid #dcdcdc" }} />
          </Fragment>
        ))}
      </div>
    </>
  );
}
