import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { todoApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Todo } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskFormModal from '@/components/TaskFormModal';
import DeleteTaskDialog from '@/components/DeleteTaskDialog';
import { queryClient } from '@/lib/queryClient';

// Função auxiliar para ajustar datas e evitar problemas de fuso horário
function formatDateToUTC(date: Date): string {
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate());
  
  // Formatar a data ajustada como ISO string
  return adjustedDate.toISOString();
}
  

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Todo | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [newlyPinnedTaskId, setNewlyPinnedTaskId] = useState<string | null>(null);
  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading: tasksLoading,
    isError: tasksError,
    refetch: refreshTasks,
  } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => todoApi.getAllTodos(),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
  
  useEffect(() => {
    if (newlyPinnedTaskId) {
      const timer = setTimeout(() => {
        setNewlyPinnedTaskId(null);
      }, 600); 
      
      return () => clearTimeout(timer);
    }
  }, [newlyPinnedTaskId]);
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: { 
      title: string; 
      description: string; 
      startDate: Date | null; 
      endDate: Date | null; 
    }) => {
      // Converter as datas para strings ISO com ajuste de fuso horário
      const apiData = {
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate ? formatDateToUTC(taskData.startDate) : null,
        endDate: taskData.endDate ? formatDateToUTC(taskData.endDate) : null
      };
      
      return todoApi.createTodo(apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'], refetchType: 'active' });
      refreshTasks();
      setIsTaskModalOpen(false);
    },
  });
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: any 
    }) => {
      // Processar datas para evitar problemas de fuso horário
      const apiData = { ...data };
      
      if (data.startDate !== undefined) {
        apiData.startDate = data.startDate ? formatDateToUTC(data.startDate) : null;
      }
      
      if (data.endDate !== undefined) {
        apiData.endDate = data.endDate ? formatDateToUTC(data.endDate) : null;
      }
      
      return todoApi.updateTodo(id, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'], refetchType: 'active' });
      refreshTasks();
      setIsTaskModalOpen(false);
      setEditingTask(null);
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => todoApi.deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'], refetchType: 'active' });
      refreshTasks();
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
  function handleSaveTask(data: { 
    title: string; 
    description: string; 
    startDate: Date | null; 
    endDate: Date | null; 
  }) {
    if (editingTask) {
      updateTaskMutation.mutate(
        { id: editingTask._id, data },
        {
          onSuccess: () => {
            refreshTasks(); 
          }
        }
      );
    } else {
      createTaskMutation.mutate(
        data,
        {
          onSuccess: () => {
            refreshTasks();
          }
        }
      );
    }
  }
  function handleToggleComplete(task: Todo) {
    updateTaskMutation.mutate(
      {
        id: task._id,
        data: { isCompleted: !task.isCompleted }
      },
      {
        onSuccess: () => {
          refreshTasks(); 
        }
      }
    );
  }
  // Função para alternar o estado fixado/não-fixado com animação
  function handleTogglePin(task: Todo) {
    // Se estamos fixando a tarefa (não estava fixada antes), definir o ID para animação
    if (!task.isPinned) {
      setNewlyPinnedTaskId(task._id);
    }
    
    updateTaskMutation.mutate(
      {
        id: task._id,
        data: { isPinned: !task.isPinned }
      },
      {
        onSuccess: () => {
          refreshTasks(); 
        }
      }
    );
  }
  function handleConfirmDelete() {
    if (taskToDelete !== null) {
      deleteTaskMutation.mutate(
        taskToDelete,
        {
          onSuccess: () => {
            refreshTasks();
          }
        }
      );
    }
  }
  // Função para organizar tarefas
  function organizeTasksByPin(taskList: Todo[]) {
    const pinnedTasks = taskList.filter(task => task.isPinned);
    const unpinnedTasks = taskList.filter(task => !task.isPinned);
    
    // Ordenar tarefas não fixadas: não completadas primeiro, depois por data de término
    const sortedUnpinnedTasks = [...unpinnedTasks].sort((a, b) => {
      // Primeiro por completude
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      
      // Depois por data de término (com prioridade para as que têm data)
      if (a.endDate && !b.endDate) return -1;
      if (!a.endDate && b.endDate) return 1;
      
      if (a.endDate && b.endDate) {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      
      // Por último, ordenar por data de criação (mais recentes primeiro)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Ordenar tarefas fixadas: não completadas primeiro, depois por data de término
    const sortedPinnedTasks = [...pinnedTasks].sort((a, b) => {
      if (!a.isCompleted && b.isCompleted) return -1;
      if (a.isCompleted && !b.isCompleted) return 1;
      
      if (a.endDate && !b.endDate) return -1;
      if (!a.endDate && b.endDate) return 1;
      
      if (a.endDate && b.endDate) {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return {
      pinnedTasks: sortedPinnedTasks,
      unpinnedTasks: sortedUnpinnedTasks
    };
  }
  // Organizar tarefas
  const { pinnedTasks, unpinnedTasks } = organizeTasksByPin(tasks);
  // Verificar o estado das mutações
  const isCreatePending = createTaskMutation.status === 'pending';
  const isUpdatePending = updateTaskMutation.status === 'pending';
  const isDeletePending = deleteTaskMutation.status === 'pending';
  const isLogoutPending = logoutMutation.status === 'pending';
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1>Minhas Tarefas</h1>
        
        <div className="user-menu">
          <span className="user-email">{user?.email || ''}</span>
          <button 
            onClick={() => logoutMutation.mutate()} 
            className="btn btn-small"
            disabled={isLogoutPending}
          >
            {isLogoutPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="app-content">
        {/* Seção de tarefas fixadas */}
        {pinnedTasks.length > 0 && (
          <div className="pinned-tasks-container">
            <div className="pinned-tasks-header">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1v4m0 18v-4M4 12H1m22 0h-3M6.3 17.7l-2.8 2.8M20.5 3.5l-2.8 2.8M17.7 17.7l2.8 2.8M3.5 3.5l2.8 2.8"></path>
              </svg>
              <span>Tarefas Fixadas ({pinnedTasks.length})</span>
            </div>
            <div className="pinned-tasks-list">
              {pinnedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task._id)}
                  onToggleComplete={() => handleToggleComplete(task)}
                  onTogglePin={() => handleTogglePin(task)}
                  isNewlyPinned={task._id === newlyPinnedTaskId}
                />
              ))}
            </div>
          </div>
        )}
        
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
        
        {/* Lista de tarefas não fixadas */}
        {unpinnedTasks.length > 0 && (
          <div className="task-list">
            {unpinnedTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={() => handleEditTask(task)}
                onDelete={() => handleDeleteTask(task._id)}
                onToggleComplete={() => handleToggleComplete(task)}
                onTogglePin={() => handleTogglePin(task)}
                isNewlyPinned={task._id === newlyPinnedTaskId}
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
        isPending={isCreatePending || isUpdatePending}
      />
      
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        isPending={isDeletePending}
      />
    </div>
  );
}