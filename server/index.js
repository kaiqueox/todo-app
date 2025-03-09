import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import todoRoutes from './routes/todo.js';
import connectDB from './utils/connectDB.js';

dotenv.config();

// Conectar ao MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/api/user', authRoutes);
app.use('/api/todos', todoRoutes);

// Home route
app.get('/', (req, res) => {
  res.send('Todo API is running...');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});