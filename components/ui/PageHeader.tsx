"use client";

import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function PageHeader({ title, description, actions, breadcrumbs }: Props) {
  return (
    <div className="mb-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-sm mb-3" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
              {crumb.href ? (
                <a href={crumb.href} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                  {crumb.label}
                </a>
              ) : (
                <span className="text-slate-700 dark:text-slate-300">{crumb.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">{title}</h1>
          {description && (
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
