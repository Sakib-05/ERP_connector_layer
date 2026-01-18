import './globals.css'

export const metadata = {
  title: 'ERP connector layer frontend',
  description: 'frontend to display invoice data stored in the MongoDB database by communicating with the backend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
