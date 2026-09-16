import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Job, JobStats, JobStatus, CreateJobInput } from './types/job';
import { api } from './services/api';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategorySection, CATEGORIES } from './components/CategorySection';
import { StatsCards } from './components/StatsCards';
import { JobFilters } from './components/JobFilters';
import { JobList } from './components/JobList';
import { CreateJobModal } from './components/CreateJobModal';
import { ConcurrencyModal } from './components/ConcurrencyModal';
import { FailJobModal } from './components/FailJobModal';
import { DeleteJobModal } from './components/DeleteJobModal';
import { Toast, ToastMessage } from './components/Toast';

export const App: React.FC = () => {
  // Theme state: 'light' | 'dark'
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('applyremote_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light'; // Default to light mode matching Behance reference
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3000);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isConcurrencyOpen, setIsConcurrencyOpen] = useState<boolean>(false);
  const [failTargetJob, setFailTargetJob] = useState<Job | null>(null);
  const [deleteTargetJob, setDeleteTargetJob] = useState<Job | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync theme with DOM and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('applyremote_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch jobs & stats
  const fetchData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsRefreshing(true);
      try {
        const [jobsData, statsData] = await Promise.all([
          api.getJobs({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchQuery,
          }),
          api.getStats(),
        ]);
        setJobs(jobsData);
        setStats(statsData);
      } catch (err: any) {
        if (!isSilent) {
          showToast(`Failed to fetch jobs: ${err.message}`, 'error');
        }
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter, searchQuery, showToast],
  );

  // Initial load & when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, fetchData]);

  // Filter jobs by selected category on client side
  const filteredJobs = useMemo(() => {
    if (selectedCategory === 'all') return jobs;
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    if (!cat || !cat.typeMatch) return jobs;
    return jobs.filter((job) =>
      cat.typeMatch!.some(
        (match) =>
          job.type.toLowerCase().includes(match.toLowerCase()) ||
          job.title.toLowerCase().includes(match.toLowerCase()),
      ),
    );
  }, [jobs, selectedCategory]);

  // Handlers
  const handleCreateJob = async (input: CreateJobInput) => {
    try {
      const created = await api.createJob(input);
      showToast(`Job "${created.title}" enqueued successfully!`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast(`Error creating job: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleUpdateStatus = async (id: string, targetStatus: JobStatus, errorMessage?: string) => {
    try {
      const updated = await api.updateJobStatus(id, {
        status: targetStatus,
        errorMessage,
      });
      showToast(`Job status changed to '${updated.status}' (OCC v${updated.version})`, 'success');
      await fetchData();
    } catch (err: any) {
      showToast(`State transition rejected: ${err.message}`, 'error');
      throw err;
    }
  };

  const handleConfirmDelete = async (id: string) => {
    // Optimistic removal for instant UI response
    setJobs((prev) => prev.filter((j) => j.id !== id));
    try {
      const res = await api.deleteJob(id);
      showToast(res.message || 'Job permanently deleted from queue', 'success');
      await fetchData(true);
    } catch (err: any) {
      showToast(`Failed to delete job: ${err.message}`, 'error');
      await fetchData(true);
    }
  };

  const handleSimulate = async (id: string) => {
    try {
      await api.triggerSimulation(id);
      showToast('Background worker simulation dispatched for job!', 'info');
      await fetchData();
    } catch (err: any) {
      showToast(`Simulation failed: ${err.message}`, 'error');
    }
  };

  const handleSelectExampleTag = (tag: string) => {
    setSearchQuery(tag);
    const el = document.getElementById('jobs-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper">
      {/* Top Navbar with Moon / Sun Toggle */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onOpenConcurrencyModal={() => setIsConcurrencyOpen(true)}
        onRefresh={() => fetchData(false)}
        isRefreshing={isRefreshing}
        autoRefreshInterval={autoRefreshInterval}
        onIntervalChange={setAutoRefreshInterval}
        onNavClick={(nav) => {
          if (nav === 'jobs') {
            const el = document.getElementById('jobs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      <main className="main-container">
        {/* Behance Hero Section with Search & Remote Worker Illustration */}
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectTag={handleSelectExampleTag}
        />

        {/* Categories Section (Squircle Cards matching Behance reference) */}
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            const el = document.getElementById('jobs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Live Metrics / Stats Summary */}
        <StatsCards
          stats={stats}
          activeStatus={statusFilter}
          onSelectStatus={setStatusFilter}
        />

        {/* Featured Jobs Header & Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="section-header-row">
            <h2 className="section-title">
              Featured Jobs{' '}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({filteredJobs.length} available)
              </span>
            </h2>
          </div>

          <JobFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            stats={stats}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* Job Queue List (Grid Cards vs Table View) */}
        <JobList
          jobs={filteredJobs}
          loading={loading}
          viewMode={viewMode}
          onUpdateStatus={handleUpdateStatus}
          onOpenFailModal={(job) => setFailTargetJob(job)}
          onOpenDeleteModal={(job) => setDeleteTargetJob(job)}
          onSimulate={handleSimulate}
          onOpenCreateModal={() => setIsCreateOpen(true)}
        />
      </main>

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateJob}
      />

      <ConcurrencyModal
        isOpen={isConcurrencyOpen}
        onClose={() => setIsConcurrencyOpen(false)}
        jobs={jobs}
        onRefresh={() => fetchData(true)}
      />

      <DeleteJobModal
        job={deleteTargetJob}
        isOpen={!!deleteTargetJob}
        onClose={() => setDeleteTargetJob(null)}
        onConfirm={handleConfirmDelete}
      />

      <FailJobModal
        job={failTargetJob}
        isOpen={!!failTargetJob}
        onClose={() => setFailTargetJob(null)}
        onSubmit={async (id, reason) => {
          await handleUpdateStatus(id, 'failed', reason);
        }}
      />

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
