'use client';

import { useState } from 'react';
import { useSwipeGesture } from '../lib/mobileUtils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  disabled?: boolean;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  disabled = false
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || !isDragging) return;
    
    const touch = e.touches[0];
    const target = touch.target as HTMLElement;
    const startX = touch.clientX;
    
    // Calculate offset (limit to -100 to 100)
    const offset = Math.max(-100, Math.min(100, startX - target.getBoundingClientRect().left));
    setSwipeOffset(offset);
  };

  const handleTouchEnd = () => {
    if (disabled) return;
    
    setIsDragging(false);
    
    // Trigger actions based on swipe threshold
    if (swipeOffset < -50 && onSwipeLeft) {
      onSwipeLeft();
    } else if (swipeOffset > 50 && onSwipeRight) {
      onSwipeRight();
    }
    
    // Reset offset
    setSwipeOffset(0);
  };

  const swipeGestures = useSwipeGesture(onSwipeLeft, onSwipeRight);

  return (
    <div className="relative overflow-hidden">
      {/* Left Action Background */}
      {leftAction && (
        <div
          className={`absolute left-0 top-0 bottom-0 flex items-center justify-start px-4 transition-all ${leftAction.color}`}
          style={{
            width: Math.abs(Math.min(swipeOffset, 0)),
            opacity: Math.abs(Math.min(swipeOffset, 0)) / 100
          }}
        >
          <div className="flex items-center gap-2 text-white">
            {leftAction.icon}
            <span className="font-medium">{leftAction.label}</span>
          </div>
        </div>
      )}

      {/* Right Action Background */}
      {rightAction && (
        <div
          className={`absolute right-0 top-0 bottom-0 flex items-center justify-end px-4 transition-all ${rightAction.color}`}
          style={{
            width: Math.max(swipeOffset, 0),
            opacity: Math.max(swipeOffset, 0) / 100
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="font-medium">{rightAction.label}</span>
            {rightAction.icon}
          </div>
        </div>
      )}

      {/* Card Content */}
      <div
        className="relative bg-white transition-transform"
        style={{
          transform: `translateX(${swipeOffset}px)`
        }}
        {...swipeGestures}
      >
        {children}
      </div>
    </div>
  );
}

// Example usage component
export function SwipeableTaskCard({ task, onDelete, onArchive }: any) {
  return (
    <SwipeableCard
      onSwipeLeft={onDelete}
      onSwipeRight={onArchive}
      leftAction={{
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        label: 'Delete',
        color: 'bg-red-500'
      }}
      rightAction={{
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        ),
        label: 'Archive',
        color: 'bg-blue-500'
      }}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
      </div>
    </SwipeableCard>
  );
}
