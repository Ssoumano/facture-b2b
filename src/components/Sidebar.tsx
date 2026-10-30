'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus, Settings, ReceiptText } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new-invoice', label: 'Nouvelle facture', icon: FilePlus },
  { href: '/settings', label: 'Paramètres', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-zinc-200 h-screen flex flex-col bg-zinc-50/50">
      <div className="p-6 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center text-white">
          <ReceiptText size={20} />
        </div>
        <span className="font-semibold text-lg tracking-tight text-zinc-900">FactureB2B</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-zinc-900 text-white" 
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-zinc-900">Jean Dev</span>
            <span className="text-xs text-zinc-500">Freelance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
