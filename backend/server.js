const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware cors test 1
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: "API is running" });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/lost-items', require('./routes/lostItemRoutes'));
app.use('/api/found-items', require('./routes/foundItemRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/claims', require('./routes/claimRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
