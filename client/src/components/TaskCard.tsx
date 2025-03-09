import { Todo } from '@/types';

interface TaskCardProps {
  task: Todo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleComplete }: TaskCardProps) {
  return (
    <div className={`card ${task.isCompleted ? 'card-completed' : ''}`}>
      <div className="task-item">
        <div className="task-content">
          <button
            onClick={onToggleComplete}
            className="task-checkbox"
            aria-label={task.isCompleted ? "Marcar como não concluída" : "Marcar como concluída"}
          >
            {task.isCompleted ? "✓" : "○"}
          </button>
          <span className={task.isCompleted ? 'task-completed' : ''}>
            {task.title}
          </span>
        </div>
        <div className="task-actions">
          <button onClick={onEdit} className="btn btn-small" aria-label="Editar tarefa">
            Editar
          </button>

          <button
            onClick={onDelete} className="btn btn-small btn-danger" aria-label="Excluir tarefa">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}