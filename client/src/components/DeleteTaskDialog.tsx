interface DeleteTaskDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
  }
  
  export default function DeleteTaskDialog({
    isOpen,
    onClose,
    onConfirm,
    isPending,
  }: DeleteTaskDialogProps) {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h2>Confirmar exclusão</h2>
            <button onClick={onClose}className="btn-close" aria-label="Fechar">
              ×
            </button>
          </div>
          
          <div className="modal-content">
            <p>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.
            </p>
          </div>
          
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose} disabled={isPending}>
              Cancelar
            </button>
            <button
              className="btn btn-danger" onClick={onConfirm} disabled={isPending}>
              {isPending ? 'Excluindo...' : 'Excluir'}
            </button>
          </div>
        </div>
      </div>
    );
  }