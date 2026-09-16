import React from 'react';
import { Layers, Plus, Zap, RefreshCw, Moon, Sun, BookOpen } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenCreateModal: () => void;
  onOpenConcurrencyModal: () => void;
  onOpenVivaGuide: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  autoRefreshInterval: number;
  onIntervalChange: (interval: number) => void;
  activeNav?: string;
  onNavClick?: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenCreateModal,
  onOpenConcurrencyModal,
  onOpenVivaGuide,
  onRefresh,
  isRefreshing,
  autoRefreshInterval,
  onIntervalChange,
  activeNav = 'home',
  onNavClick,
}) => {
  return (
    <header className="top-navbar">
      <div className="top-navbar-inner">
        {/* Brand Group */}
        <div className="brand-group" onClick={() => onNavClick && onNavClick('home')}>
          <div className="brand-badge">
            <Layers size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span>Apply</span>
            <span className="highlight">Remote</span>
            <span className="brand-tag">OCC v1.0</span>
          </div>
        </div>

        {/* Center Navigation Links (Matching Behance ApplyRemote Header) */}
        <nav className="nav-links">
          <a
            href="#home"
            className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavClick && onNavClick('home');
            }}
          >
            Home
          </a>
          <a
            href="#jobs"
            className={`nav-item ${activeNav === 'jobs' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavClick && onNavClick('jobs');
            }}
          >
            Remote Jobs
          </a>
          <a
            href="#concurrency"
            className={`nav-item ${activeNav === 'concurrency' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onOpenConcurrencyModal();
            }}
          >
            Concurrency Lab
          </a>
          <a
            href="#viva"
            className={`nav-item ${activeNav === 'viva' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onOpenVivaGuide();
            }}
            style={{ color: 'var(--brand-blue)', fontWeight: 700 }}
          >
            📖 Viva Guide
          </a>
        </nav>

        {/* Right Nav Actions */}
        <div className="nav-actions">
          {/* Viva Guide Trigger */}
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onOpenVivaGuide}
            title="Open Viva Prep & Architecture Guide"
          >
            <BookOpen size={14} />
            <span>Viva Guide</span>
          </button>

          {/* Light / Dark Mode Toggle Moon/Sun Button */}
          <button
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'light' ? (
              <Moon size={18} strokeWidth={2.2} />
            ) : (
              <Sun size={18} strokeWidth={2.2} color="#f59e0b" />
            )}
          </button>

          {/* Auto Refresh selector */}
          <div className="auto-sync-box" title="Auto-refresh interval">
            <span className={`auto-sync-dot ${autoRefreshInterval > 0 ? '' : 'inactive'}`} />
            <span>Sync:</span>
            <select
              value={autoRefreshInterval}
              onChange={(e) => onIntervalChange(Number(e.target.value))}
              className="auto-sync-select"
            >
              <option value={0}>Off</option>
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
            </select>
          </div>

          {/* Manual Refresh */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh jobs data"
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin-icon' : ''} />
          </button>

          {/* Concurrency Simulator Modal Trigger */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={onOpenConcurrencyModal}
            title="Simulate race conditions and atomic optimistic locking"
          >
            <Zap size={14} color="#f59e0b" />
            <span>Test OCC</span>
          </button>

          {/* Create / Post Job Trigger (Pill button like Behance 'Post Job') */}
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} strokeWidth={2.5} />
            <span>Post Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
