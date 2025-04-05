export interface User {
    _id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Todo {
    _id: string;
    title: string;
    description: string;
    isCompleted: boolean;
    isPinned: boolean;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    email: string;
    password: string;
  }
  
  export interface TodoInput {
    title: string;
    description?: string;
  }
  
  export interface TodoUpdate {
    title?: string;
    description?: string;
    isCompleted?: boolean;
    isPinned?: boolean;
  }