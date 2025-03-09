import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { createError } from '../utils/error.js';

// Registrar um novo usuário
export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(createError(400, "Email e senha são obrigatórios"));
    }
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(createError(400, "Email já está em uso"));
    }
    
    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Criar usuário
    const newUser = new User({
      email,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    
    // Criar token
    const token = jwt.sign(
      { id: savedUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    // Enviar como cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });
    
    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = savedUser._doc;
    res.status(201).json(userWithoutPassword);
    
  } catch (error) {
    next(error);
  }
};

// Login de usuário
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(createError(400, "Email e senha são obrigatórios"));
    }
    
    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(404, "Usuário não encontrado"));
    }
    
    // Verificar senha
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(createError(400, "Senha incorreta"));
    }
    
    // Criar token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1d" }
    );
    
    // Enviar como cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });
    
    // Retornar usuário sem senha
    const { password: _, ...userWithoutPassword } = user._doc;
    res.status(200).json(userWithoutPassword);
    
  } catch (error) {
    next(error);
  }
};

// Logout de usuário
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout realizado com sucesso" });
};

// Obter usuário atual
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(createError(404, "Usuário não encontrado"));
    }
    
    res.status(200).json(user);
    
  } catch (error) {
    next(error);
  }
};