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

  return (
    <div className="min-h-screen bg-black text-white flex">
        <Sidebar />

        <main className='flex-1 md:ml-64 min-h-screen'>
            <div className='max-w-4xl mx-auto p-6'>

                {/* 検索バー */}
            </div>
        </main>
    </div>    
}