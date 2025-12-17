'use client'

import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Share2, MapPin, Link as LinkIcon, Calendar, Heart, Star, Clock } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

// スキルマップのデータの型
interface SkillData {
  subject: string;
  A: number;
  fullMark: number;
}

// 最近の投稿データの型
interface RecentPost {
  id: number;
  title: string;
  lang: string;
  image: string;
}

// お気に入り投稿データの型
interface FavoritePost {
  id: number;
  title: string;
  user: string;
  image: string;
}


// ダミー

const SKILL_DATA: SkillData[] = [
  { subject: 'Next.js', A: 120, fullMark: 150 },
  { subject: 'React', A: 98, fullMark: 150 },
  { subject: 'TypeScript', A: 86, fullMark: 150 },
  { subject: 'Python', A: 99, fullMark: 150 },
  { subject: 'Flask', A: 85, fullMark: 150 },
  { subject: 'CSS/Tailwind', A: 65, fullMark: 150 },
];

// ★追加: 最近の投稿データ
const RECENT_POSTS: RecentPost[] = [
  { id: 1, title: 'AIチャットボットUI', lang: 'React', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, title: 'データ分析グラフ', lang: 'Python', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, title: '3Dアニメーション', lang: 'Three.js', image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop' },
];

// ★追加: お気に入りデータ
const FAVORITE_POSTS: FavoritePost[] = [
  { id: 4, title: '神CSSテクニック集', user: 'tanaka_dev', image: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, title: 'Rust入門コード', user: 'suzuki_rust', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000&auto=format&fit=crop' },
];

export default function ProfilePage() {
    const [activeHighlightTab, setActiveHighlightTab] = useState<'recent' | 'favorite'>('recent');

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />

            <main className="flex-1 md:ml-64 min-h-screen">

                {/* 背景 */}
                <div className="h-48 bg-gradient-to-r from-blue-900/40 to-purple-900/40 w-full relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns.png')] opacity-20"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 pb-20 -mt-20 relative z-10">


                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                        {/* アイコン */}
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden relative shadow-2xl"
                        >
                            <img src="https://zukan.pokemon.co.jp/zukan-api/up/images/index/48cd90ca9aef38ad6384fc5e148696ef.png" alt="user" className="w-full h-full object-cover" />
                        </motion.div>

                        {/* 名前 */}
                        <div className="flex-1 mb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">User_tama</h1>
                                    <p className="text-gray-400">@tama_dev</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 border border-white/20 rounded-lg font-medium hover:bg-white/10 transition-colors text-sm">
                                        編集
                                    </button>
                                    <button className="p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* caption,Skill,Highlights */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        
                        {/* caption & stats */}
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    HAL名古屋IT学科1年生<br />
                                    よろしくお願いします。
                                </p>
                                <div className="flex flex-col gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />Mie, Japan</span>
                                    <span className="flex items-center gap-2"><LinkIcon className="w-4 h-4" />githun.com/kaketo</span>
                                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4" />Joind January 2025</span>
                                </div>
                            </div>

                            <div className="flex justify-between p-4 bg-[#111] rounded-xl border border-white/5">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">15</div>
                                    <div className="text-xs text-gray-500">Posts</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">50</div>
                                    <div className="text-xs text-gray-500">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">50</div>
                                    <div className="text-xs text-gray-500">Following</div>
                                </div>
                            </div>
                        </div>

                        {/* スキルマップ */}
                        <div className="bg[#111] border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden h-[320px]">
                            <h3 className="absolute top-4 left-4 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Star className="w-3 h-3" /> Skill Map
                            </h3>
                            <div className="w-full h-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_DATA}>
                                        <PolarGrid stroke="#333" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                        <Radar
                                            name='My Skills'
                                            dataKey="A"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fill="#3b82f6"
                                            fillOpacity={0.3}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ハイライト */}
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-4 h-[320px] flex flex-col">
                            <div className="flex gap-4 mb-4 border-b border-white/5 pb-2">
                                <button
                                    onClick={() => setActiveHighlightTab('recent')}
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeHighlightTab === 'recent' ? 'text-blue-400' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    <Clock className="w-3 h-3" />Recent
                                </button>
                                <button
                                    onClick={() => setActiveHighlightTab('favorite')}
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${activeHighlightTab === 'favorite' ? 'text-pink-400' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    <Heart className="w-3 h-3" />Favorites
                                </button>
                            </div>

                            {/* リスト表示エリア */}
                            <div>
                                <AnimatePresence mode="wait">
                                    {activeHighlightTab === 'recent' ? (
                                        <motion.div
                                            key="recent"
                                            initial={{ opacity:0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-3"
                                        >
                                            {RECENT_POSTS.map(post => (
                                                <div key={post.id} className="flex gap-3 items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 border border-white/10">
                                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-blue-400 transition-colors">{post.title}</h4>
                                                        <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{post.lang}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="favorite"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.2 }}
                                            className="space-y-3"
                                        >
                                            {FAVORITE_POSTS.map(post => (
                                                <div key={post.id} className="flex gap-3 items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 border border-pink-500/20">
                                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-pink-400 transition-colors">{post.title}</h4>
                                                        <p className="text-xs text-gray-500">by {post.user}</p>
                                                    </div>
                                                     <Heart className="w-4 h-4 text-pink-500 fill-current" />
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>


                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                All Posts
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((item) => (
                                    <motion.div 
                                        key={item}
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                            className="aspect-video bg-[#161616] rounded-xl border border-white/5 overflow-hidden relative group cursor-pointer"
                                        >
                                            <img 
                                                src={`https://picsum.photos/seed/${item}/500/300`} 
                                                alt="Post" 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70 group-hover:opacity-100" 
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                                <span>❤️ 42</span>
                                                <span>💬 5</span>
                                            </div>
                                    </motion.div>
                                ))}
                            </div>
                    </div>

                </div>
            </main>
        </div>
    );
}