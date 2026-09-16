import React, { useState } from 'react';
import { Job } from '../types/job';
import { X, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ConcurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  onRefresh: () => void;
}

interface TestResult {
  client: string;
  status: number;
  statusText: string;
  durationMs: number;
  data: any;
  isSuccess: boolean;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';

export const ConcurrencyModal: React.FC<ConcurrencyModalProps> = ({
  isOpen,
  onClose,
  jobs,
  onRefresh,
}) => {
  const pendingJobs = jobs.filter((j) => j.status === 'pending');
  const [selectedJobId, setSelectedJobId] = useState<string>(
    pendingJobs[0]?.id || '',
  );
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{ req1: TestResult; req2: TestResult } | null>(null);

  if (!isOpen) return null;

  const runConcurrencyTest = async () => {
    if (!selectedJobId) return;

    setTesting(true);
    setResults(null);

    const makeRequest = async (clientId: string): Promise<TestResult> => {
      const start = performance.now();
      try {
        const response = await fetch(`${API_BASE_URL}/jobs/${selectedJobId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'running' }),
        });
        const duration = Math.round(performance.now() - start);
        const data = await response.json();
        return {
          client: clientId,
          status: response.status,
          statusText: response.statusText,
          durationMs: duration,
          data,
          isSuccess: response.ok,
        };
      } catch (err: any) {
        const duration = Math.round(performance.now() - start);
        return {
          client: clientId,
          status: 0,
          statusText: 'Network / Client Error',
          durationMs: duration,
          data: { message: err.message },
          isSuccess: false,
        };
      }
    };

    // Fire both requests simultaneously at the exact same millisecond
    const [res1, res2] = await Promise.all([
      makeRequest('Worker Instance A (Node #1)'),
      makeRequest('Worker Instance B (Node #2)'),
    ]);

    setResults({ req1: res1, req2: res2 });
    setTesting(false);
    onRefresh();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-pending-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-pending-text)',
              }}
            >
              <Zap size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="modal-title">Live OCC Concurrency Protection Lab</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Simulate simultaneous transitions & verify atomic version fencing
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
              background: 'var(--brand-blue-light)',
              border: '1px solid var(--brand-blue-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              fontSize: '0.825rem',
              color: 'var(--text-main)',
              lineHeight: 1.6,
            }}
          >
            <strong>How this works:</strong> This experiment sends two identical <code>PATCH /jobs/:id/status</code> requests with <code>&#123; status: 'running' &#125;</code> at the <strong>exact same millisecond</strong> using <code>Promise.all()</code>.
            Because of atomic conditional database locking and version checking, exactly <strong>one worker succeeds (200 OK)</strong> while the conflicting attempt is safely rejected (<strong>409 Conflict</strong>).
          </div>

          {pendingJobs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--text-secondary)',
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)',
              }}
            >
              <AlertTriangle size={26} color="#ea580c" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-main)', fontWeight: 700 }}>No Pending Jobs Available</p>
              <p style={{ fontSize: '0.825rem', marginTop: '0.25rem' }}>
                Please create a new job in <code>pending</code> status to test race condition protection.
              </p>
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Select a Pending Job to Challenge:</label>
              <select
                className="form-select"
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  setResults(null);
                }}
              >
                {pendingJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    "{j.title}" — ({j.type}) [v{j.version}] - UUID: {j.id.slice(0, 8)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Test Results */}
          {results && (
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ShieldCheck size={18} color="#10b981" /> Race Collision Resolution:
              </div>
              <div className="concurrency-grid">
                {/* Result Card 1 */}
                <div className={`concurrency-client-card ${results.req1.isSuccess ? 'success' : 'conflict'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {results.req1.client}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: results.req1.isSuccess ? 'var(--status-completed-bg)' : 'var(--status-failed-bg)',
                        color: results.req1.isSuccess ? 'var(--status-completed-text)' : 'var(--status-failed-text)',
                        border: `1px solid ${results.req1.isSuccess ? 'var(--status-completed-border)' : 'var(--status-failed-border)'}`,
                      }}
                    >
                      HTTP {results.req1.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Round-trip Latency: {results.req1.durationMs}ms
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      color: results.req1.isSuccess ? '#059669' : '#dc2626',
                      maxHeight: '110px',
                      overflowY: 'auto',
                    }}
                  >
                    {results.req1.isSuccess ? (
                      <div>
                        ✓ Lock acquired: Status updated to '<strong>{results.req1.data.status}</strong>' (v{results.req1.data.version})
                      </div>
                    ) : (
                      <div>
                        ✗ Conflict prevented: {results.req1.data.message || 'OCC Version Mismatch'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Result Card 2 */}
                <div className={`concurrency-client-card ${results.req2.isSuccess ? 'success' : 'conflict'}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                      {results.req2.client}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.725rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: results.req2.isSuccess ? 'var(--status-completed-bg)' : 'var(--status-failed-bg)',
                        color: results.req2.isSuccess ? 'var(--status-completed-text)' : 'var(--status-failed-text)',
                        border: `1px solid ${results.req2.isSuccess ? 'var(--status-completed-border)' : 'var(--status-failed-border)'}`,
                      }}
                    >
                      HTTP {results.req2.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Round-trip Latency: {results.req2.durationMs}ms
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--border-color)',
                      padding: '0.6rem',
                      borderRadius: 'var(--radius-sm)',
                      color: results.req2.isSuccess ? '#059669' : '#dc2626',
                      maxHeight: '110px',
                      overflowY: 'auto',
                    }}
                  >
                    {results.req2.isSuccess ? (
                      <div>
                        ✓ Lock acquired: Status updated to '<strong>{results.req2.data.status}</strong>' (v{results.req2.data.version})
                      </div>
                    ) : (
                      <div>
                        ✗ Conflict prevented: {results.req2.data.message || 'OCC Version Mismatch'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={runConcurrencyTest}
            disabled={testing || pendingJobs.length === 0}
          >
            <Zap size={16} />
            <span>{testing ? 'Simulating Collision...' : 'Fire 2 Simultaneous Requests (Promise.all)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
