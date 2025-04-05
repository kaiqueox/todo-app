import { useEffect, useState } from 'react';
import { Todo } from '@/types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => void;
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle(task?.title || '');
      setDescription(task?.description || ''); //inicializa com descrição
      setError('');
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }
    
    onSave({ title, description });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="btn-close"aria-label="Fechar">
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
            {error && (
              <div className="form-error">{error}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">
              descrição
            </label>
            <textarea
            id="taskDescription"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da tarefa (opicional)"
            rows={4}
            />
            </div>
            
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
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