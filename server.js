// server.js
const express = require('express');
const app = express();
const server = app.listen(3000, () => console.log('Server running on port 3000'));

// Serve the p5.js sketch files from a 'public' directory
app.use(express.static('public'));

// Server-side logic: Example of API endpoint
app.get('/api/data', (request, response) => {
    response.json({ message: "Hello from the server!" });
});