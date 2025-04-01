require('dotenv').config();
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routers/users');
const questRouter = require('./routers/quests');
const cors = require('cors');
const morgan =require('morgan')
// Initialize Express
const app = express();
app.use(morgan('tiny'))
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/techquest')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Routes
app.use(userRouter);
app.use(questRouter);
const keyPath = process.env.SSL_KEY_PATH
const certPath = process.env.SSL_CERTIFICAT_PATH
// Self-signed SSL Cert (For Testing - Replace with Let's Encrypt in production)
const httpsOptions = {
  key: fs.readFileSync(keyPath),    // Generated self-signed key
  cert: fs.readFileSync(certPath)   // Generated self-signed cert
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