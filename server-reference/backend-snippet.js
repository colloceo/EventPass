// This file is a reference for the Node.js Backend implementation requested in Section D.
// It is not used by the browser-based React demo.

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
    user: 'dbuser',
    host: 'localhost',
    database: 'eventpass',
    password: 'secretpassword',
    port: 5432,
});

// Email Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. Create Event
app.post('/api/events', async (req, res) => {
    const { name, date, location, price } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO events (name, date, location, price) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, date, location, price]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Generate Ticket
app.post('/api/tickets', async (req, res) => {
    const { eventId, customerName, customerEmail } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO tickets (event_id, customer_name, customer_email) VALUES ($1, $2, $3) RETURNING *',
            [eventId, customerName, customerEmail]
        );
        const ticket = result.rows[0];

        // Generate QR
        const qrCodeUrl = await QRCode.toDataURL(ticket.id);

        // Send Email
        await transporter.sendMail({
            from: 'noreply@eventpass.com',
            to: customerEmail,
            subject: 'Your Event Ticket',
            html: `
                <h1>Ticket for Event #${eventId}</h1>
                <p>Hi ${customerName}, here is your ticket.</p>
                <img src="${qrCodeUrl}" />
            `
        });

        res.json({ ticket, qrCodeUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Verify Ticket
app.post('/api/verify', async (req, res) => {
    const { ticketId } = req.body;
    try {
        const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [ticketId]);
        
        if (result.rows.length === 0) {
            return res.json({ valid: false, message: 'Invalid Ticket ID' });
        }

        const ticket = result.rows[0];

        if (ticket.status === 'used') {
            return res.json({ valid: false, message: 'Ticket Already Used', usedAt: ticket.used_at });
        }

        // Mark as used
        await pool.query('UPDATE tickets SET status = $1, used_at = NOW() WHERE id = $2', ['used', ticketId]);

        res.json({ valid: true, message: 'Ticket Verified', ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => {
    console.log('EventPass API running on port 3000');
});