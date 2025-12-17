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
    { icon: User, label: 'Profile', href: '/plofile' },
  ];

  return (
    <aside className='fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 hidden md:flex z-50'>
        {/* ロゴ */}
        <div className='mb-10 pl-2'>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                ScriptShot
            </h1>
        </div>

        {/* メニュー */}
        <nav className='flex-1 space-y-2'>
            {menuItems.map((item) => {
                const isActive= pathname === item.href;

                return (
                    <Link 
                        key={item.label} 
                        href={item.href} 
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                            isActive 
                                ? 'bg-blue-600/10 text-blue-400 font-medium' 
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <item.icon className={`w-6 h-6 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
                        <span className='text-base'>{item.label}</span>
                    </Link>
                );
            })}
        </nav>

        {/* フッター */}
        <button className='flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors mt-auto w-full text-left'>
            <LogOut className='w-5 h-5' />
            <span className='text-sm'>Log out</span>
        </button>
    </aside>
  );
};