import React from 'react';
import {
  Layers,
  Code2,
  Palette,
  ShieldCheck,
  Compass,
  Gamepad2,
  Database,
  Mail,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  typeMatch?: string[];
}

interface CategorySectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CATEGORIES: CategoryItem[] = [
  {
    id: 'all',
    label: 'All Jobs',
    icon: <Layers size={22} />,
  },
  {
    id: 'development',
    label: '</> Development',
    icon: <Code2 size={22} />,
    typeMatch: ['data-processing', 'webhook-delivery', 'custom-task', 'development'],
  },
  {
    id: 'design',
    label: 'Design',
    icon: <Palette size={22} />,
    typeMatch: ['image-resize', 'design', 'ui-ux'],
  },
  {
    id: 'security',
    label: 'Security',
    icon: <ShieldCheck size={22} />,
    typeMatch: ['backup', 'security', 'auth-sync'],
  },
  {
    id: 'research',
    label: 'Research',
    icon: <Compass size={22} />,
    typeMatch: ['report-generation', 'research', 'analytics'],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: <Gamepad2 size={22} />,
    typeMatch: ['gaming', 'media-transcode'],
  },
  {
    id: 'data-processing',
    label: 'Data & ETL',
    icon: <Database size={22} />,
    typeMatch: ['data-processing'],
  },
  {
    id: 'email-notification',
    label: 'Email Batch',
    icon: <Mail size={22} />,
    typeMatch: ['email-notification'],
  },
];

export const CategorySection: React.FC<CategorySectionProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="categories-section">
      <div className="section-header-row">
        <h2 className="section-title">Categories</h2>
      </div>

      <div className="categories-grid">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`category-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectCategory(cat.id);
                }
              }}
            >
              <div className="cat-icon">{cat.icon}</div>
              <span className="cat-label">{cat.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
