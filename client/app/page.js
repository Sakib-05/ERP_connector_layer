"use client";
import { useState, Fragment } from "react";

export default function Home() {
  const [invoices, setInvoices] = useState([]);

  async function loadInvoices() {
    const response = await fetch(
      "https://evening-thicket-01409-436e1b971897.herokuapp.com/invoices",
    );
    const data = await response.json();
    console.log("Response:", data);
    setInvoices(data);
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  // that returns the the date in form Month,day number, year
  function formatDate(dateString) {
    let justDate = dateString.split("T")[0]
    let dateParts= justDate.split("-")
    let year = dateParts[0]
    let month = months[parseInt(dateParts[1]) - 1]
    let day = dateParts[2]
    return `${month}, ${day}, ${year}`

  }

  return (
    <>
      <div>This is the ERP connector layer frontend</div>
      <button onClick={loadInvoices}>Load Invoices</button>
      {/* columns */}
      {/* Name, SentToContact (true/false need ot change to sent/not sent), InvoiceNumber, Reference, DateString, [CurrencyCode,AmountDue,Total, TotalTax] */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          border: "1px solid black",
        }}
      >
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          Contant
        </div>
        {/* SentToContact */}
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          status
        </div>
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          InvoiceNumber
        </div>
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          Reference
        </div>
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          Received Date
        </div>
        <div style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
          View
        </div>

        <br />

        {invoices.map((invoice) => (
          <Fragment key={invoice.InvoiceID}>
            <p>{invoice.Contact.Name}</p>
            <p>{invoice.SentToContact ? "Sent" : "Not Sent"}</p>
            <p>{invoice.InvoiceNumber}</p>
            <p>{invoice.Reference ? invoice.Reference : "No Reference"}</p>
            <p>{formatDate(invoice.DateString)}</p>
            <div>
              <p>
                {invoice.CurrencyCode} {invoice.AmountDue}
              </p>
              <p>
                VAT: {invoice.CurrencyCode} {invoice.TotalTax}
              </p>
            </div>
            <br />
          </Fragment>
        ))}
      </div>
    </>
  );
}
