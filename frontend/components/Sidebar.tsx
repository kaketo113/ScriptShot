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
    const { user, login, logout } = useAuth();

    const isActive = (path: string) => pathname === path;
    const isCreateActive = pathname.startsWith('/create');

    return (
        // ★修正: 境界線を削除し、角丸と深い影を追加して浮遊感を出す
        <aside className='w-64 bg-white flex flex-col h-screen fixed left-0 top-0 z-50 hidden md:flex shadow-2xl rounded-r-3xl'>
            
            {/* ロゴエリア */}
            <div className='h-16 flex items-center px-6 shrink-0'>
                <div className='flex items-center gap-2 font-bold text-xl tracking-tighter text-gray-900'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm'>
                        <Code2 size={20} />
                    </div>
                    <span>ScriptShot</span>
                </div>
            </div>

            {/* ナビゲーション */}
            <nav className='flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar'>
                
                {/* Home */}
                <Link 
                    href="/" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive('/') 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <Home size={20} />
                    <span>ホーム</span>
                </Link>

                {/* Search */}
                <Link 
                    href="/search" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive('/search') 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <Search size={20} />
                    <span>検索</span>
                </Link>

                {/* Create (アコーディオン) */}
                <div className="group flex flex-col">
                    
                    {/* 親ボタン */}
                    <button className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                        isCreateActive 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-900'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-1 rounded-lg transition-colors ${isCreateActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500 group-hover:bg-gray-300'}`}>
                                <Plus size={16} />
                            </div>
                            <span>作成</span>
                        </div>
                        <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180 opacity-50 group-hover:opacity-100" />
                    </button>

                    {/* アコーディオンの中身 */}
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
                        <div className="overflow-hidden">
                            <div className="flex flex-col gap-1 pt-1 pb-2 pl-4">
                                
                                {/* コードモード */}
                                <Link 
                                    href="/create" 
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ml-2 ${
                                        isActive('/create') 
                                        ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' 
                                        : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50' 
                                    }`}
                                >
                                    <Code2 size={16} className={isActive('/create') ? 'text-blue-600' : ''} />
                                    <span className="text-sm">コードモード</span>
                                </Link>

                                {/* ブロックモード */}
                                <Link 
                                    href="/create/block" 
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ml-2 ${
                                        isActive('/create/block') 
                                        ? 'bg-emerald-100 text-emerald-700 font-bold shadow-sm' 
                                        : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50' 
                                    }`}
                                >
                                    <Box size={16} className={isActive('/create/block') ? 'text-emerald-600' : ''} />
                                    <span className="text-sm">ブロックモード</span>
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <Link 
                    href="/profile" 
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive('/profile') 
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                    <User size={20} />
                    <span>プロフィール</span>
                </Link>

            </nav>

            {/* 下部エリア */}
            <div className='p-4 mt-auto bg-white rounded-br-3xl'>
                {user ? (
                    <div className='flex items-center gap-3 p-2 rounded-2xl border border-gray-100 shadow-sm'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                            alt={user.displayName || "User"}
                            className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0"
                        />

                        <button 
                            onClick={logout}
                            className='flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors'
                            title="サインアウト"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-bold">サインアウト</span>
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={login}
                        className='w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95'
                    >
                        <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" />
                        <span className="font-bold">Googleで始める</span>
                    </button>
                )}
            </div>
        </aside>
    );
};