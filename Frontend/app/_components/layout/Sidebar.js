'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Badge from '../ui/Badge';

export default function Sidebar({ categories = [], className = '' }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Models', href: '/models', icon: '🤖' },
    { name: 'Categories', href: '/categories', icon: '📁' },
    { name: 'Discussions', href: '/discussions', icon: '💬' },
    { name: 'Compare', href: '/models/compare', icon: '⚖️' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className={`font-semibold text-gray-900 ${collapsed ? 'hidden' : ''}`}>
          Navigation
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <nav className="mt-4">
        <div className="px-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-md
                ${isActive(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>

        {!collapsed && categories.length > 0 && (
          <div className="mt-8">
            <div className="px-3 mb-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </h3>
            </div>
            <div className="px-2 space-y-1">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`
                    group flex items-center justify-between px-3 py-2 text-sm rounded-md
                    ${pathname.includes(`/categories/${category.slug}`)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <span className="truncate">{category.name}</span>
                  {category.model_count > 0 && (
                    <Badge variant="secondary" size="sm">
                      {category.model_count}
                    </Badge>
                  )}
                </Link>
              ))}
              {categories.length > 8 && (
                <Link
                  href="/categories"
                  className="group flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <span>View all categories →</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
