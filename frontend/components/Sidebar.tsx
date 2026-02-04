'use client';

import React, { useState, useEffect } from 'react';
import { 
    Home, 
    Search, 
    PlusSquare, 
    User, 
    LogOut, 
    Code2,
    LogIn 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Search, label: 'Search', href: '/search' },
    { icon: PlusSquare, label: 'Create', href: '/create' },
    { icon: User, label: 'Profile', href: '/profile' },
];

export function Sidebar() {
    const [pathname, setPathname] = useState('/');
    const { user, login, logout } = useAuth(); 

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPathname(window.location.pathname);
        }
    }, [user]);

    const handleLogin = async () => {
        try {
            await login();
            // ログイン成功時にリロードして状態を確実に反映
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } catch (e) {
            console.error("Login error:", e);
        }
    };

    return (
        <aside className='hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-white/10 bg-black z-50'>
            {/* Logo */}
            <div className='p-6 mb-4'>
                <a href="/" className='flex items-center gap-2 group'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300'>
                        <Code2 className='w-5 h-5 text-white' />
                    </div>
                    <span className='text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
                        ScriptShot
                    </span>
                </a>
            </div>

            {/* Navigation */}
            <nav className='flex-1 px-4 space-y-2'>
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <a 
                            key={item.label} 
                            href={item.href}
                            className={`
                                flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group
                                ${isActive 
                                    ? 'bg-blue-600/10 text-blue-400 font-bold' 
                                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-white'
                                }
                            `}
                        >
                            <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''} group-hover:scale-110 transition-transform`} />
                            <span className="text-sm">{item.label}</span>
                        </a>
                    );
                })}
            </nav>

            {/* User Profile / Login Area */}
            <div className='p-4 mt-auto border-t border-white/10'>
                {user ? (
                    // ログイン済み
                    <div className='flex items-center gap-3 w-full p-3 rounded-xl hover:bg-[#1a1a1a] transition-colors text-left group cursor-default bg-[#1a1a1a]/50 border border-blue-500/20'>
                        {user.photoURL ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.photoURL} alt="User" className='w-10 h-10 rounded-full border border-white/10' />
                        ) : (
                            <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border border-white/10'></div>
                        )}
                        <div className='flex-1 min-w-0'>
                            <p className='text-sm font-bold text-white truncate'>{user.displayName || 'User'}</p>
                            <p className='text-xs text-green-400 truncate'>● Online</p>
                        </div>
                        <button 
                            onClick={() => {
                                logout();
                                setTimeout(() => window.location.reload(), 500); 
                            }} 
                            className='p-2 hover:bg-white/10 rounded-full transition-colors' 
                            title="Logout"
                        >
                            <LogOut className='w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors' />
                        </button>
                    </div>
                ) : (
                    // 未ログイン
                    <button 
                        onClick={handleLogin}
                        className='flex items-center justify-center gap-3 w-full p-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold shadow-lg active:scale-95'
                    >
                        <LogIn className='w-5 h-5' />
                        <span>Sign In</span>
                    </button>
                )}
            </div>
        </aside>
    );
}