"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiBarChart2, FiDollarSign, FiHome, FiLayers, FiStar, FiBriefcase, FiHelpCircle, FiPieChart, FiUsers, FiFileText, FiTrendingUp, FiImage } from 'react-icons/fi';
import { BsRobot, BsShieldCheck } from 'react-icons/bs';

interface NavItem {
  href: string;
  label: string;
  icon: JSX.Element;
  description?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    label: 'Analytics',
    items: [
      { href: '/', label: 'Dashboard', icon: <FiHome /> },
      { href: '/earnings', label: 'Earnings', icon: <FiDollarSign /> },
      { href: '/kpis', label: 'KPIs', icon: <FiBarChart2 /> }
    ]
  },
  {
    label: 'Content',
    items: [
      { href: '/companies', label: 'Companies', icon: <FiBriefcase /> },
      { href: '/plans', label: 'Plans', icon: <FiLayers /> },
      { href: '/screenshots', label: 'Screenshots', icon: <FiImage /> },
      { href: '/blog', label: 'Blog', icon: <FiFileText /> },
      { href: '/marketing', label: 'Marketing', icon: <FiTrendingUp /> },
      { href: '/marketing-stats', label: 'Marketing Stats', icon: <FiPieChart /> },
      { href: '/reviews', label: 'Reviews', icon: <FiStar /> }
    ]
  },
  {
    label: 'Bot Management',
    items: [
      { href: '/bot-approvals', label: 'Bot Approvals', icon: <BsRobot /> },
      { href: '/bot-audit-logs', label: 'Audit Logs', icon: <BsShieldCheck /> }
    ]
  },
  {
    label: 'Support',
    items: [
      { href: '/inquiries', label: 'Inquiries', icon: <FiHelpCircle /> },
      { href: '/queries', label: 'User Queries', icon: <FiUsers /> }
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`hidden lg:flex ${collapsed ? 'w-20' : 'w-72'} h-screen sticky top-0 transition-all duration-300 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white flex-col border-r border-slate-800/50`}>      
      {/* Brand / Collapse */}
      <div className="flex items-center justify-between px-5 py-6 border-b border-slate-800/60">
        {!collapsed && (
          <div>
            <div className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">OfficePro360</div>
            <div className="text-[10px] uppercase text-slate-500 mt-1">Control Panel</div>
          </div>
        )}
        <button onClick={()=> setCollapsed(c=> !c)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors" aria-label="Toggle sidebar">
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar min-h-0">
        {groups.map(group => (
          <div key={group.label}>
            {!collapsed && <div className="px-2 mb-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">{group.label}</div>}
            <div className="flex flex-col gap-1">
              {group.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                    <span className={`text-lg flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{item.icon}</span>
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="px-4 py-4 border-t border-slate-800/60">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-sm">
              {(user?.name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
        )}
        <button onClick={logout} className="w-full text-sm font-medium px-3 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 transition-all shadow-md shadow-red-700/20">🚪 {collapsed ? '' : 'Sign Out'}</button>
      </div>
    </aside>
  );
}
