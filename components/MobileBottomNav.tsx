'use client';

import { useIsMobile } from 'lib/mobileUtils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
 label: string;
 icon: React.ReactNode;
 href: string;
 badge?: number;
}

export default function MobileBottomNav() {
 const pathname = usePathname();
 const isMobile = useIsMobile();

 const navItems: NavItem[] = [
 {
 label: 'Dashboard',
 href: '/',
 icon: (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
 </svg>
 )
 },
 {
 label: 'Companies',
 href: '/companies',
 icon: (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
 </svg>
 )
 },
 {
 label: 'Earnings',
 href: '/earnings',
 icon: (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 )
 },
 {
 label: 'Leads',
 href: '/leads',
 icon: (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 )
 },
 {
 label: 'More',
 href: '/settings',
 icon: (
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
 </svg>
 )
 }
 ];

 // Only show on mobile devices
 if (!isMobile) {
 return null;
 }

 const isActive = (href: string) => {
 if (href === '/') {
 return pathname === '/';
 }
 return pathname.startsWith(href);
 };

 return (
 <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
 <div className="grid grid-cols-5 h-16">
 {navItems.map((item) => {
 const active = isActive(item.href);

 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex flex-col items-center justify-center relative transition-colors ${
 active
 ? 'text-blue-600'
 : 'text-gray-600 hover:text-gray-900'
 }`}
 >
 <div className="relative">
 {item.icon}
 {item.badge && item.badge > 0 && (
 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
 {item.badge > 9 ? '9+' : item.badge}
 </span>
 )}
 </div>
 <span className={`text-xs mt-1 ${active ? 'font-semibold' : ''}`}>
 {item.label}
 </span>
 </Link>
 );
 })}
 </div>
 </nav>
 );
}
