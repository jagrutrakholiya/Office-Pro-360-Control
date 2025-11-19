'use client'
import React from 'react';

// ============================================
// BASE SKELETON
// ============================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };
  
  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
      style={{
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'text' ? '1em' : undefined),
      }}
    />
  );
}

// ============================================
// SKELETON TEXT
// ============================================

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string | number;
  className?: string;
}

export function SkeletonText({ lines = 3, lastLineWidth = '80%', className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height="1rem"
        />
      ))}
    </div>
  );
}

// ============================================
// SKELETON CARD
// ============================================

interface SkeletonCardProps {
  hasImage?: boolean;
  imageHeight?: string | number;
  hasActions?: boolean;
  className?: string;
}

export function SkeletonCard({
  hasImage = true,
  imageHeight = 200,
  hasActions = true,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {hasImage && <Skeleton variant="rectangular" height={imageHeight} />}
      
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height="1.5rem" width="70%" />
        <SkeletonText lines={2} lastLineWidth="90%" />
        
        {hasActions && (
          <div className="flex gap-2 pt-2">
            <Skeleton variant="rounded" width={100} height={36} />
            <Skeleton variant="rounded" width={100} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SKELETON TABLE
// ============================================

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
}: SkeletonTableProps) {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {showHeader && (
        <div className="grid gap-4 p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height="1rem" width="60%" />
          ))}
        </div>
      )}
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} variant="text" height="1rem" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  hasActions?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  hasAvatar = true,
  hasActions = true,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          {hasAvatar && <Skeleton variant="circular" width={48} height={48} />}
          
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" height="1rem" width="40%" />
            <Skeleton variant="text" height="0.875rem" width="60%" />
          </div>
          
          {hasActions && (
            <div className="flex gap-2">
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// SKELETON GRID
// ============================================

interface SkeletonGridProps {
  items?: number;
  columns?: number;
  hasImage?: boolean;
  imageHeight?: string | number;
  className?: string;
}

export function SkeletonGrid({
  items = 6,
  columns = 3,
  hasImage = true,
  imageHeight = 200,
  className = '',
}: SkeletonGridProps) {
  return (
    <div className={`grid gap-4 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} hasImage={hasImage} imageHeight={imageHeight} />
      ))}
    </div>
  );
}

// ============================================
// SKELETON PROFILE
// ============================================

interface SkeletonProfileProps {
  className?: string;
}

export function SkeletonProfile({ className = '' }: SkeletonProfileProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={100} height={100} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height="1.5rem" width="40%" />
          <Skeleton variant="text" height="1rem" width="30%" />
          <Skeleton variant="text" height="1rem" width="50%" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton variant="text" height="1.25rem" width="30%" />
        <SkeletonText lines={4} />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <Skeleton variant="text" height="2rem" width="50%" />
            <Skeleton variant="text" height="0.875rem" width="70%" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// SKELETON FORM
// ============================================

interface SkeletonFormProps {
  fields?: number;
  hasSubmit?: boolean;
  className?: string;
}

export function SkeletonForm({ fields = 5, hasSubmit = true, className = '' }: SkeletonFormProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" height="0.875rem" width="30%" />
          <Skeleton variant="rounded" height={40} />
        </div>
      ))}
      
      {hasSubmit && (
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" width={120} height={40} />
          <Skeleton variant="rounded" width={100} height={40} />
        </div>
      )}
    </div>
  );
}

// ============================================
// SKELETON DASHBOARD
// ============================================

interface SkeletonDashboardProps {
  className?: string;
}

export function SkeletonDashboard({ className = '' }: SkeletonDashboardProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-2">
            <Skeleton variant="text" height="0.875rem" width="60%" />
            <Skeleton variant="text" height="2rem" width="40%" />
            <Skeleton variant="text" height="0.75rem" width="50%" />
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton variant="text" height="1.5rem" width="40%" />
          <Skeleton variant="rectangular" height={300} />
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
          <Skeleton variant="text" height="1.5rem" width="40%" />
          <Skeleton variant="rectangular" height={300} />
        </div>
      </div>
      
      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <Skeleton variant="text" height="1.5rem" width="30%" />
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

// ============================================
// SKELETON PAGE
// ============================================

interface SkeletonPageProps {
  hasHeader?: boolean;
  hasFilter?: boolean;
  contentType?: 'list' | 'grid' | 'table' | 'dashboard';
  className?: string;
}

export function SkeletonPage({
  hasHeader = true,
  hasFilter = true,
  contentType = 'list',
  className = '',
}: SkeletonPageProps) {
  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {hasHeader && (
        <div className="space-y-2">
          <Skeleton variant="text" height="2rem" width="40%" />
          <Skeleton variant="text" height="1rem" width="60%" />
        </div>
      )}
      
      {hasFilter && (
        <div className="flex gap-3">
          <Skeleton variant="rounded" width={200} height={40} />
          <Skeleton variant="rounded" width={150} height={40} />
          <Skeleton variant="rounded" width={120} height={40} />
        </div>
      )}
      
      {contentType === 'list' && <SkeletonList items={5} />}
      {contentType === 'grid' && <SkeletonGrid items={6} columns={3} />}
      {contentType === 'table' && <SkeletonTable rows={8} columns={5} />}
      {contentType === 'dashboard' && <SkeletonDashboard />}
    </div>
  );
}

// ============================================
// CONDITIONAL SKELETON WRAPPER
// ============================================

interface SkeletonWrapperProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SkeletonWrapper({ loading, skeleton, children, className = '' }: SkeletonWrapperProps) {
  return <div className={className}>{loading ? skeleton : children}</div>;
}
