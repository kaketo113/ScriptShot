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
    image: 'https://group.kadokawa.co.jp/media/002/202502/mode3_w700-2025021301_img01.jpg?v=20250213083137',
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
    content: 'ダミーデータ #Python #DataScience',
    tags: ['Python', 'Pandas', 'Matplotlib'],
    image: 'https://keepgamingon.com/wp-content/uploads/2021/07/elden-ring.jpg',
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

// 投稿カード
const PostCard = ({ post, index }: { post: any, index: number }) => {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className='bg-[#161616] border border-white/5 rounded-2xl overflow-hidden mb-8 shadow-lg hover:border-white/10 transition-colors'
    >
      {/* ヘッダー */}
      <div className='p-4 flex items-center justify-between'>
        <div className='flex items-center justify-between'>
          <img src={post.user.avatar} alt={post.user.name} className='w-10 h-10 rounded-full bg-gray-800' />
            <div>
              <h3 className='font-bold text-sm text-white'>{post.user.name}</h3>
              <p className='text-xs text-gray-500'>{post.time}</p>
            </div>
          </div>
          <button className='text-gray-500 hover:text-white'>
            <MoreHorizontal className='w-5 h-5' />
          </button>
        </div>

        {/* メイン */}
        <div className='relative w-full aspect-video bg-black group cursor-pointer overflow-hidden'>
          {/* 画像 */}
          <img
            src={post.image}
            alt='Code Reslt'
            className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
          />

          {/* オーバーレイ */}
          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
            <div className='bg-black/80 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 text-white font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform'>
              <Code2 className='w-4 h-4' />
              <span>View Code</span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className='p-4 space-y-3'>
          {/* アクションボタン */}
          <div className='flex items-center gap-4'>
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              <span className='text-sm font-medium'>{post.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button className='flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors'>
              <MessageCircle className='w-6 h-6' />
              <span className='text-sm font-medium'>{post.comments}</span>
            </button>
            <button className='flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors ml-auto'>
              <Share2 className='w-5 h-5' />
            </button>
          </div>

          {/* キャプション＆タグ */}
          <div>
            <p className='text-sm text-gray-300 leading-relaxed'>
              <span className='font-bold text-white mr-2'>{post.user.name}</span>
              {post.content}
            </p>
            <div className='flex gap-2 mt-2'>
              {post.tags.map((tag: string) => (
                <span key={tag} className='text-xs text-blue-400 hover:text-blue-300 cursor-pointer'>#{tag}</span>
              ))}
            </div>
          </div>

          {/* コードスニペット */}
          <div className='bg-[#0a0a0a] rounded-lg p-3 border border-white/5 font-mono text-xs text-gray-400 overflow-hidden relative'>
            <pre>{post.codeSnippet}</pre>
            <div className='absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]/90 pointer-events-none' />
          </div>
        </div>
    </motion.article>
  );
};

// タイムライン
export default function HomePage() {
  return (
    <div className='min-h-screen bg-black text-white flex'>

      {/* 1. 左サイドバー (Navigation) */}
      <Sidebar />

      <main className='flex-1 md:ml-64 min-h-screen relative'>
        {/* 背景 */}
        <div className='fixed top-0 left-0 w-full h-[500px] bg-blue-900/10 blur-[120px] pointer-events-none' />

        <div className='max-w-2xl mx-auto pt-10 pb-20 px-4 relative z-10'>

          {/* ヘッダー */}
          <div className='flex items-center justify-between mb-8 md:hidden'>
            <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>ScriptShot</h1>
            <Bell className='w-6 h-6 text-gray-400' />
          </div>

          {/* タイムラインフィード */}
          <div className='space-y-6'>
            {MOCK_POSTS.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>

          {/* 読み込み完了メッセージ */}
          <div className='text-center py-8 text-gray-600 text-sm'>
            <p>You're all caught up!</p>
          </div>

        </div>
      </main>
    
    </div>
  );
}