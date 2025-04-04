import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { todoApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Todo } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskFormModal from '@/components/TaskFormModal';
import DeleteTaskDialog from '@/components/DeleteTaskDialog';
import { queryClient } from '@/hooks/useAuth';
export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    isError: tasksError,
  } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => todoApi.getAllTodos(),
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: { title: string }) => todoApi.createTodo(taskData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsTaskModalOpen(false);
    },
  });
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; isCompleted?: boolean; isPinned?: boolean } }) => 
      todoApi.updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    },
  });
  function handleOpenNewTaskModal() {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }
  function handleEditTask(task: Todo) {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }
  function handleDeleteTask(taskId: string) {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  }
  function handleSaveTask(data: { title: string }) {
    if (editingTask) {
      updateTaskMutation.mutate({ id: editingTask._id, data });
    } else {
      createTaskMutation.mutate(data);
    }
  }
  function handleToggleComplete(task: Todo) {
    updateTaskMutation.mutate({
      id: task._id,
      data: { isCompleted: !task.isCompleted }
    });
  }
  // Nova função para alternar o estado fixado/não-fixado
  function handleTogglePin(task: Todo) {
    updateTaskMutation.mutate({
      id: task._id,
      data: { isPinned: !task.isPinned }
    });
  }
  function handleConfirmDelete() {
    if (taskToDelete !== null) {
      deleteTaskMutation.mutate(taskToDelete);
    }
  }
  // Função para ordenar tarefas: fixadas primeiro, depois não completadas, depois completadas
  function sortTasks(taskList: Todo[]) {
    return [...taskList].sort((a, b) => {
      // Primeiro, ordenar por fixadas (isPinned)
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Depois, ordenar por não completadas
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      
      // Finalmente, ordenar por data de criação (mais recentes primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  // Tarefas ordenadas para exibição
  const sortedTasks = sortTasks(tasks);
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Minhas Tarefas</h1>
        
        <div className="user-menu">
          <span className="user-email">{user?.email}</span>
          <button 
            onClick={() => logoutMutation.mutate()} 
            className="btn btn-small"
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="app-content">
        {/* Empty State */}
        {!tasksLoading && tasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>Nenhuma tarefa ainda</h2>
            <p>Adicione sua primeira tarefa usando o botão abaixo</p>
            <button onClick={handleOpenNewTaskModal} className="btn btn-primary">
              Nova Tarefa
            </button>
          </div>
        )}
        
        {/* Task List */}
        {sortedTasks.length > 0 && (
          <div className="task-list">
            {sortedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task._id)}
                onToggleComplete={() => handleToggleComplete(task)}
                onTogglePin={() => handleTogglePin(task)} // Nova prop
              />
            ))}
          </div>
        )}
        
        {/* Loading State */}
        {tasksLoading && (
          <div className="loading-state">
            <div className="loader"></div>
          </div>
        )}
        
        {/* Error State */}
        {tasksError && (
          <div className="error-state">
            <p>Erro ao carregar tarefas. Por favor, tente novamente.</p>
          </div>
        )}
      </main>
      
      {/* Floating Action Button */}
      <button
        onClick={handleOpenNewTaskModal}
        className="fab"
        aria-label="Adicionar nova tarefa"
      >
        +
      </button>
      
      {/* Modals */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
      
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={deleteTaskMutation.isPending}
      />
    </div>
  );
}