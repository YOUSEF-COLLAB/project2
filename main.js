// 📦 Install dependencies:
// npm install express mongoose bcryptjs jsonwebtoken cors dotenv python-shell

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { PythonShell } = require('python-shell');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 🌐 MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// 👤 User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  dob: String,
});
const User = mongoose.model('User', userSchema);

// 🔐 Signup route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, dob } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, dob });
    await newUser.save();

    res.status(200).json({ message: 'User created successfully', user: { name, email, dob } });
  } catch (err) {
    res.status(500).json({ message: 'Signup error', error: err.message });
  }
});

// 🔐 Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { name: user.name, email: user.email, dob: user.dob } });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

// 🔐 Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// 🔐 Protected profile route
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// 🤖 Prediction route using Python model
app.post('/api/predict', (req, res) => {
  const { AccX, AccY, AccZ, GyroX, GyroY, GyroZ } = req.body;

  const input = JSON.stringify([AccX, AccY, AccZ, GyroX, GyroY, GyroZ]);

PythonShell.run('models/model.py', { args: [input] }, (err, results) => {
    if (err) return res.status(500).json({ message: 'Model error', error: err.message });
    res.json({ prediction: results[0] });
  });
});

// 🚀 Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
