'use client';

import { useEffect } from 'react';
import { useIsMobile, useViewportHeight } from '../lib/mobileUtils';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  showCloseButton?: boolean;
}

export default function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  fullScreen = false,
  showCloseButton = true
}: MobileModalProps) {
  const isMobile = useIsMobile();
  useViewportHeight();

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalClasses = isMobile
    ? fullScreen
      ? 'fixed inset-0 z-50 bg-white'
      : 'fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[90vh] animate-slide-up'
    : 'fixed inset-0 z-50 flex items-center justify-center p-4';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={modalClasses}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={`overflow-y-auto ${fullScreen ? 'h-[calc(100vh-60px)]' : 'max-h-[80vh]'} p-4`}>
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
