'use client'

import React from 'react';
import { Home, Search, PlusSquare, Bell, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar = () => {
  const pathname = usePathname(); // 現在のURLを取得して、メニューを光らせる

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: PlusSquare, label: 'Create', href: '/create' },
    { icon: Bell, label: 'Notifications', href: '/notifications' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <aside className='fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 hidden md:flex z-50'>
        {/* ロゴ */}
        <div className='mb-10 pl-2'>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                ScriptShot
            </h1>
        </div>
    </aside>
  )
}