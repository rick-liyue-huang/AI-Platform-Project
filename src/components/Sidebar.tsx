'use client';

import { cn } from '@/lib/utils';
import { Home, Plus, Settings } from 'lucide-react';
import React, { use } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const routes = [
    {
      icon: Home,
      href: '/',
      label: 'Home',
      isProtected: false,
    },
    {
      icon: Plus,
      href: '/platform/new',
      label: 'New',
      isProtected: true,
    },
    {
      icon: Settings,
      href: '/settings',
      label: 'Settings',
      isProtected: false,
    },
  ];
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string, pro: boolean) => {
    // TODO

    return router.push(href);
  };

  return (
    <div className="space-y-4 flex flex-col h-full text-primary bg-secondary">
      <div className="p-3 flex flex-1 justify-center">
        <div className="space-y-6">
          {routes.map((route, index) => (
            <div
              key={route.href}
              className={cn(
                'text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition',
                pathname === route.href && 'bg-primary/10 text-primary'
              )}
              onClick={() => handleNavigate(route.href, route.isProtected)}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1">
                <route.icon className="w-5 h-5" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
