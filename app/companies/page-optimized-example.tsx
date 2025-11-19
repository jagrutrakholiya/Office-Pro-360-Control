'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pagination, PageSizeSelector, PaginationInfo } from '../../components/PaginationComponents';
import { SkeletonTable, SkeletonWrapper } from '../../components/Skeleton';
import { ErrorBoundary, ComponentErrorBoundary } from '../../components/ErrorBoundary';
import { usePagination, useAsyncData, useDebounce } from '../../lib/performanceUtils';
import { useLRUCache, generateCacheKey } from '../../lib/cacheStrategies';
import api from '../../lib/api';

interface Company {
  _id: string;
  name: string;
  code: string;
  plan: string;
  status: string;
  createdAt: string;
  features?: Record<string, boolean>;
}

export default function CompaniesPageOptimized() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const cache = useLRUCache<Company[]>(50, 5 * 60 * 1000); // 50 items, 5 min TTL
  
  // Fetch companies with caching
  const cacheKey = generateCacheKey('companies', {
    search: debouncedSearch,
    status: statusFilter,
  });
  
  const {
    data: companies = [],
    loading,
    error,
    refetch,
  } = useAsyncData<Company[]>(
    async () => {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached) return cached;
      
      // Fetch from API
      const res = await api.get('/admin/companies', {
        params: {
          search: debouncedSearch,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      
      const data = res.data.companies || [];
      
      // Store in cache
      cache.set(cacheKey, data);
      
      return data as Company[];
    },
    {
      cacheKey,
      enabled: true,
    }
  );
  
  // Pagination
  const pagination = usePagination<Company>(companies as Company[], {
    initialPage: 1,
    pageSize,
  });
  
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    pagination.goToPage(1);
  };
  
  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Companies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all companies in the system
            </p>
          </div>
          
          <button
            onClick={() => window.location.href = '/companies/new'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Add Company
          </button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        
        {/* Companies Table with Loading Skeleton */}
        <ComponentErrorBoundary componentName="Companies Table">
          <SkeletonWrapper
            loading={loading}
            skeleton={<SkeletonTable rows={pageSize} columns={5} />}
          >
            {error ? (
              <div className="border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 rounded-lg p-6 text-center">
                <p className="text-red-600 dark:text-red-400 mb-4">
                  Failed to load companies: {error.message}
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                >
                  Retry
                </button>
              </div>
            ) : pagination.currentData.length === 0 ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No companies found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by creating your first company'}
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                      {pagination.currentData.map((company) => (
                        <tr key={company._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {company.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {company.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                              {company.plan}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                company.status === 'active'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                  : company.status === 'inactive'
                                  ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {company.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(company.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => router.push(`/companies/${company._id}`)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <PaginationInfo
                      currentPage={pagination.currentPage}
                      pageSize={pagination.pageSize}
                      totalItems={pagination.totalItems}
                    />
                    
                    <div className="flex items-center gap-4">
                      <PageSizeSelector
                        pageSize={pagination.pageSize}
                        onPageSizeChange={handlePageSizeChange}
                        options={[10, 25, 50, 100]}
                      />
                      
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={pagination.goToPage}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SkeletonWrapper>
        </ComponentErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
