'use client'
import { useState } from 'react';

export default function Home() {
  const [invoices, setInvoices] = useState([]);

  async function loadInvoices() {
    const response = await fetch('https://evening-thicket-01409-436e1b971897.herokuapp.com/invoices');
    const data = await response.json();
    console.log('Response:', data);
    setInvoices(data);
  }





  return (
    <>
      <div>This is the ERP connector layer frontend</div>
      <button onClick={loadInvoices}>Load Invoices</button>
      <ul>
        {invoices.map((invoice) => (
          <li key={invoice._id}>
            <p>ivoice id = {invoice._id}</p>
            <p> amount = {invoice.AmountDue}</p>
          </li>
        ))}
      </ul>
    </> 
  );
}