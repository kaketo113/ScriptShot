'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { AuroraBackground } from '../../components/AuroraBackground';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { 
    MapPin, Link as LinkIcon, Calendar, Edit3, Share2, Settings, 
    Layers, Code2, Image as ImageIcon, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Components ---

// スキルマップ（レーダーチャート）の静的コンポーネント
const SkillRadarChart = () => {
    return (
        <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
            {/* 背景の六角形グリッド */}
            <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 stroke-gray-500 fill-none stroke-[0.5]">
                {[20, 40, 60, 80, 100].map((r, i) => (
                    <polygon key={i} points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" transform={`scale(${r/100})`} style={{ transformOrigin: 'center' }} />
                ))}
                <line x1="50" y1="0" x2="50" y2="100" />
                <line x1="93.3" y1="25" x2="6.7" y2="75" />
                <line x1="93.3" y1="75" x2="6.7" y2="25" />
            </svg>
            
            {/* データ（青いエリア） - 適当な値で固定 */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <polygon 
                    points="50,10 85,35 80,70 50,90 20,70 15,35" 
                    className="fill-blue-500/20 stroke-blue-500 stroke-2"
                />
            </svg>

            {/* ラベル */}
            <div className="absolute inset-0 text-[8px] text-gray-400 font-mono">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">Next.js</span>
                <span className="absolute top-[25%] right-0 translate-x-2">React</span>
                <span className="absolute bottom-[25%] right-0 translate-x-4">TypeScript</span>
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2">Python</span>
                <span className="absolute bottom-[25%] left-0 -translate-x-2">Flask</span>
                <span className="absolute top-[25%] left-0 -translate-x-4">CSS</span>
            </div>
        </div>
    );
};

// --- Types ---
interface PostData {
    id: string;
    caption?: string;
    code?: string;
    thumbnail?: string;
    type: string;
    createdAt: any;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    // 自分の投稿を取得
    useEffect(() => {
        const fetchMyPosts = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "posts"),
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                const fetchedPosts: PostData[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() } as PostData);
                });
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching profile posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPosts();
    }, [user]);

    // 最新の3件
    const recentPosts = posts.slice(0, 3);

    return (
        <div className='flex min-h-screen font-sans overflow-hidden bg-transparent text-white selection:bg-cyan-500/30'>
            <Sidebar />
            
            <main className='flex-1 md:ml-64 relative overflow-y-auto custom-scrollbar h-screen'>
                <AuroraBackground />

                {/* ヘッダーバナー画像 (黒ベースのグラデーション) */}
                <div className="h-48 w-full bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black/40 border-b border-white/5 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                </div>

                <div className="max-w-6xl mx-auto px-6 pb-20 -mt-16 relative z-10">
                    
                    {/* プロフィールヘッダーエリア */}
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-8">
                        <div className="flex items-end gap-6">
                            {/* アバター */}
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full p-1 bg-[#0a0a0a] ring-2 ring-white/10 overflow-hidden relative z-10">
                                    <img 
                                        src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover bg-black"
                                    />
                                </div>
                                {/* オンラインインジケータ */}
                                <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center z-20">
                                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]" />
                                </div>
                            </div>

                            {/* 名前 & ID */}
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-white">{user?.displayName || 'Guest User'}</h1>
                                <p className="text-gray-400 font-mono">@{user?.email?.split('@')[0] || 'guest_dev'}</p>
                            </div>
                        </div>

                        {/* アクションボタン (見た目だけ) */}
                        <div className="flex gap-3 mb-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
                                <Edit3 size={16} /> Edit Profile
                            </button>
                            <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                <Share2 size={18} />
                            </button>
                            <button className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* メインダッシュボードグリッド */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                        
                        {/* 左カラム: プロフィール詳細 & スタッツ */}
                        <div className="space-y-6">
                            {/* Bio & Info */}
                            <div className="space-y-4">
                                <p className="text-gray-300 leading-relaxed text-sm">
                                    HAL名古屋IT学科1年生<br />
                                    よろしくお願いします。
                                </p>
                                <div className="space-y-2 text-sm text-gray-500 font-mono">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" /> NAGOYA, JAPAN
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={14} className="text-gray-400" /> 
                                        <a href="#" className="hover:text-blue-400 transition-colors">github.com/kaketo</a>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" /> Joined January 2025
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 bg-[#161616]/60 backdrop-blur-md rounded-xl p-4 border border-white/5">
                                <div className="text-center">
                                    <div className="text-xl font-bold text-white">{posts.length}</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Posts</div>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <div className="text-xl font-bold text-white">50</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Followers</div>
                                </div>
                                <div className="text-center border-l border-white/5">
                                    <div className="text-xl font-bold text-white">50</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Following</div>
                                </div>
                            </div>
                        </div>

                        {/* 中央カラム: スキルマップ */}
                        <div className="bg-[#161616]/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                            <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 flex items-center gap-2">
                                <Code2 size={14} /> SKILL MAP
                            </div>
                            <div className="mt-4">
                                <SkillRadarChart />
                            </div>
                        </div>

                        {/* 右カラム: Recent Activity */}
                        <div className="bg-[#161616]/40 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col">
                            <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-2">
                                <span className="text-xs font-bold text-blue-400 flex items-center gap-2">
                                    <Loader2 size={12} className="animate-spin" /> RECENT
                                </span>
                                <span className="text-xs font-bold text-gray-600">FAVORITES</span>
                            </div>

                            <div className="flex-1 space-y-3">
                                {loading ? (
                                    <div className="text-center py-4 text-gray-500 text-xs">Loading...</div>
                                ) : recentPosts.length > 0 ? (
                                    recentPosts.map(post => (
                                        <div key={post.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                                            <div className="w-10 h-10 rounded-md bg-[#222] overflow-hidden border border-white/10 shrink-0">
                                                {post.thumbnail ? (
                                                    <img src={post.thumbnail} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-600"><ImageIcon size={14} /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-300 truncate group-hover:text-white">
                                                    {post.caption || 'No caption'}
                                                </div>
                                                <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                                    {post.type === 'text' ? <Code2 size={10} /> : <Layers size={10} />}
                                                    {post.type === 'text' ? 'React' : 'Block'}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 text-xs text-center py-4">No recent activity</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* 下部: All Posts */}
                    <div className="border-t border-white/10 pt-8">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 pl-2 border-l-2 border-blue-500">
                            All Posts
                        </h2>
                        
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-500" /></div>
                        ) : posts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {posts.map((post, i) => (
                                    <motion.div 
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => window.location.href = `/post/${post.id}`}
                                        className="aspect-video bg-[#161616]/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10 hover:border-blue-500/30 cursor-pointer relative group"
                                    >
                                        {post.thumbnail ? (
                                            <img src={post.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600">
                                                <Code2 size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <p className="text-xs text-white truncate w-full">{post.caption || 'Untitled Snippet'}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-[#161616]/40 rounded-2xl border border-white/5 border-dashed">
                                <p className="text-gray-500">No posts yet.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}