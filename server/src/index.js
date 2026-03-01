const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

connectDB();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/ai', require('./routes/attendanceAI')); // ✅ Gemini AI
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/library', require('./routes/library'));
app.use('/api/placements', require('./routes/placements'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/hostel', require('./routes/hostel'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/grading', require('./routes/grading'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/events', require('./routes/events'));
app.use('/api/doubts', require('./routes/doubts'));



app.get('/', (req, res) => {
  res.json({ message: 'Smart Campus API is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});