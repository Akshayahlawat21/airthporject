import React, { useState } from 'react';
import { CreateJobInput } from '../types/job';
import { X, Sparkles, Briefcase } from 'lucide-react';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateJobInput) => Promise<void>;
}

const PRESET_TYPES = [
  { value: 'data-processing', label: 'Data Processing & ETL' },
  { value: 'email-notification', label: 'Batch Email Notification' },
  { value: 'image-resize', label: 'Media Transcoding & Thumbnail' },
  { value: 'report-generation', label: 'Monthly Financial Report' },
  { value: 'backup', label: 'Database Snapshot & Backup' },
  { value: 'webhook-delivery', label: 'Outbound Webhook Delivery' },
];

export const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState('data-processing');
  const [customType, setCustomType] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalType = isCustom ? customType.trim() || 'custom-task' : selectedType;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        type: finalType,
        autoSimulate,
      });
      setTitle('');
      setCustomType('');
      setIsCustom(false);
      setAutoSimulate(false);
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
                background: 'var(--brand-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)',
              }}
            >
              <Briefcase size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="modal-title">Post New Remote Job</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Enqueue a new task into the distributed state machine
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
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Job Title / Role Description *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Senior Frontend Engineer (React/Vue)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Job Category / Execution Type</label>
              {!isCustom ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select
                    className="form-select"
                    style={{ flex: 1 }}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {PRESET_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} ({t.value})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsCustom(true)}
                  >
                    Custom
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1 }}
                    placeholder="Enter custom key (e.g. ai-inference)"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setIsCustom(false)}
                  >
                    Presets
                  </button>
                </div>
              )}
            </div>

            {/* Auto simulation option */}
            <div
              style={{
                background: 'var(--brand-blue-light)',
                border: '1px solid var(--brand-blue-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() => setAutoSimulate(!autoSimulate)}
            >
              <input
                type="checkbox"
                checked={autoSimulate}
                onChange={(e) => setAutoSimulate(e.target.checked)}
                style={{ marginTop: '0.2rem', cursor: 'pointer' }}
              />
              <div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--brand-blue-text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <Sparkles size={14} /> Auto-execute Worker Simulation
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  The backend background queue worker will automatically execute this job (pending → running → completed) after a 1s delay.
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !title.trim()}>
              {submitting ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
