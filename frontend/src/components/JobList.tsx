import React, { useState } from 'react';
import { Job, JobStatus } from '../types/job';
import {
  Play,
  Check,
  XCircle,
  Trash2,
  Copy,
  CheckCheck,
  AlertTriangle,
  Cpu,
  Code2,
  Database,
  Mail,
  Image,
  FileText,
  Shield,
  Send,
  Plus,
} from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  viewMode?: 'grid' | 'table';
  onUpdateStatus: (id: string, status: JobStatus) => Promise<void>;
  onOpenFailModal: (job: Job) => void;
  onOpenDeleteModal: (job: Job) => void;
  onDeleteJob?: (id: string) => Promise<void>;
  onSimulate: (id: string) => Promise<void>;
  onOpenCreateModal?: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  viewMode = 'grid',
  onUpdateStatus,
  onOpenFailModal,
  onOpenDeleteModal,
  onSimulate,
  onOpenCreateModal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAction = async (id: string, action: () => Promise<void>) => {
    setActionLoadingId(id);
    try {
      await action();
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
      ' · ' +
      date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    );
  };

  // Helper to generate dynamic icon and tech tags based on job type
  const getTypeMetadata = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('data') || lower.includes('etl')) {
      return {
        icon: <Database size={20} />,
        bg: '#eff6ff',
        color: '#2563eb',
        tags: ['DATA', 'ETL', 'OCC-V1'],
        company: 'DataEngine Pipeline',
      };
    }
    if (lower.includes('email') || lower.includes('notif')) {
      return {
        icon: <Mail size={20} />,
        bg: '#fff7ed',
        color: '#ea580c',
        tags: ['BATCH', 'SMTP', 'ATOMIC'],
        company: 'Notification Gateway',
      };
    }
    if (lower.includes('image') || lower.includes('media')) {
      return {
        icon: <Image size={20} />,
        bg: '#f5f3ff',
        color: '#8b5cf6',
        tags: ['FFMPEG', 'GPU', 'S3'],
        company: 'Media Transcoder',
      };
    }
    if (lower.includes('report')) {
      return {
        icon: <FileText size={20} />,
        bg: '#ecfdf5',
        color: '#059669',
        tags: ['ANALYTICS', 'PDF', 'OCC'],
        company: 'Report Generator',
      };
    }
    if (lower.includes('backup') || lower.includes('security')) {
      return {
        icon: <Shield size={20} />,
        bg: '#fef2f2',
        color: '#dc2626',
        tags: ['SNAPSHOT', 'AES-256', 'STATE'],
        company: 'Security Engine',
      };
    }
    if (lower.includes('webhook')) {
      return {
        icon: <Send size={20} />,
        bg: '#eff6ff',
        color: '#3b82f6',
        tags: ['HTTP-HOOK', 'RETRY-EXP', 'WORKER'],
        company: 'Webhook Dispatcher',
      };
    }
    return {
      icon: <Code2 size={20} />,
      bg: '#f1f5f9',
      color: '#475569',
      tags: ['TASK', 'STATE-MACHINE', 'OCC'],
      company: 'Distributed Worker',
    };
  };

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'running':
        return (
          <span className="status-pill-badge running">
            <span className="pulse-dot-sm" /> FULL TIME
          </span>
        );
      case 'pending':
        return <span className="status-pill-badge pending">FREELANCE (PENDING)</span>;
      case 'completed':
        return <span className="status-pill-badge completed">COMPLETED</span>;
      case 'failed':
        return <span className="status-pill-badge failed">FAILED</span>;
      default:
        return <span className="status-pill-badge">{status}</span>;
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="pulse-dot-sm" style={{ width: '24px', height: '24px', background: 'var(--brand-blue)' }} />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>Fetching jobs from cluster...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-circle">
          <AlertTriangle size={28} />
        </div>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800 }}>No Jobs Found</h3>
        <p style={{ maxWidth: '380px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          No jobs match your current filter or search criteria. You can create a new job or reset the active filter.
        </p>
        {onOpenCreateModal && (
          <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ marginTop: '0.5rem' }}>
            <Plus size={16} />
            <span>Create New Job</span>
          </button>
        )}
      </div>
    );
  }

  // 1. Featured Jobs Card Grid View (Matching Behance ApplyRemote Featured Jobs)
  if (viewMode === 'grid') {
    return (
      <div className="jobs-grid">
        {jobs.map((job) => {
          const isActing = actionLoadingId === job.id;
          const meta = getTypeMetadata(job.type);

          return (
            <div key={job.id} className="job-card-item">
              {/* Header: Company Icon + Title + Status Pill */}
              <div className="job-card-header">
                <div
                  className="job-company-icon"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                </div>
                <div className="job-main-info">
                  <h3 className="job-item-title">{job.title}</h3>
                  <div className="job-company-location">
                    <span>{meta.company}</span>
                    <span>•</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                      OCC v{job.version}
                    </span>
                  </div>
                </div>
                <div>{getStatusBadge(job.status)}</div>
              </div>

              {/* Tags Pill Row (VUE, REACT, OCC, etc.) */}
              <div className="job-tags-row">
                <span className="tech-tag-pill" style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                  {job.type}
                </span>
                {meta.tags.map((t) => (
                  <span key={t} className="tech-tag-pill">
                    {t}
                  </span>
                ))}
              </div>

              {/* Failure Error Message if failed */}
              {job.status === 'failed' && job.errorMessage && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent-rose)',
                    background: 'var(--status-failed-bg)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <XCircle size={13} /> {job.errorMessage}
                </div>
              )}

              {/* Footer: Date Started + Action Buttons */}
              <div className="job-card-footer">
                <div className="job-date-text">
                  Started {formatDate(job.createdAt)}
                </div>

                <div className="job-card-actions">
                  {/* Copy UUID */}
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px' }}
                    onClick={() => handleCopy(job.id)}
                    title="Copy full UUID"
                  >
                    {copiedId === job.id ? <CheckCheck size={13} color="#10b981" /> : <Copy size={13} />}
                  </button>

                  {/* Pending Actions */}
                  {job.status === 'pending' && (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAction(job.id, () => onUpdateStatus(job.id, 'running'))}
                        disabled={isActing}
                        title="Transition status: pending -> running"
                      >
                        <Play size={12} />
                        <span>Start</span>
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleAction(job.id, () => onSimulate(job.id))}
                        disabled={isActing}
                        title="Simulate background pipeline execution"
                      >
                        <Cpu size={12} />
                        <span>Simulate</span>
                      </button>
                    </>
                  )}

                  {/* Running Actions */}
                  {job.status === 'running' && (
                    <>
                      <button
                        className="btn btn-sm"
                        style={{ background: '#10b981', color: '#fff' }}
                        onClick={() => handleAction(job.id, () => onUpdateStatus(job.id, 'completed'))}
                        disabled={isActing}
                        title="Transition status: running -> completed"
                      >
                        <Check size={12} strokeWidth={2.5} />
                        <span>Complete</span>
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--status-failed-bg)', color: 'var(--accent-rose)', border: '1px solid var(--accent-rose-border)' }}
                        onClick={() => onOpenFailModal(job)}
                        disabled={isActing}
                        title="Transition status: running -> failed"
                      >
                        <XCircle size={12} />
                        <span>Fail</span>
                      </button>
                    </>
                  )}

                  {/* Delete Button */}
                  <button
                    className="btn btn-ghost btn-icon"
                    style={{ width: '30px', height: '30px', color: 'var(--accent-rose)' }}
                    onClick={() => onOpenDeleteModal(job)}
                    disabled={isActing}
                    title="Delete job"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. Modern Table View
  return (
    <div className="table-container-card">
      <table className="modern-job-table">
        <thead>
          <tr>
            <th>Job Details</th>
            <th>Type</th>
            <th>Status</th>
            <th>OCC Version</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            const isActing = actionLoadingId === job.id;
            const meta = getTypeMetadata(job.type);

            return (
              <tr key={job.id}>
                {/* Title & UUID */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: meta.bg,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {meta.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.925rem' }}>
                        {job.title}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{job.id.slice(0, 8)}...{job.id.slice(-4)}</span>
                        <button
                          onClick={() => handleCopy(job.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                          title="Copy UUID"
                        >
                          {copiedId === job.id ? <CheckCheck size={12} color="#10b981" /> : <Copy size={12} />}
                        </button>
                      </div>
                      {job.status === 'failed' && job.errorMessage && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <XCircle size={12} /> {job.errorMessage}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Job Type */}
                <td>
                  <span className="tech-tag-pill" style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue)' }}>
                    {job.type}
                  </span>
                </td>

                {/* Status */}
                <td>{getStatusBadge(job.status)}</td>

                {/* Version */}
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-pill)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    v{job.version}
                  </span>
                </td>

                {/* Created At */}
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {formatDate(job.createdAt)}
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    {/* Pending Actions */}
                    {job.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAction(job.id, () => onUpdateStatus(job.id, 'running'))}
                          disabled={isActing}
                        >
                          <Play size={12} />
                          <span>Start</span>
                        </button>
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => handleAction(job.id, () => onSimulate(job.id))}
                          disabled={isActing}
                        >
                          <Cpu size={12} />
                          <span>Simulate</span>
                        </button>
                      </>
                    )}

                    {/* Running Actions */}
                    {job.status === 'running' && (
                      <>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#10b981', color: '#fff' }}
                          onClick={() => handleAction(job.id, () => onUpdateStatus(job.id, 'completed'))}
                          disabled={isActing}
                        >
                          <Check size={12} strokeWidth={2.5} />
                          <span>Complete</span>
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--status-failed-bg)', color: 'var(--accent-rose)' }}
                          onClick={() => onOpenFailModal(job)}
                          disabled={isActing}
                        >
                          <XCircle size={12} />
                          <span>Fail</span>
                        </button>
                      </>
                    )}

                    {/* Terminal State notice */}
                    {(job.status === 'completed' || job.status === 'failed') && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginRight: '0.35rem' }}>
                        Terminal
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: '30px', height: '30px', color: 'var(--accent-rose)' }}
                      onClick={() => onOpenDeleteModal(job)}
                      disabled={isActing}
                      title="Delete job"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
