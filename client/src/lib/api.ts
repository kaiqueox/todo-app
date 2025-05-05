import { User, LoginCredentials, RegisterCredentials, Todo, TodoInput, TodoUpdate } from '../types';

const API_BASE = 'http://localhost:3000';

// Funções auxiliares
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    try {
      const parsedError = JSON.parse(error);
      throw new Error(parsedError.message || 'Ocorreu um erro');
    } catch {
      throw new Error(error || response.statusText || 'Ocorreu um erro');
    }
  }
  return response.json();
}

// API de autenticação
export const authApi = {
  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE}/api/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    return handleResponse<User>(response);
  },

  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await fetch(`${API_BASE}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    return handleResponse<User>(response);
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/user/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await fetch(`${API_BASE}/api/user/current`, {
      credentials: 'include',
    });
    return handleResponse<User>(response);
  },
};

// API de tarefas
export const todoApi = {
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await fetch(`${API_BASE}/api/todos`, {
      credentials: 'include',
    });
    return handleResponse<Todo[]>(response);
  },

  createTodo: async (todo: TodoInput): Promise<Todo> => {
    const response = await fetch(`${API_BASE}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(todo),
      credentials: 'include',
    });
    return handleResponse<Todo>(response);
  },

  updateTodo: async (id: string, updates: TodoUpdate): Promise<Todo> => {
    const response = await fetch(`${API_BASE}/api/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(updates),
      credentials: 'include',
    });
    return handleResponse<Todo>(response);
  },

  deleteTodo: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/api/todos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse<void>(response);
  },
};