const express = require('express');
const path = require('path');
const app = express();
const PORT = 5000;

// Serve static files from the website directory
app.use(express.static(path.join(__dirname)));

// Route for the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ELEVEN Website running on port ${PORT}`);
});