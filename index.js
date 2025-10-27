// server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const os = require("os");

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
require('./startup/routes')(app);

// Function to get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    
    for (const connection of networkInterface) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (connection.family === 'IPv4' && !connection.internal) {
        return connection.address;
      }
    }
  }
  
  return 'localhost'; // Fallback if no external IP found
}

// Server
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces
const localIP = getLocalIPAddress();

app.listen(port, host, () => {
  console.log('='.repeat(60));
  console.log('🚀 MobiSales Server Started Successfully!');
  console.log('='.repeat(60));
  console.log(`📍 Server Host: ${host}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`💻 Local Access: http://localhost:${port}`);
  console.log(`📱 Network Access: http://${localIP}:${port}`);
  console.log(`🌐 Device IP Address: ${localIP}`);
  console.log('='.repeat(60));
  console.log('Available Endpoints:');
  console.log(`  • Auth: http://${localIP}:${port}/api/auth/login`);
  console.log(`  • Customers: http://${localIP}:${port}/api/customers`);
  console.log(`  • Products: http://${localIP}:${port}/api/products`);
  console.log(`  • Salesmen: http://${localIP}:${port}/api/salesmen`);
  console.log('='.repeat(60));
});
