const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // ✅ This now works

dotenv.config();

const app = express();
const allowedOrigins = ['https://iu-frontend-hazel.vercel.app/']; // Add your frontend origin(s) here
app.use(cors({
  origin: 'https://iu-frontend-hazel.vercel.app', // allow your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
