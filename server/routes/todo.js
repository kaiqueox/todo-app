import express from 'express';
import { 
  getAllTodos, 
  getTodoById, 
  createTodo, 
  updateTodo, 
  deleteTodo 
} from '../controllers/todo.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Proteger todas as rotas
router.use(verifyToken);

// Rotas de tarefas
router.get('/', getAllTodos);
router.get('/:id', getTodoById);
router.post('/', createTodo);
router.patch('/:id', updateTodo);
router.delete('/:id', deleteTodo);

export default router;