import React from 'react';
import { JobStats } from '../types/job';
import { Layers, Clock, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  stats: JobStats;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  stats,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      key: 'all',
      label: 'Total Jobs',
      value: stats.total,
      icon: <Layers size={18} strokeWidth={2.4} />,
      iconClass: 'total',
    },
    {
      key: 'pending',
      label: 'Pending',
      value: stats.pending,
      icon: <Clock size={18} strokeWidth={2.4} />,
      iconClass: 'pending',
    },
    {
      key: 'running',
      label: 'Running',
      value: stats.running,
      icon: <PlayCircle size={18} strokeWidth={2.4} />,
      iconClass: 'running',
    },
    {
      key: 'completed',
      label: 'Completed',
      value: stats.completed,
      icon: <CheckCircle2 size={18} strokeWidth={2.4} />,
      iconClass: 'completed',
    },
    {
      key: 'failed',
      label: 'Failed',
      value: stats.failed,
      icon: <AlertCircle size={18} strokeWidth={2.4} />,
      iconClass: 'failed',
    },
  ];

  return (
    <div className="stats-bar">
      {cards.map((card) => {
        const isActive = activeStatus === card.key;
        return (
          <div
            key={card.key}
            className={`stat-item-card ${isActive ? 'active' : ''}`}
            onClick={() => onSelectStatus(card.key)}
            role="button"
            tabIndex={0}
          >
            <div className="stat-data">
              <span className="stat-title">{card.label}</span>
              <span className="stat-number">{card.value}</span>
            </div>
            <div className={`stat-icon-wrapper ${card.iconClass}`}>
              {card.icon}
            </div>
          </div>
        );
      })}
    </div>
  );
};
