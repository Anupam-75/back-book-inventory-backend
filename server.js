require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ DB Error:", err));

// Root route
app.get('/', (req, res) => {
  res.send("📚 Book Inventory API is running!");
});

// Routes
app.use('/books', require('./routes/books'));
app.use('/transactions', require('./routes/transactions'));

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
