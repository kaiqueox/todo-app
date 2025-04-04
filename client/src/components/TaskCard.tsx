import { Todo } from '@/types';
interface TaskCardProps {
  task: Todo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onTogglePin: () => void; // Nova prop
}
export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onTogglePin // Novo parâmetro
}: TaskCardProps) {
  return (
    <div className={`card ${task.isCompleted ? 'card-completed' : ''} ${task.isPinned ? 'card-pinned' : ''}`}>
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
            {task.isPinned && <span className="pin-indicator">📌</span>} {/* Indicador visual de fixado */}
            {task.title}
          </span>
        </div>
        <div className="task-actions">
          <button
            onClick={onTogglePin}
            className={`btn btn-small ${task.isPinned ? 'btn-pin-active' : 'btn-pin'}`}
            aria-label={task.isPinned ? "Desafixar tarefa" : "Fixar tarefa"}
          >
            {task.isPinned ? "Desafixar" : "Fixar"} {/* Texto do botão muda conforme estado */}
          </button>
          <button
            onClick={onEdit}
            className="btn btn-small"
            aria-label="Editar tarefa"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="btn btn-small btn-danger"
            aria-label="Excluir tarefa"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}