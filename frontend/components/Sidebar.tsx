'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Home, Search, Plus, User, LogOut, 
    Code2, Box, ChevronDown 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // リンクがアクティブかどうか判定するヘルパー関数
    const isActive = (path: string) => pathname === path;

    // Create関連のパスかどうか
    const isCreateActive = pathname.startsWith('/create');

    return (
        <aside className='w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-40 hidden md:flex'>
            {/* ロゴエリア */}
            <div className='h-16 flex items-center px-6 border-b border-white/10 shrink-0'>
                <div className='flex items-center gap-2 font-bold text-xl tracking-tighter'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white'>
                        <Code2 size={20} />
                    </div>
                    <span>ScriptShot</span>
                </div>
            </div>

            {/* ナビゲーション */}
            <nav className='flex-1 py-6 px-3 flex flex-col gap-1 overflow-y-auto custom-scrollbar'>
                
                {/* Home */}
                <Link 
                    href="/" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive('/') ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <Home size={20} />
                    <span>Home</span>
                </Link>

                {/* Search */}
                <Link 
                    href="/search" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive('/search') ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <Search size={20} />
                    <span>Search</span>
                </Link>

                {/* Create (アコーディオンメニュー) */}
                <div className="group flex flex-col">
                    
                    {/* 親ボタン */}
                    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        isCreateActive ? 'bg-white/5 text-white font-bold' : 'text-gray-400 group-hover:bg-white/5 group-hover:text-white'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-1 rounded transition-colors ${isCreateActive ? 'bg-blue-600 text-white' : 'bg-white/10 group-hover:bg-white/20'}`}>
                                <Plus size={16} />
                            </div>
                            <span>Create</span>
                        </div>
                        <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180 opacity-50 group-hover:opacity-100" />
                    </button>

                    {/* アコーディオンの中身 */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                        <div className="overflow-hidden">
                            <div className="flex flex-col gap-1 pt-1 pb-2 pl-4">
                                
                                {/* Text Mode Link */}
                                <Link 
                                    href="/create" 
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ml-4 border-l-2 ${
                                        isActive('/create') 
                                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-bold' 
                                        : 'border-white/10 text-gray-500 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10' 
                                    }`}
                                >
                                    <Code2 size={16} className={isActive('/create') ? 'text-blue-500' : ''} />
                                    <span className="text-sm">Text Mode</span>
                                </Link>

                                {/* Block Mode Link */}
                                <Link 
                                    href="/create/block" 
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ml-4 border-l-2 ${
                                        isActive('/create/block') 
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' 
                                        : 'border-white/10 text-gray-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10' 
                                    }`}
                                >
                                    <Box size={16} className={isActive('/create/block') ? 'text-emerald-500' : ''} />
                                    <span className="text-sm">Block Mode</span>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <Link 
                    href="/profile" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive('/profile') ? 'bg-white/10 text-white font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                    <User size={20} />
                    <span>Profile</span>
                </Link>

            </nav>

            {/* 下部エリア（ユーザーアイコン + ログアウト） */}
            {user && (
                <div className='p-4 border-t border-white/10 mt-auto flex items-center gap-3'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                        alt={user.displayName || "User"}
                        className="w-10 h-10 rounded-full border border-white/10 object-cover shrink-0"
                    />

                    {/* ログアウトボタン */}
                    <button 
                        onClick={logout}
                        className='flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left text-gray-500 hover:bg-red-500/10 hover:text-red-500 transition-colors'
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                        <span className="text-sm font-bold">Sign Out</span>
                    </button>
                </div>
            )}
        </aside>
    );
};