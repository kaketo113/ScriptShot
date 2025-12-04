'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Search, PlusSquare, Bell, User, LogOut, 
  Heart, MessageCircle, Share2, MoreHorizontal, Code2 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Data
const MOCK_POSTS = [
  {
    id: 1,
    user: {
      name: 'mizoguchi kaketo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanto', 
    },
    content: 'ダミーデータ',
    tags: ['Nextjs', 'TailwindCSS', 'FramerMotion'],
    image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop',
    likes: 120,
    comments: 15,
    time: '2h ago',
    codeSnippet: `motion.div 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }}`
  },
  {
    id: 2,
    user: {
      name: 'tanaka_dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    content: 'PythonのPandasでデータ分析。グラフ描画の結果です。 #Python #DataScience',
    tags: ['Python', 'Pandas', 'Matplotlib'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    likes: 85,
    comments: 4,
    time: '5h ago',
    codeSnippet: `import pandas as pd
df = pd.read_csv('data.csv')
df.plot()`
  },
];

// 左側のナビゲーション

const Sidebar = () => (
  <aside className='fixed left-0 top-0 h-screen w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 hidden md:flex z-50'>
    {/* ロゴ */}
    <div className='mb-10 pl-2'>
      <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
        ScriptShot
      </h1>
    </div>

    {/* メニュー */}
    <nav className='flex-1 space-y-2'>
      {[
        { icon: Home, label: 'Home', active: true },
        { icon: Search, label: 'Search', active: false },
        { icon: PlusSquare, label: 'Create', active: false },
        { icon: Bell, label: 'Notifications', active: false },
        { icon: User, label: 'Profile', active: false },
      ].map((item) => (
        <Link
          key={item.label}
          href='#'
          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
            item.active 
              ? 'bg-blue-600/10 text-blue-400 font-medium' 
              : 'text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <item.icon className={`w-6 h-6 ${item.active ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`} />
          <span className='text-base'>{item.label}</span>
        </Link>
      ))}
    </nav>

    {/* フッター */}
    <button className='flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-400 transition-colors mt-auto'>
      <LogOut className='w-5 h-5' />
      <span className='text-sm'>Log Out</span>
    </button>
  </aside>
);