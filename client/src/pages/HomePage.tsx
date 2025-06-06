import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { todoApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Todo } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskFormModal from '@/components/TaskFormModal';
import DeleteTaskDialog from '@/components/DeleteTaskDialog';
import { queryClient } from '@/lib/queryClient';
import { TAGS } from '@/tags';

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
      tags: string[];
    }) => {
      // Converter as datas para strings ISO com ajuste de fuso horário
      const apiData = {
        title: taskData.title,
        description: taskData.description,
        startDate: taskData.startDate ? formatDateToUTC(taskData.startDate) : null,
        endDate: taskData.endDate ? formatDateToUTC(taskData.endDate) : null,
        tags: taskData.tags
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
    tags: string[];
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
      return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
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

      return new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime();
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

  const pinnedCount = pinnedTasks.length;
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const incompleteCount = totalTasks - completedCount;

  const [filter, setFilter] = useState<'all' | 'pinned' | 'completed' | 'incomplete'>('all');

  function filterTasks(tasks: Todo[], filter: string): Todo[] {
    switch (filter) {
      case 'pinned':
        return tasks.filter(task => task.isPinned);
      case 'completed':
        return tasks.filter(task => task.isCompleted);
      case 'incomplete':
        return tasks.filter(task => !task.isCompleted);
      case 'all':
      default:
        return tasks;
    }
  }
  
  const filteredTasks = filterTasks(tasks, filter);

  // Organizar as tarefas filtradas
  const { pinnedTasks: filteredPinnedTasks, unpinnedTasks: filteredUnpinnedTasks } = organizeTasksByPin(filteredTasks);

  return (
    <div className="app-container">
      {/* Sidebar fixa */}
      <aside className="sidebar">
        <h1 className="sidebar-title">Minhas Tarefas</h1>
        <div className="user-info">
          <div className="user-avatar">{user?.email?.[0]?.toUpperCase() || 'U'}</div>
          <span className="user-email">{user?.email || ''}</span>
          <button
            onClick={() => logoutMutation.mutate()}
            className="btn btn-small btn-secondary btn-logout"
            disabled={isLogoutPending}
          >
            {isLogoutPending ? 'Saindo...' : 'Sair'}
          </button>
        </div>
        <button
          className="btn btn-primary sidebar-new-task"
          onClick={handleOpenNewTaskModal}
        >
          + Nova Tarefa
        </button>
        <div className="sidebar-section-title">FILTROS</div>
        <div className="filter-buttons">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="filter-icon">📅</span>
            <span>Todas as tarefas</span>
            <span className="filter-badge">{tasks.length}</span>
          </button>
          <button
            className={`filter-button ${filter === 'incomplete' ? 'active' : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            <span className="filter-icon">⏳</span>
            <span>Em andamento</span>
            <span className="filter-badge">{tasks.filter(t => !t.isCompleted).length}</span>
          </button>
          <button
            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            <span className="filter-icon">✅</span>
            <span>Concluídas</span>
            <span className="filter-badge">{tasks.filter(t => t.isCompleted).length}</span>
          </button>
          <button
            className={`filter-button ${filter === 'pinned' ? 'active' : ''}`}
            onClick={() => setFilter('pinned')}
          >
            <span className="filter-icon">📌</span>
            <span>Fixadas</span>
            <span className="filter-badge">{tasks.filter(t => t.isPinned).length}</span>
          </button>
        </div>
      </aside>
      {/* Área principal com wrapper para padding e centralização */}
      <div className="main-wrapper">
        {/* Header card sempre visível */}
        <div className="header-card">
          <div>
            <div className="header-card-title">Todas as Tarefas</div>
            <div className="header-card-sub">{tasks.length} tarefas no total</div>
          </div>
          <div className="header-card-user">
            <button
              className="btn btn-primary btn-small"
              onClick={handleOpenNewTaskModal}
            >
              Nova Tarefa
            </button>
          </div>
        </div>
        {/* Conteúdo principal */}
        <main className="app-content">
          {/* Seção de tarefas fixadas */}
          {filteredPinnedTasks.length > 0 && (
            <div className="pinned-tasks-container">
              <div className="pinned-tasks-header">
                <span>📌</span>
                <span>Tarefas Fixadas ({filteredPinnedTasks.length})</span>
              </div>
              <div className="pinned-tasks-list">
                {filteredPinnedTasks.map((task) => (
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
              <div className="empty-icon">📄</div>
              <div className="empty-state-title">Nenhuma tarefa ainda</div>
              <div className="empty-state-desc">Adicione sua primeira tarefa para começar a organizar seu dia</div>
              <button onClick={handleOpenNewTaskModal} className="btn btn-primary btn-small">
                Nova Tarefa
              </button>
            </div>
          )}
          {/* Lista de tarefas não fixadas */}
          {filteredUnpinnedTasks.length > 0 && (
            <div className="unpinned-tasks-container">
              <div className="unpinned-tasks-list">
                {filteredUnpinnedTasks.map((task) => (
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
      </div>
      {/* Modais */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(data) => handleSaveTask(data)}
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