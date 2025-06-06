import { useState } from 'react';
import { Todo } from '@/types';
import { TAGS } from '@/tags';

interface TaskCardProps {
  task: Todo;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onTogglePin: () => void;
  isNewlyPinned?: boolean;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onToggleComplete,
  onTogglePin,
  isNewlyPinned = false
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Função para determinar se deve mostrar o botão "Mostrar mais"
  const hasLongDescription = task.description && task.description.length > 100;
  
  // Texto da descrição, truncado se necessário e não expandido
  const displayDescription = !expanded && hasLongDescription
    ? `${task.description.substring(0, 100)}...`
    : task.description;
    
  // Formatação de datas corrigida para evitar problemas de fuso horário
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      // Extrair os componentes da data diretamente da string ISO
      const parts = dateString.split("T")[0].split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      
      const date = new Date(year, month, day);
      
      // Formatar para localização brasileira
      return date.toLocaleDateString('pt-BR');
    } catch (e) {
      return null;
    }
  };
  
  const startDateFormatted = formatDate(task.startDate);
  const endDateFormatted = formatDate(task.endDate);
  
  // Verificar proximidade do prazo
  const getDeadlineStatus = () => {
    if (!task.endDate || task.isCompleted) return null;
    
    const today = new Date();
    const endDate = new Date(task.endDate);
    
    // Ajustar para comparação apenas de data sem horas
    const todayUTC = new Date(Date.UTC(
      today.getFullYear(),
      today.getMonth(), 
      today.getDate()
    ));
    
    const endDateUTC = new Date(Date.UTC(
      endDate.getFullYear(),
      endDate.getMonth(), 
      endDate.getDate()
    ));
    
    const daysRemaining = Math.floor((endDateUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) return 'overdue';
    if (daysRemaining <= 2) return 'danger';
    if (daysRemaining <= 5) return 'warning';
    return null;
  };
  
  const deadlineStatus = getDeadlineStatus();
  
  // Classes para a animação
  const cardClasses = `
    card 
    ${task.isCompleted ? 'card-completed' : ''} 
    ${task.isPinned ? 'card-pinned' : ''} 
    ${isNewlyPinned ? 'task-item-enter' : ''}
  `;

  return (
    <div className={cardClasses}>
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
            
            {/* Aqui as tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="task-tags">
                {task.tags.map(tagLabel => {
                  const tag = TAGS.find(t => t.label === tagLabel);
                  if (!tag) return null;
                  return (
                    <span
                      key={tag.label}
                      className="task-tag"
                      style={{
                        background: tag.color,
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '0.2em 0.8em',
                        fontSize: '0.92em',
                        marginRight: '0.4em',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3em'
                      }}
                    >
                      <span className="tag-icon">{tag.icon}</span> {tag.label}
                    </span>
                  );
                })}
              </div>
            )}
            
            {/* Mostrar descrição se existir */}
            {task.description && (
              <div className="task-description">
                {displayDescription}
                
                {/* Botão "Mostrar mais" apenas se a descrição for longa */}
                {hasLongDescription && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }} 
                    className="btn-link"
                  >
                    {expanded ? 'Mostrar menos' : 'Mostrar mais'}
                  </button>
                )}
              </div>
            )}
            
            {/* Mostrar datas se existirem */}
            {(startDateFormatted || endDateFormatted) && (
              <div className={`task-dates ${deadlineStatus ? `deadline-${deadlineStatus}` : ''}`}>
                <span>
                  {startDateFormatted && (
                    <>
                      <span>Início: {startDateFormatted}</span>
                    </>
                  )}
                  
                  {startDateFormatted && endDateFormatted && (
                    <span className="task-date-separator">•</span>
                  )}
                  
                  {endDateFormatted && (
                    <>
                      <span>Término: {endDateFormatted}</span>
                      {deadlineStatus === 'overdue' && <span> (Atrasada)</span>}
                      {deadlineStatus === 'danger' && <span> (Urgente)</span>}
                      {deadlineStatus === 'warning' && <span> (Em breve)</span>}
                    </>
                  )}
                </span>
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