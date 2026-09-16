import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Layers,
  Server,
  GitCommit,
  HelpCircle,
  ArrowRight,
  Code2,
} from 'lucide-react';

interface VivaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaGuideModal: React.FC<VivaGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'components' | 'apis' | 'statemachine' | 'vivaqa'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="modal-header" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-blue-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--brand-blue)',
              }}
            >
              <BookOpen size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="modal-title">Viva Preparation & System Architecture Guide</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Comprehensive breakdown of design decisions, component roles, APIs & concurrency protection
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

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            padding: '0.5rem 1.5rem',
            background: 'var(--bg-card-subtle)',
            borderBottom: '1px solid var(--border-color)',
            overflowX: 'auto',
          }}
        >
          <button
            className={`status-pill-btn ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Server size={14} /> 1. End-to-End Flow
          </button>
          <button
            className={`status-pill-btn ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            <Layers size={14} /> 2. Components Breakdown
          </button>
          <button
            className={`status-pill-btn ${activeTab === 'apis' ? 'active' : ''}`}
            onClick={() => setActiveTab('apis')}
          >
            <Code2 size={14} /> 3. REST API Contracts
          </button>
          <button
            className={`status-pill-btn ${activeTab === 'statemachine' ? 'active' : ''}`}
            onClick={() => setActiveTab('statemachine')}
          >
            <GitCommit size={14} /> 4. State Machine & OCC
          </button>
          <button
            className={`status-pill-btn ${activeTab === 'vivaqa' ? 'active' : ''}`}
            onClick={() => setActiveTab('vivaqa')}
          >
            <HelpCircle size={14} /> 5. Viva / Interview Q&A
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {/* TAB 1: END-TO-END FLOW */}
          {activeTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--brand-blue-text)', marginBottom: '0.35rem' }}>
                  🎯 System Architecture Overview
                </h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  This application is a <strong>full-stack, production-grade distributed job queue & state machine dashboard</strong>.
                  It enforces strict unidirectional state transitions and <strong>Optimistic Concurrency Control (OCC)</strong> with atomic version checking to eliminate race conditions.
                </p>
              </div>

              {/* Request Flow Diagram */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  🔄 Lifecycle of a Request:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>1</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>User Interaction (React UI)</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>User clicks "Start Job", "Simulate", "Create Job", or "Delete Job" in the dashboard.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>2</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>API Client Layer (<code>api.ts</code>)</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Executes asynchronous typed HTTP request (fetch) with proper JSON payload and error parsing.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>3</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>NestJS Controller & Validation Pipes (<code>jobs.controller.ts</code>)</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Receives route, sanitizes inputs, and validates payload using <code>class-validator</code> DTOs.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>4</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>State Machine & Concurrency Guard (<code>jobs.service.ts</code>)</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Validates state transition rule (<code>pending → running → completed/failed</code>) and checks expected OCC version.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--brand-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>5</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem' }}>Atomic Database Execution (SQLite / PostgreSQL via TypeORM)</strong>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Executes atomic conditional update: <code>UPDATE jobs SET status = :newStatus, version = version + 1 WHERE id = :id AND status = :oldStatus AND version = :version</code>.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPONENT BREAKDOWN */}
          {activeTab === 'components' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🧱 Frontend & Backend Components Breakdown
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Frontend components */}
                <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '0.5rem' }}>
                    🎨 Frontend React Components
                  </h4>
                  <ul style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.2rem' }}>
                    <li><code>App.tsx</code>: Main orchestrator, manages theme, jobs state, polling interval, and modal states.</li>
                    <li><code>Header.tsx</code>: Top bar with Moon/Sun theme toggle, auto-sync selector, and Post Job button.</li>
                    <li><code>HeroSection.tsx</code>: Behance ApplyRemote hero banner with title, search pill box, quick example tags, and illustration.</li>
                    <li><code>CategorySection.tsx</code>: Squircle category cards for fast filtering.</li>
                    <li><code>StatsCards.tsx</code>: Metric summary counters (Total, Pending, Running, Completed, Failed).</li>
                    <li><code>JobFilters.tsx</code>: Status pill filters, search input, and Grid/Table view switcher.</li>
                    <li><code>JobList.tsx</code>: Featured Job cards & Table layout with action triggers.</li>
                    <li><code>CreateJobModal.tsx</code>: Modal to create/enqueue new jobs with auto-simulation.</li>
                    <li><code>ConcurrencyModal.tsx</code>: Live race condition simulator executing <code>Promise.all()</code>.</li>
                    <li><code>DeleteJobModal.tsx</code>: Confirmation dialog to permanently delete jobs.</li>
                    <li><code>FailJobModal.tsx</code>: Modal to transition running jobs to failed with error description.</li>
                    <li><code>Toast.tsx</code>: Live feedback alert toasts.</li>
                  </ul>
                </div>

                {/* Backend components */}
                <div style={{ background: 'var(--bg-card-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.5rem' }}>
                    ⚡ Backend NestJS Modules
                  </h4>
                  <ul style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.2rem' }}>
                    <li><code>app.module.ts</code>: Root NestJS module configuring TypeORM SQLite/PostgreSQL connection.</li>
                    <li><code>jobs.controller.ts</code>: Exposes REST API endpoints (POST, GET, PATCH, DELETE).</li>
                    <li><code>jobs.service.ts</code>: Core business logic, OCC atomic queries, simulation workers.</li>
                    <li><code>job.entity.ts</code>: TypeORM Entity schema (<code>id</code>, <code>title</code>, <code>type</code>, <code>status</code>, <code>version</code>, <code>createdAt</code>).</li>
                    <li><code>job-state-machine.ts</code>: Pure deterministic state transition validator.</li>
                    <li><code>create-job.dto.ts</code>: Validation rules for creating jobs.</li>
                    <li><code>update-job-status.dto.ts</code>: Validation rules for status transitions.</li>
                    <li><code>http-exception.filter.ts</code>: Standardized global API error response handler.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REST APIS */}
          {activeTab === 'apis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🔌 Complete REST API Contracts
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* POST /jobs */}
                <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#10b981', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>POST</span>
                    <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>/jobs</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Enqueues a new job (status: pending, version: 1)</span>
                  </div>
                  <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.5rem', overflowX: 'auto' }}>
{`// Request Body
{
  "title": "Data Pipeline ETL",
  "type": "data-processing",
  "autoSimulate": false
}
// Response (201 Created):
{ "id": "uuid", "title": "...", "type": "...", "status": "pending", "version": 1, "createdAt": "..." }`}
                  </pre>
                </div>

                {/* GET /jobs */}
                <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>GET</span>
                    <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>/jobs?status=pending&search=ETL</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Retrieves all jobs matching filter</span>
                  </div>
                </div>

                {/* PATCH /jobs/:id/status */}
                <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>PATCH</span>
                    <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>/jobs/:id/status</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Transitions job status with OCC version fencing</span>
                  </div>
                  <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.5rem', overflowX: 'auto' }}>
{`// Request Body:
{ "status": "running" } // or "completed", "failed" with "errorMessage"
// Responses:
// 200 OK -> Transition succeeded, version incremented
// 400 Bad Request -> Invalid transition (e.g. completed -> running)
// 409 Conflict -> Race condition caught (version already changed)`}
                  </pre>
                </div>

                {/* DELETE /jobs/:id */}
                <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>DELETE</span>
                    <code style={{ fontSize: '0.85rem', fontWeight: 700 }}>/jobs/:id</code>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Permanently deletes job from database</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STATE MACHINE & OCC */}
          {activeTab === 'statemachine' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  🔄 State Machine Transition Graph
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '1rem 0', flexWrap: 'wrap' }}>
                  <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--status-pending-bg)', color: 'var(--status-pending-text)', fontWeight: 800, border: '1px solid var(--status-pending-border)' }}>
                    [ pending ]
                  </div>
                  <ArrowRight size={20} color="var(--brand-blue)" />
                  <div style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', background: 'var(--status-running-bg)', color: 'var(--status-running-text)', fontWeight: 800, border: '1px solid var(--status-running-border)' }}>
                    [ running ]
                  </div>
                  <ArrowRight size={20} color="var(--brand-blue)" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--status-completed-bg)', color: 'var(--status-completed-text)', fontWeight: 800, border: '1px solid var(--status-completed-border)' }}>
                      [ completed ] (Terminal)
                    </div>
                    <div style={{ padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', background: 'var(--status-failed-bg)', color: 'var(--status-failed-text)', fontWeight: 800, border: '1px solid var(--status-failed-border)' }}>
                      [ failed ] (Terminal)
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  ⚠️ <strong>Terminal State Invariant:</strong> Once a job reaches <code>completed</code> or <code>failed</code>, it is permanently closed and cannot transition further.
                </p>
              </div>

              {/* OCC Deep Dive */}
              <div style={{ background: 'var(--brand-blue-light)', border: '1px solid var(--brand-blue-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--brand-blue-text)', marginBottom: '0.4rem' }}>
                  🛡️ How Atomic Optimistic Concurrency Control (OCC) Works:
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  Instead of taking expensive pessimistic table locks, each job entity has an integer column <code>version</code>.
                  When transitioning, the SQL executed is:
                </p>
                <pre style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '0.6rem', borderRadius: '6px', fontSize: '0.75rem', margin: '0.5rem 0', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>
UPDATE jobs
SET status = 'running', version = version + 1
WHERE id = :id AND status = 'pending' AND version = :expectedVersion;
                </pre>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  If two workers execute this at the exact same millisecond:
                  <br />• <strong>Worker 1:</strong> matches the row, sets status = 'running', version = 2 (affected rows = 1). <strong>Success (200 OK)</strong>.
                  <br />• <strong>Worker 2:</strong> condition <code>version = 1 AND status = 'pending'</code> is now false! Affected rows = 0.
                  <br />• Backend catches affected = 0 and throws <strong>HTTP 409 Conflict</strong>. Race condition completely prevented!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: VIVA / INTERVIEW QUESTIONS */}
          {activeTab === 'vivaqa' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                🎓 The 4 Core Viva Questions & Model Answers
              </h3>

              {/* Q1 */}
              <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-blue)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Q1: Where should the state machine transition rule be enforced?
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Answer:</strong> The state machine rule MUST be enforced in the <strong>backend application service and database layer</strong>, never solely in the frontend React UI.
                  The React UI is only an untrusted presentation layer. Enforcing rules on the backend ensures business invariants cannot be violated regardless of the client used.
                </div>
              </div>

              {/* Q2 */}
              <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-blue)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Q2: What happens if someone bypasses the React application and calls the API directly?
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Answer:</strong> If someone sends a direct cURL or Postman request (e.g. <code>PATCH /jobs/:id/status</code> with <code>status: 'running'</code> on a completed job), the NestJS pipeline immediately runs:
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                    <li><code>ValidationPipe</code> to validate DTO schema.</li>
                    <li><code>JobStateMachine.canTransition(currentStatus, targetStatus)</code>.</li>
                  </ol>
                  Because the transition is illegal, it throws a <code>BadRequestException (HTTP 400)</code> with a detailed error before any database mutation occurs.
                </div>
              </div>

              {/* Q3 */}
              <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-blue)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Q3: What happens when two requests arrive at nearly the same time?
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Answer:</strong> If two browser tabs or workers both see a job as <code>pending</code> and simultaneously send <code>PATCH /jobs/:id/status</code>, standard read-then-write logic causes a <strong>Race Condition / TOCTOU (Time-of-Check to Time-of-Use)</strong> anomaly.
                  Both requests would read <code>status: pending</code>, pass validation, and duplicate worker execution.
                </div>
              </div>

              {/* Q4 */}
              <div style={{ background: 'var(--bg-card-subtle)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ fontWeight: 800, color: 'var(--brand-blue)', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                  Q4: How would you prevent an invalid or inconsistent state?
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  <strong>Answer:</strong> We implement <strong>Optimistic Concurrency Control (OCC)</strong> with an atomic conditional database query:
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                    <li>We include a <code>version</code> column in the database entity.</li>
                    <li>The update query requires <code>WHERE id = :id AND status = 'pending' AND version = :expectedVersion</code>.</li>
                    <li>The database's atomic row-level lock ensures only 1 transaction modifies the row; the second finds 0 matching rows and is rejected with <code>HTTP 409 Conflict</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
