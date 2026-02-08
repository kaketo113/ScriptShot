'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { AuroraBackground } from '../../components/AuroraBackground';
import { PostCard } from '../../components/PostCard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { User as UserIcon, MapPin, Calendar, Settings, Loader2 } from 'lucide-react';

export default function ProfilePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ユーザーの投稿だけを取得する
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                // userId が自分のものを検索
                const q = query(
                    collection(db, "posts"), 
                    where("userId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const querySnapshot = await getDocs(q);
                setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error("Error fetching user posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, [user]);

    // 未ログイン時の表示
    if (!user && !loading) {
        return (
            <div className='flex min-h-screen bg-black text-white font-sans'>
                <Sidebar />
                <main className='flex-1 md:ml-64 flex items-center justify-center'>
                    <p className="text-gray-500">Please sign in to view your profile.</p>
                </main>
            </div>
        );
    }

    return (
        <div className='flex h-screen bg-black text-white font-sans overflow-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 h-full relative'>
                <AuroraBackground className="w-full h-full">
                    
                    <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                        
                        {/* ヘッダーバナー画像 */}
                        <div className="h-48 w-full bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-black/40 border-b border-white/5 relative">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        </div>

                        {/* プロフィール情報エリア */}
                        <div className="max-w-5xl mx-auto px-6 pb-20">
                            
                            {/* アイコンと基本情報 */}
                            <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-end md:items-center gap-6">
                                {/* アバター画像 */}
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                                        alt="Profile" 
                                        className="relative w-32 h-32 rounded-full border-4 border-black bg-black object-cover"
                                    />
                                </div>
                                
                                {/* 名前とID */}
                                <div className="flex-1 mb-2">
                                    <h1 className="text-3xl font-bold text-white">{user?.displayName || "Guest User"}</h1>
                                    <p className="text-gray-400">@{user?.email?.split('@')[0] || "guest"}</p>
                                </div>

                                {/* 編集ボタン（ダミー） */}
                                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-bold mb-4 md:mb-0">
                                    <Settings size={16} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>

                            {/* ステータス・自己紹介（ダミー） */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <div className="md:col-span-2 space-y-4">
                                    <p className="text-gray-300 leading-relaxed">
                                        Frontend Developer & UI Designer. Creating awesome snippets with ScriptShot.
                                        Love React, Next.js, and Tailwind CSS. 🚀
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            <span>Tokyo, Japan</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            <span>Joined November 2025</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* スタッツカード */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-around items-center">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{posts.length}</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Posts</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">128</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Likes</div>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">42</div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider">Following</div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-white/10 my-8"></div>

                            {/* 投稿一覧 */}
                            <div className="mb-6 flex items-center gap-3">
                                <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-bold">Your Snippets</h2>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="animate-spin text-gray-500" />
                                </div>
                            ) : posts.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {posts.map(post => (
                                        <div key={post.id} className="backdrop-blur-sm">
                                            <PostCard post={post} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                    <p className="text-gray-400 mb-4">No snippets created yet.</p>
                                    <a href="/create" className="text-blue-400 hover:text-blue-300 font-bold">Create your first snippet &rarr;</a>
                                </div>
                            )}

                        </div>
                    </div>

                </AuroraBackground>
            </main>
        </div>
    );
}