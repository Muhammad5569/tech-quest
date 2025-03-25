require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routers/users');
const questRouter = require('./routers/quests');

// Initialize Express
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/techquest')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

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
const httpServer = http.createServer((req, res) => {
  res.writeHead(301, { 
    "Location": `https://${req.headers.host}${req.url}` 
  });
  res.end();
});

// Start servers
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS Server running on port ${HTTPS_PORT}`);
});

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP redirect server running on port ${HTTP_PORT}`);
});

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});