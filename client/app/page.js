"use client";
import { useState, Fragment, useEffect } from "react";

export default function Home() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  async function loadInvoices() {
    try {
      const response = await fetch("https://evening-thicket-01409-436e1b971897.herokuapp.com/invoices");
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
    loadInvoices();
  }, []);

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
    return <h1 style={{ padding: "10px", fontFamily: "Arial, sans-serif", color: "white", backgroundColor: "red"}}>Error: {error}</h1>;
  }

  return (
    <>
      <h1 style={{fontFamily: "Arial, sans-serif",}}>This is the ERP connector layer frontend</h1>
      {/* columns */}
      {/* Name, SentToContact (true/false need ot change to sent/not sent), InvoiceNumber, Reference, DateString, [CurrencyCode,AmountDue,Total, TotalTax] */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          border: "1px solid black",
          borderRadius: "10px",
          padding: "12px",
          marginInline: "20px",
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
          <div style={colStyle}>View</div>
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
