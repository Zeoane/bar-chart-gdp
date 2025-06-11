// proxy.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3000;
const API_KEY = 'e86b577642bfd672361e9cd14e542e3e'; // Dein API-Key
const API_URL = `https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=${API_KEY}&file_type=json`;

app.use(cors());

// Route für GDP-Daten
app.get('/api/gdp', async (req, res) => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Fehler beim Abrufen der FRED-Daten' });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error('Fehler im Proxy-Server:', err);
        res.status(500).json({ error: 'Interner Serverfehler' });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Proxy läuft unter http://localhost:${PORT}/api/gdp`);
});
