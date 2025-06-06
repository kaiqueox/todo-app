import Todo from '../models/Todo.js';
import { createError } from '../utils/error.js';

// Obter todas as tarefas do usuário
export const getAllTodos = async (req, res, next) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    res.status(200).json(todos);
  } catch (error) {
    next(error);
  }
};

// Obter uma tarefa por ID
export const getTodoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);
    
    if (!todo) {
      return next(createError(404, "Tarefa não encontrada"));
    }
    
    // Verificar se o usuário é dono da tarefa
    if (todo.userId.toString() !== req.user.id) {
      return next(createError(403, "Você não tem permissão para ver esta tarefa"));
    }
    
    res.status(200).json(todo);
  } catch (error) {
    next(error);
  }
};

// Criar uma nova tarefa
export const createTodo = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, tags } = req.body;
    
    if (!title) {
      return next(createError(400, "O título é obrigatório"));
    }
    
    const newTodo = new Todo({
      title,
      description: description || '',
      startDate: startDate || null,
      endDate: endDate || null,
      isCompleted: false,
      isPinned: false,
      tags: Array.isArray(tags) ? tags : [],
      userId: req.user.id
    });
    
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('Erro ao criar todo:', error);
    next(error);
  }
};

// Atualizar uma tarefa
export const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, isCompleted, isPinned, tags } = req.body;
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      return next(createError(404, "Tarefa não encontrada"));
    }
    
    // Verificar se o usuário é dono da tarefa
    if (todo.userId.toString() !== req.user.id) {
      return next(createError(403, "Você não tem permissão para atualizar esta tarefa"));
    }
    
    const updatedTodo = await Todo.findByIdAndUpdate(
      id, 
      { 
        title: title !== undefined ? title : todo.title, 
        description: description !== undefined ? description : todo.description,
        startDate: startDate !== undefined ? startDate : todo.startDate,
        endDate: endDate !== undefined ? endDate : todo.endDate,
        isCompleted: isCompleted !== undefined ? isCompleted : todo.isCompleted,
        isPinned: isPinned !== undefined ? isPinned : todo.isPinned,
        tags: tags !== undefined ? tags : todo.tags
      }, 
      { new: true }
    );
    
    res.status(200).json(updatedTodo);
  } catch (error) {
    console.error('Erro ao atualizar todo:', error);
    next(error);
  }
};

// Excluir uma tarefa
export const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const todo = await Todo.findById(id);
    
    if (!todo) {
      return next(createError(404, "Tarefa não encontrada"));
    }
    
    // Verificar se o usuário é dono da tarefa
    if (todo.userId.toString() !== req.user.id) {
      return next(createError(403, "Você não tem permissão para excluir esta tarefa"));
    }
    
    await Todo.findByIdAndDelete(id);
    
    res.status(200).json({ message: "Tarefa excluída com sucesso" });
  } catch (error) {
    next(error);
  }
};