require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS, images, etc.)
app.use(express.static(__dirname));

// ── Email transporter ──────────────────────────────────────────────────────
// Uses SMTP credentials stored in the .env file.
// SMTP_HOST  – your mail server hostname  (e.g. smtp.domeneshop.no)
// SMTP_PORT  – usually 587 (STARTTLS) or 465 (SSL)
// SMTP_USER  – the full email address you are sending FROM
// SMTP_PASS  – the SMTP password for that account
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',   // true only for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// ── Contact form endpoint ──────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
    const { name, email, service, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Alle felt må fylles ut.' });
    }

    const serviceLabels = {
        catering:   'Catering',
        restaurant: 'Bordreservasjon',
        event:      'Privat arrangement',
    };
    const serviceText = serviceLabels[service] || service || 'Ikke valgt';

    const mailOptions = {
        from:    `"Mats & Martin Nettsiden" <${process.env.SMTP_USER}>`,
        to:      'cc@matsogmartin.no',
        replyTo: email,
        subject: `Ny forespørsel fra ${name} – ${serviceText}`,
        text: [
            `Navn:     ${name}`,
            `E-post:   ${email}`,
            `Tjeneste: ${serviceText}`,
            ``,
            `Melding:`,
            message,
        ].join('\n'),
        html: `
            <h2 style="color:#b8960c;">Ny forespørsel fra nettsiden</h2>
            <table cellpadding="6" style="font-family:sans-serif;font-size:15px;">
                <tr><td><strong>Navn:</strong></td><td>${name}</td></tr>
                <tr><td><strong>E-post:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td><strong>Tjeneste:</strong></td><td>${serviceText}</td></tr>
            </table>
            <hr/>
            <p style="font-family:sans-serif;font-size:15px;white-space:pre-wrap;">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[contact] E-post sendt fra ${email}`);
        res.status(200).json({ success: true, message: 'Takk! Vi tar kontakt snart.' });
    } catch (err) {
        console.error('[contact] Feil ved sending av e-post:', err.message);
        res.status(500).json({ success: false, message: 'Noe gikk galt. Vennligst prøv igjen.' });
    }
});

// Fallback – serve index.html for unknown routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});
