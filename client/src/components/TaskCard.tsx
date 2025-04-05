import { useState } from 'react';
import { Todo } from '@/types';


interface TaskCardProps {
  task: Todo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onTogglePin: () => void;
}
export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onTogglePin
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Função para determinar se deve mostrar o botão "Mostrar mais"
  const hasLongDescription = task.description && task.description.length > 100;
  
  // Texto da descrição, truncado se necessário e não expandido
  const displayDescription = !expanded && hasLongDescription
    ? `${task.description.substring(0, 100)}...`
    : task.description;
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
          <div>
            <span className={task.isCompleted ? 'task-completed' : ''}>
              {task.isPinned && <span className="pin-indicator">📌</span>}
              {task.title}
            </span>
            
            {/* Mostrar descrição se existir */}
            {task.description && (
              <div className="task-description">
                {displayDescription}
                
                {/* Botão "Mostrar mais" apenas se a descrição for longa */}
                {hasLongDescription && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar propagar clique
                      setExpanded(!expanded);
                    }} 
                    className="btn-link"
                  >
                    {expanded ? 'Mostrar menos' : 'Mostrar mais'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="task-actions">
          <button
            onClick={onTogglePin}
            className={`btn btn-small ${task.isPinned ? 'btn-pin-active' : 'btn-pin'}`}
            aria-label={task.isPinned ? "Desafixar tarefa" : "Fixar tarefa"}
          >
            {task.isPinned ? "Desafixar" : "Fixar"}
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