import React from 'react';
import { Search, X, LayoutGrid, List } from 'lucide-react';
import { JobStats } from '../types/job';

interface JobFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  stats: JobStats;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  stats,
  viewMode,
  onViewModeChange,
}) => {
  const tabs = [
    { key: 'all', label: 'All', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'running', label: 'Running', count: stats.running },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'failed', label: 'Failed', count: stats.failed },
  ];

  return (
    <div className="filter-toolbar" id="jobs-section">
      {/* Status Filter Pills */}
      <div className="filter-status-pills">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`status-pill-btn ${statusFilter === tab.key ? 'active' : ''}`}
            onClick={() => onStatusChange(tab.key)}
          >
            <span>{tab.label}</span>
            <span className="counter-tag">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Right Toolbar: Inline Search & View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1', justifyContent: 'flex-end', minWidth: '260px' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', padding: '0.45rem 1.8rem 0.45rem 2.2rem', fontSize: '0.825rem', borderRadius: 'var(--radius-full)' }}
            placeholder="Filter list..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              style={{
                position: 'absolute',
                right: '0.6rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* View Mode Switcher (Grid vs Table) */}
        <div className="view-mode-toggle" title="Switch layout">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Featured Jobs Card View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => onViewModeChange('table')}
            title="Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
