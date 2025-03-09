import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.js';
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return next(createError(401, "Você não está autenticado"));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return next(createError(403, "Token inválido"));
  }
};