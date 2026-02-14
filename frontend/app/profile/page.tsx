'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
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

    // 未ログイン時の表示 (白背景)
    if (!user && !loading) {
        return (
            <div className='flex min-h-screen bg-[#F9FAFB] text-gray-900 font-sans'>
                <Sidebar />
                <main className='flex-1 md:ml-64 flex items-center justify-center'>
                    <p className="text-gray-500">プロフィールを表示するにはサインインしてください。</p>
                </main>
            </div>
        );
    }

    return (
        <div className='flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 h-full relative'>
                
                <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                    
                    {/* ヘッダーバナー画像 (明るいグラデーション) */}
                    <div className="h-48 w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b border-gray-200 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                    </div>

                    {/* プロフィール情報エリア */}
                    <div className="max-w-5xl mx-auto px-6 pb-20">
                        
                        {/* アイコンと基本情報 */}
                        <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-end md:items-center gap-6">
                            {/* アバター画像 (枠線を白に) */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img 
                                    src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                                    alt="Profile" 
                                    className="relative w-32 h-32 rounded-full border-4 border-white bg-white object-cover shadow-md"
                                />
                            </div>
                            
                            {/* 名前とID */}
                            <div className="flex-1 mb-2 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">{user?.displayName || "Guest User"}</h1>
                                <p className="text-gray-500">@{user?.email?.split('@')[0] || "guest"}</p>
                            </div>

                            {/* 編集ボタン (白背景スタイル) */}
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold text-gray-700 shadow-sm mb-4 md:mb-0">
                                <Settings size={16} />
                                <span>プロフィール編集</span>
                            </button>
                        </div>

                        {/* ステータス・自己紹介 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="md:col-span-2 space-y-4">
                                <p className="text-gray-700 leading-relaxed">
                                    こんにちは！ScriptShotでコードやブロック作品を投稿しています。
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin size={14} />
                                        <span>東京, 日本</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>2025年11月から利用中</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* スタッツカード (白カードスタイル) */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 flex justify-around items-center shadow-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">投稿</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">128</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">いいね</div>
                                </div>
                                <div className="w-px h-8 bg-gray-200"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">42</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">フォロー</div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 my-8"></div>

                        {/* 投稿一覧 */}
                        <div className="mb-6 flex items-center gap-3">
                            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                            <h2 className="text-xl font-bold text-gray-900">あなたの投稿</h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="animate-spin text-gray-400" />
                            </div>
                        ) : posts.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {posts.map(post => (
                                    // PostCardも背景色に応じて微調整が必要かもしれませんが、
                                    // 基本的にカードスタイルなら白背景でも馴染みます
                                    <div key={post.id}>
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 border-dashed shadow-sm">
                                <p className="text-gray-500 mb-4">まだ投稿がありません。</p>
                                <a href="/create" className="text-blue-600 hover:text-blue-500 font-bold inline-flex items-center gap-1">
                                    最初の投稿を作成する &rarr;
                                </a>
                            </div>
                        )}

                    </div>
                </div>

            </main>
        </div>
    );
}