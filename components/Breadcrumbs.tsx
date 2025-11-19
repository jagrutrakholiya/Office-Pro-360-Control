'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const paths = pathname.split('/').filter(Boolean);
      const items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' }
      ];

      let currentPath = '';
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        
        // Format label - capitalize and replace hyphens with spaces
        let label = path.charAt(0).toUpperCase() + path.slice(1);
        label = label.replace(/-/g, ' ');
        
        // Handle special cases for better readability
        const specialCases: { [key: string]: string } = {
          'api-keys': 'API Keys',
          'two-factor': '2FA',
          'seo': 'SEO',
          'ui': 'UI'
        };
        
        if (specialCases[path]) {
          label = specialCases[path];
        }

        items.push({
          label,
          href: currentPath
        });
      });

      setBreadcrumbs(items);
    };

    generateBreadcrumbs();
  }, [pathname]);

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center">
            {index > 0 && (
              <svg 
                className="w-4 h-4 mx-2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            )}
            
            {isLast ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
