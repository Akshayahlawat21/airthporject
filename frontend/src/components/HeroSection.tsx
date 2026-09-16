import React from 'react';
import { Search, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTag: (tag: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSelectTag,
}) => {
  const exampleTags = [
    { label: 'Front-End', value: 'Front-End' },
    { label: 'Back-End', value: 'Back-End' },
    { label: 'Designer', value: 'Designer' },
    { label: 'data-processing', value: 'data-processing' },
    { label: 'email-notification', value: 'email-notification' },
    { label: 'report-generation', value: 'report-generation' },
  ];

  return (
    <div className="hero-banner-card">
      {/* Left Column: Content & Search */}
      <div className="hero-content">
        <div className="hero-badge-pill">
          <Sparkles size={14} />
          <span>Realtime Distributed Queue & State Machine</span>
        </div>

        <h1 className="hero-title">
          Find <span className="highlight-blue">Remote</span> Job in{' '}
          <span className="highlight-blue">
            Worldwide<span className="underscore">_</span>
          </span>
        </h1>

        <p className="hero-subtitle">
          Work remotely to companies in worldwide. Execute background jobs with atomic state transitions and optimistic concurrency protection.
        </p>

        {/* Search Box with Embedded Pill Button */}
        <div className="hero-search-wrapper">
          <Search size={18} className="hero-search-icon" />
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search for job title, UUID or type..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            type="button"
            className="hero-search-btn"
            onClick={() => {
              const el = document.getElementById('jobs-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Search
          </button>
        </div>

        {/* Quick Example Tags */}
        <div className="hero-examples">
          <span>Example:</span>
          {exampleTags.map((tag) => (
            <button
              key={tag.value}
              type="button"
              className="example-tag-btn"
              onClick={() => onSelectTag(tag.value)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Clean Vector Remote Worker Illustration */}
      <div className="hero-illustration-container">
        <svg
          className="hero-illustration-svg"
          viewBox="0 0 500 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Soft Circles */}
          <circle cx="280" cy="200" r="150" fill="currentColor" fillOpacity="0.03" />
          <circle cx="340" cy="160" r="90" fill="var(--brand-blue)" fillOpacity="0.08" />
          <circle cx="160" cy="280" r="50" fill="var(--accent-orange)" fillOpacity="0.08" />

          {/* Floor Shadow */}
          <ellipse cx="270" cy="350" rx="170" ry="16" fill="currentColor" fillOpacity="0.05" />

          {/* Desk */}
          <rect x="230" y="245" width="180" height="8" rx="4" fill="#64748B" />
          <path d="M260 253 L245 350" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <path d="M380 253 L395 350" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          <path d="M245 310 L395 310" stroke="#CBD5E1" strokeWidth="3" />

          {/* Modern Minimalist Desk Lamp & Plant */}
          <path d="M400 245 L400 215 Q400 200 385 200 L375 200" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M370 195 L382 205 L365 210 Z" fill="#2563EB" />
          
          {/* Plant Pot */}
          <path d="M238 245 L242 225 L254 225 L258 245 Z" fill="#EA580C" />
          <path d="M248 225 Q240 210 235 215 Q245 220 248 225" fill="#10B981" />
          <path d="M248 225 Q255 208 260 212 Q252 220 248 225" fill="#10B981" />

          {/* Laptop on Desk */}
          <path d="M295 245 L345 245 L340 220 L300 220 Z" fill="#1E293B" />
          <rect x="303" y="223" width="34" height="19" rx="2" fill="var(--brand-blue)" />
          <line x1="288" y1="245" x2="352" y2="245" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />

          {/* Modern Chair */}
          <path d="M170 240 Q160 270 175 300 L195 300 Q180 270 190 240 Z" fill="#CBD5E1" />
          <path d="M185 300 L185 345" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <path d="M165 345 L205 345" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          
          {/* Remote Worker Person */}
          {/* Head & Hair */}
          <ellipse cx="205" cy="145" rx="14" ry="17" fill="#FDBA74" />
          <path d="M194 142 Q200 128 218 132 Q222 142 216 148 Q208 140 194 142 Z" fill="#EA580C" />
          
          {/* Torso & Blue Shirt (Matching Behance Character) */}
          <path d="M192 162 L220 162 L232 230 L185 230 Z" fill="var(--brand-blue)" />
          
          {/* Arm & Laptop Typing */}
          <path d="M214 175 L250 205 L298 238" stroke="#FDBA74" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M212 175 L245 200" stroke="var(--brand-blue)" strokeWidth="11" strokeLinecap="round" fill="none" />

          {/* Legs & Trousers (Warm Ochre/Tan) */}
          <path d="M185 230 L260 235 L285 315 L265 315 L245 255 L185 250 Z" fill="#FDBA74" />
          <path d="M265 315 L295 340 L310 338" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Floating Live Badge Chips */}
          <g transform="translate(60, 85)">
            <rect width="130" height="38" rx="19" fill="var(--bg-surface)" stroke="var(--border-color)" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))" />
            <circle cx="20" cy="19" r="8" fill="#10B981" fillOpacity="0.2" />
            <circle cx="20" cy="19" r="4" fill="#10B981" />
            <text x="36" y="16" fill="var(--text-main)" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">OCC Lock Active</text>
            <text x="36" y="27" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono, monospace">v1.0 Atomic</text>
          </g>

          <g transform="translate(320, 75)">
            <rect width="125" height="38" rx="19" fill="var(--bg-surface)" stroke="var(--border-color)" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.06))" />
            <circle cx="20" cy="19" r="8" fill="var(--brand-blue)" fillOpacity="0.2" />
            <circle cx="20" cy="19" r="4" fill="var(--brand-blue)" />
            <text x="36" y="16" fill="var(--text-main)" fontSize="10" fontWeight="700" fontFamily="Plus Jakarta Sans, sans-serif">Active Worker</text>
            <text x="36" y="27" fill="var(--text-muted)" fontSize="8" fontFamily="JetBrains Mono, monospace">Pipeline &lt; 2ms</text>
          </g>
        </svg>
      </div>
    </div>
  );
};
