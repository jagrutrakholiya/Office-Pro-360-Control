"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, any> = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-800 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-300",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-300",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300",
  warning: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-300",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "text-green-600 dark:text-green-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...toast, id }]);
      const duration = toast.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const value: ToastContextValue = {
    show,
    success: (title, description) => show({ type: "success", title, description }),
    error: (title, description) => show({ type: "error", title, description }),
    info: (title, description) => show({ type: "info", title, description }),
    warning: (title, description) => show({ type: "warning", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto min-w-[300px] max-w-md rounded-lg border shadow-lg animate-slide-in-right ${COLORS[toast.type]}`}
            >
              <div className="flex items-start gap-3 p-4">
                <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{toast.title}</p>
                  {toast.description && <p className="text-xs mt-1 opacity-90">{toast.description}</p>}
                </div>
                <button
                  onClick={() => remove(toast.id)}
                  className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  aria-label="Close"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback — if called outside provider, use alerts
    return {
      show: (t) => alert(`${t.title}${t.description ? ": " + t.description : ""}`),
      success: (title, d) => alert(`✓ ${title}${d ? ": " + d : ""}`),
      error: (title, d) => alert(`✗ ${title}${d ? ": " + d : ""}`),
      info: (title, d) => alert(`ℹ ${title}${d ? ": " + d : ""}`),
      warning: (title, d) => alert(`⚠ ${title}${d ? ": " + d : ""}`),
    };
  }
  return ctx;
}
