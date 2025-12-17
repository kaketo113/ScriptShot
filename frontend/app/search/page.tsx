'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Search, Hash, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ダミーデータ
const TRENDING_TAGS = [
  { name: 'Python', count: '12.5k' },
  { name: 'React', count: '8.2k' },
  { name: 'Three.js', count: '5.1k' },
  { name: 'DataScience', count: '3.4k' },
  { name: 'GameDev', count: '2.9k' },
];

const SUGGESTED_USERS = [
  { id: 1, name: 'tanaka_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', bio: 'Python & AI Engineer' },
  { id: 2, name: 'suzuki_ui', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', bio: 'Frontend Lover ❤️' },
  { id: 3, name: 'sato_algo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sato', bio: 'Competitive Programmer' },
];

const POPULAR_POSTS = Array.from({ length: 9 }).map((_, i) => ({
  id: i,
  image: `https://picsum.photos/seed/search_${i}/400/400`, // ダミー画像
  likes: Math.floor(Math.random() * 500),
}));

// コンポーネント
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'top' | 'accounts' | 'tags'>('top');

  const clearSearch = () => setQuery('');

  return (
    <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <main className='flex-1 md:ml-64 min-h-screen'>
            <div className='max-w-4xl mx-auto p-6'>

                {/* 検索バー */}
                <div className='sticky top-0 bg-black/80 backdrop-blur-md z-20 py-4 -mx-6 px-6 border-b border-white/5'>
                  <div className='relative group'>
                    <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors' />
                    <input
                      type='text'
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder='Search Code, tags, or people'
                      className='w-full bg-[#161616] border border-white/10 rounded-full py-3.5 pl-12 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all'
                    />
                    {query && (
                      <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                </div>
              </div>

              {/* コンテンツメニュー */}
              <div className='mt-6'>

                {/* 検索ワードがないとき */}
                {!query ? (
                  <div className='space-y-10'>

                    {/* トレンドタグ */}
                    <section>
                      <h3 className='flex flex-wrap gap-3'>
                        <Hash className='w-5 h-5 textblue-400' />Trending Tags
                      </h3>
                      <div className='flex flex-wrap gap-3'>
                        {TRENDING_TAGS.map((tag) => (
                          <Link
                            key={tag.name}
                            href={`/search?q=${tag.name}`} className='bg-[#161616] border border-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors group'>
                              <span className='font-bold text-gray-200 group-hover:text-blue-400'>#{tag.name}</span>
                              <span className='ml-2 text-xs text-gray-500'>{tag.count} posts</span>
                            </Link>
                        ))}
                      </div>
                    </section>

                  {/* おすすめユーザー */}
                  <section>
                    <h3 className='text-lg font-bold mb-4 flex items-center gap-2'>
                      <User className='w-5 h-5 text-blue-400' />Suggested for you
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {SUGGESTED_USERS.map((user) => (
                        <div key={user.id} className='bg-[#161616] border border-white/5 p-4 rounded-xl flex items-center gap-3 hover:border-white/20 transition-colors cursor-pointer'>
                          <img src={user.avatar} className='w-12 h-12 rounded-full bg-gray-700' />
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-bold text-gray-500 truncate'>{user.name}</h4>
                            <p className='text-xs text-gray-500 truncate'>{user.bio}</p>
                          </div>
                          <button className='px-3 py-1.5 bg-blue-600/10 text-blue-400 text-xs font-bold rounded-md hover:bg-blue-600 hover:text-white transition-colors'>
                            Follow
                          </button> 
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  </div>
                )}
              </div>
        </main>
    </div> 
  );   
}