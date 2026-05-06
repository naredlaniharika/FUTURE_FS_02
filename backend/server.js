const dns = require('dns');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Force use of public DNS servers for Atlas hostname resolution
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
const authRoutes  = require('./routes/auth');
const leadRoutes  = require('./routes/leads');

app.use('/api/auth',  authRoutes);
app.use('/api/leads', leadRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Mini CRM API is running!', status: 'ok' });
});

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mini-crm';
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
process.env.JWT_SECRET = JWT_SECRET;

if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI not set. Using local MongoDB at mongodb://127.0.0.1:27017/mini-crm');
}
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set. Using fallback secret. Set JWT_SECRET in .env for production.');
}

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT_ATTEMPTS = 3;

const startServer = (port, attempt = 1) => {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < MAX_PORT_ATTEMPTS) {
      const nextPort = port + 1;
      console.warn(`⚠️  Port ${port} is already in use. Trying port ${nextPort}...`);
      startServer(nextPort, attempt + 1);
    } else if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use and no alternative ports are available.`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });
};

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    startServer(DEFAULT_PORT);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
