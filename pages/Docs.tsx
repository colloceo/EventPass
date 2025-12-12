import React from 'react';
import ReactMarkdown from 'react-markdown';

const guideContent = `
# System Architecture & Backend Guide

This documentation covers the logical backend architecture requested in the project brief.

## Section A: System Architecture

1.  **Client Layer**: React SPA (Single Page Application) running in browser.
2.  **API Layer**: REST API (Node.js/Express) receiving JSON requests.
3.  **Service Layer**:
    *   **Auth Service**: Handles JWT issuance and validation.
    *   **Ticket Service**: Generates unique IDs, creates QR data.
    *   **Email Service**: Uses SMTP (Nodemailer) to dispatch tickets.
4.  **Data Layer**: PostgreSQL database storing relational data.

**Flow:**
User -> React App -> API Endpoint (/api/tickets) -> Controller -> Database -> Email Service -> User Inbox.

## Section B: Database Schema (PostgreSQL)

\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin'
);

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP NOT NULL,
  location VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id INTEGER REFERENCES events(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'unused', -- 'unused', 'used'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP
);
\`\`\`

## Section C: API Design

**1. Create Event**
*   **POST** \`/api/events\`
*   Body: \`{ "name": "Concert", "date": "2024-12-01", "price": 50 }\`
*   Response: \`{ "id": 1, "message": "Event created" }\`

**2. Generate Ticket**
*   **POST** \`/api/tickets\`
*   Body: \`{ "eventId": 1, "customerName": "John", "customerEmail": "john@doe.com" }\`
*   Response: \`{ "ticketId": "uuid...", "qrUrl": "..." }\`

**3. Verify Ticket**
*   **POST** \`/api/verify\`
*   Body: \`{ "ticketId": "uuid..." }\`
*   Response: \`{ "valid": true, "message": "Access Granted" }\` OR \`{ "valid": false, "message": "Already Used" }\`

## Section D: Backend Code Example (Node.js)

\`\`\`javascript
// server.js
const express = require('express');
const app = express();
const { Pool } = require('pg');
const QRCode = require('qrcode');

app.use(express.json());
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Verify Endpoint
app.post('/api/verify', async (req, res) => {
  const { ticketId } = req.body;
  
  try {
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
    if (result.rows.length === 0) return res.json({ valid: false, message: 'Invalid ID' });
    
    const ticket = result.rows[0];
    
    if (ticket.status === 'used') {
      return res.json({ valid: false, message: 'Already Used', usedAt: ticket.used_at });
    }
    
    // Mark as used
    await pool.query('UPDATE tickets SET status = $1, used_at = NOW() WHERE id = $2', ['used', ticketId]);
    
    res.json({ valid: true, message: 'Valid', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
\`\`\`

## Section F: Setup Guide

1.  **Install Node.js & PostgreSQL**.
2.  **Database**: Run the SQL schema commands in your SQL terminal.
3.  **Backend**:
    *   \`npm init -y\`
    *   \`npm install express pg qrcode cors dotenv\`
    *   Create \`server.js\` with the code above.
    *   Run \`node server.js\`.
4.  **Frontend**:
    *   The code provided in this interface constitutes the frontend.
    *   \`npm install\`
    *   \`npm run dev\`

## Section G: Deployment (GCP)

1.  **Frontend**: Build the React app (\`npm run build\`). Upload the \`dist\` folder to a **Google Cloud Storage** bucket and configure it as a static website.
2.  **Backend**: Containerize the Node.js app using Docker. Deploy to **Google Cloud Run** for serverless scaling.
3.  **Database**: Use **Cloud SQL** for PostgreSQL.
`;

export const Docs: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 prose max-w-none">
      <div className="whitespace-pre-wrap font-mono text-sm text-slate-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
        {guideContent}
      </div>
    </div>
  );
};