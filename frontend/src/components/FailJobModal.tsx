import React, { useState } from 'react';
import { Job } from '../types/job';
import { X, AlertOctagon } from 'lucide-react';

interface FailJobModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, errorMessage?: string) => Promise<void>;
}

export const FailJobModal: React.FC<FailJobModalProps> = ({
  job,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [errorMessage, setErrorMessage] = useState('Process failed unexpectedly due to worker timeout.');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(job.id, errorMessage.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                color: 'var(--status-failed-text)',
              }}
            >
              <AlertOctagon size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="modal-title">Mark Job as Failed</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Transition job to terminal failure state
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              You are transitioning job <strong style={{ color: 'var(--text-main)' }}>"{job.title}"</strong> (ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{job.id.slice(0, 8)}</code>) to terminal status <strong style={{ color: 'var(--accent-rose)' }}>failed</strong>.
            </p>

            <div className="form-group">
              <label className="form-label">Failure Reason / Error Log Description:</label>
              <textarea
                className="form-textarea"
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                placeholder="Describe why this job execution failed..."
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              style={{ background: 'var(--accent-rose)', color: '#fff' }}
              disabled={submitting}
            >
              {submitting ? 'Marking as Failed...' : 'Confirm Fail Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
