require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routers/users');
const questRouter = require('./routers/quests');
const cors = require('cors');

// Initialize Express
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/techquest')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// // Enhanced CORS config
// app.use(cors({
//   origin: ['https://cracked-c0de.github.io', 'http://localhost:5173'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));


// Explicit preflight handling
app.options('*', cors());

// Routes
app.use(userRouter);
app.use(questRouter);

// Self-signed SSL Cert (For Testing - Replace with Let's Encrypt in production)
const httpsOptions = {
  key: fs.readFileSync('/home/ubuntu/key.pem'),    // Generated self-signed key
  cert: fs.readFileSync('/home/ubuntu/cert.pem')   // Generated self-signed cert
};

// Ports
const HTTP_PORT = process.env.HTTP_PORT || 80;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

// Create servers
const httpsServer = https.createServer(httpsOptions, app);
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`HTTP redirect server running on port ${HTTP_PORT}`);
});
// Start servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});



// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});