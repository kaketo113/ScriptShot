'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    Home, Search, Plus, User, LogOut,
    Code2, Box, ChevronDown, Menu, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
    { href: '/', icon: Home, label: 'ホーム' },
    { href: '/search', icon: Search, label: '検索' },
    { href: '/profile', icon: User, label: 'プロフィール' },
];

const Logo = () => (
    <div className='h-16 flex items-center px-6 shrink-0'>
        <div className='flex items-center gap-2 font-bold text-xl tracking-tighter text-gray-900'>
            <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm'>
                <Code2 size={20} />
            </div>
            <span>ScriptShot</span>
        </div>
    </div>
);

const NavItem = ({ href, icon: Icon, label, isActive }: any) => (
    <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
            isActive 
            ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' 
            : 'text-gray-500 hover:bg-blue-50 hover:text-gray-900'
        }`}
    >
        <Icon size={20} />
        <span>{label}</span>
    </Link>
);

const CreateMenu = ({ isActive, currentPath }: { isActive: boolean, currentPath: string }) => (
    <div className="group flex flex-col">
        <button className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
            isActive ? 'bg-blue-50 text-blue-700 font-bold shadow-sm' : 'text-gray-500 group-hover:bg-blue-50 group-hover:text-gray-900'
        }`}>
            <div className="flex items-center gap-3">
                <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'bg-white-200 text-gray-500 group-hover:bg-gray-200'}`}>
                    <Plus size={16} />
                </div>
                <span>作成</span>
            </div>
            <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180 opacity-50 group-hover:opacity-100" />
        </button>

        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
            <div className="overflow-hidden">
                <div className="flex flex-col gap-1 pt-1 pb-2 pl-4">
                    <Link href="/create" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ml-2 ${currentPath === '/create' ? 'bg-blue-100 text-blue-700 font-bold shadow-sm' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-200'}`}>
                        <Code2 size={16} className={currentPath === '/create' ? 'text-blue-600' : ''} />
                        <span className="text-sm">コードモード</span>
                    </Link>
                    <Link href="/create/block" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ml-2 ${currentPath === '/create/block' ? 'bg-emerald-100 text-emerald-700 font-bold shadow-sm' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                        <Box size={16} className={currentPath === '/create/block' ? 'text-emerald-600' : ''} />
                        <span className="text-sm">ブロックモード</span>
                    </Link>
                </div>
            </div>
        </div>
    </div>
);

const UserArea = ({ user, login, logout }: any) => (
    <div className='p-4 pb-10 md:pb-4 mt-auto bg-[#e3f0fc] rounded-br-3xl shrink-0'>
        {user ? (
            <div className='flex items-center gap-3 p-2 rounded-2xl border border-gray-500 shadow-sm bg-white/50'>
                <img src={user.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} alt="" className="w-10 h-10 rounded-full border border-gray-200 object-cover shrink-0" />
                <button onClick={logout} className='flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-left text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors' title="サインアウト">
                    <LogOut size={18} />
                    <span className="text-sm font-bold">サインアウト</span>
                </button>
            </div>
        ) : (
            <button onClick={login} className='w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95'>
                <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6 bg-white rounded-full p-0.5" />
                <span className="font-bold">Googleで始める</span>
            </button>
        )}
    </div>
);

export const Sidebar = () => {
    const pathname = usePathname();
    const { user, login, logout } = useAuth();
    
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    return (
        <>
            {/* モバイル用ヘッダー */}
            <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#e3f0fc]/90 backdrop-blur-md z-40 flex items-center justify-between px-4 shadow-sm border-b border-blue-100">
                <div className='flex items-center gap-2 font-bold text-xl tracking-tighter text-gray-900'>
                    <div className='w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm'>
                        <Code2 size={20} />
                    </div>
                    <span>ScriptShot</span>
                </div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-gray-600 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* モバイル用背景オーバーレイ */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-gray-900/40 z-40 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                fixed left-0 top-0 z-50 h-[100dvh] w-64 bg-[#e3f0fc] flex flex-col shadow-2xl rounded-r-3xl transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:flex
            `}>
                {/* PC用のロゴ */}
                <div className="hidden md:block">
                    <Logo />
                </div>
                
                {/* スマホ用のメニュー閉じるボタン（右寄せ） */}
                <div className="md:hidden h-16 flex items-center justify-end px-4 border-b border-blue-100/50 shrink-0">
                    <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-white rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <nav className='flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar'>
                    {NAV_LINKS.slice(0, 2).map((link) => (
                        <NavItem key={link.href} {...link} isActive={pathname === link.href} />
                    ))}
                    <CreateMenu isActive={pathname.startsWith('/create')} currentPath={pathname} />
                    <NavItem {...NAV_LINKS[2]} isActive={pathname === '/profile'} />
                </nav>

                <UserArea user={user} login={login} logout={logout} />
            </aside>
        </>
    );
};