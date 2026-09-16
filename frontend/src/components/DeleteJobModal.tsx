import React, { useState } from 'react';
import { Job } from '../types/job';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteJobModal: React.FC<DeleteJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !job) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirm(job.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-failed-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
              }}
            >
              <Trash2 size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="modal-title">Delete Job</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Permanently remove job from queue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              background: 'var(--status-failed-bg)',
              border: '1px solid var(--status-failed-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
            }}
          >
            <AlertTriangle size={20} color="var(--accent-rose)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--accent-rose)' }}>"{job.title}"</strong>?
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                UUID: {job.id} · Type: {job.type} · Status: {job.status}
              </div>
              <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)' }}>
                This action cannot be undone and will permanently remove this record from the database.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ background: 'var(--accent-rose)', color: '#fff', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Job'}
          </button>
        </div>
      </div>
    </div>
  );
};
