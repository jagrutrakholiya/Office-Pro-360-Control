"use client";

import { ReactNode } from "react";
import { FaInbox } from "react-icons/fa";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 mb-4 text-slate-400 dark:text-slate-500">
        {icon || <FaInbox className="w-6 h-6" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-sm mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
