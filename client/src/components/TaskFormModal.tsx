import { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { Todo } from '@/types';
import { TAGS } from '@/tags';

function createDateWithoutTimezone(dateString: string) {
  const parts = dateString.split("T")[0].split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  return new Date(year, month, day, 12, 0, 0);
}


interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { 
    title: string; 
    description: string; 
    startDate: Date | null; 
    endDate: Date | null; 
    tags: string[];
  }) => void;
  task: Todo | null;
  isPending: boolean;
}
export default function TaskFormModal({
  isOpen,
  onClose,
  onSave,
  task,
  isPending,
}: TaskFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '');
      setDescription(task?.description || '');
      setTags(task?.tags || []);
      
      // Converter as datas ISO para objetos Date locais sem deslocamento de timezone
      if (task?.startDate) {
        const date = createDateWithoutTimezone(task.startDate);
        setStartDate(date);
      } else {
        setStartDate(null);
      }
      
      if (task?.endDate) {
        const date = createDateWithoutTimezone(task.endDate);
        setEndDate(date);
      } else {
        setEndDate(null);
      }
      
      setError('');
    }
  }, [isOpen, task]);

  const handleTagToggle = (tag: string) => {
    setTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    // Validação de datas
    if (startDate && endDate && startDate > endDate) {
      setError('A data de início não pode ser posterior à data de término');
      return;
    }
    
    onSave({ title, description, startDate, endDate, tags });
  };
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button 
            onClick={onClose}
            className="btn-close"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="taskTitle">
              Título
            </label>
            <input
              id="taskTitle"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
            />
          </div>
          <div className="form-group">
            <label htmlFor="taskDescription">
              Descrição
            </label>
            <textarea
              id="taskDescription"
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa (opcional)"
              rows={4}
            />
          </div>
          
          {/* Calendário para datas */}
          <div className="date-container">
  <div className="form-group">
    <label htmlFor="startDate">Data de início</label>
    <input
      id="startDate"
      type="date"
      className="form-input"
      value={startDate ? startDate.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const dateString = e.target.value;
        setStartDate(dateString ? new Date(dateString) : null);
      }}
    />
  </div>
  
  <div className="form-group">
    <label htmlFor="endDate">Data de término</label>
    <input
      id="endDate"
      type="date"
      className="form-input"
      value={endDate ? endDate.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const dateString = e.target.value;
        setEndDate(dateString ? new Date(dateString) : null);
      }}
      min={startDate ? startDate.toISOString().split('T')[0] : undefined}
    />
  </div>
</div>  
          
          <div className="form-group">
            <label>Tags</label>
            <div className="tags-group-list">
              {Array.from(new Set(TAGS.map(t => t.group))).map(group => (
                <div key={group} className="tags-group">
                  <div className="tags-group-title">{group}</div>
                  <div className="tags-list">
                    {TAGS.filter(t => t.group === group).map(tag => (
                      <button
                        type="button"
                        key={tag.label}
                        className={`tag-chip${tags.includes(tag.label) ? ' selected' : ''}`}
                        style={{ background: tags.includes(tag.label) ? tag.color : '#f3f6fa', color: tags.includes(tag.label) ? '#fff' : tag.color, borderColor: tag.color }}
                        onClick={() => handleTagToggle(tag.label)}
                      >
                        <span className="tag-icon">{tag.icon}</span> {tag.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="form-error">{error}</div>
          )}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}