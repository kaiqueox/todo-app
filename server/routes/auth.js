import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Rotas protegidas
router.get('/current', verifyToken, getCurrentUser);

export default router;