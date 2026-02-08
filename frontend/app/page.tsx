'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
    Code2, Box, ArrowRight, Sparkles, Layers, Share2, 
    Zap, PlayCircle 
} from 'lucide-react';

export default function Home() {
    const { user, login } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPosts();
    }, []);

    return (
        <div className='flex min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30'>
            <Sidebar />

            <main className='flex-1 md:ml-64'>
                
                {/* --- 🚀 ヒーローセクション (一番上のデカいバナー) --- */}
                <div className="relative w-full border-b border-white/10 overflow-hidden">
                    {/* 背景装飾: グリッドとボヤッとした光 */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

                    <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
                        
                        {/* キャッチコピー */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-blue-400 mb-6 animate-pulse">
                            <Sparkles size={12} />
                            <span>Share your creativity instantly</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
                            コードを書いて、<br className="md:hidden" />世界に共有しよう。
                        </h1>
                        
                        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
                            ScriptShotは、あなたのコードやアイデアを美しく共有するプラットフォームです。
                            <span className="text-white font-bold"> プログラミング</span> も 
                            <span className="text-white font-bold"> ノーコード制作</span> も、これ一つで。
                        </p>

                        {/* アクションボタンエリア (ここが重要！) */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            {!user ? (
                                // ログインしていない時
                                <button 
                                    onClick={login}
                                    className="group relative px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                                    Googleで始める
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                // ログインしている時：2つのモードへの誘導
                                <>
                                    <a href="/create" className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20">
                                        <Code2 className="w-5 h-5" />
                                        コードを書く
                                    </a>
                                    <a href="/create/block" className="group px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-900/20">
                                        <Box className="w-5 h-5" />
                                        ブロックで作る
                                        <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded-full ml-1">No-Code</span>
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 📚 使い方ガイド (チュートリアルの代わり) --- */}
                <div className="border-b border-white/5 bg-[#0a0a0a]">
                    <div className="max-w-6xl mx-auto px-6 py-16">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-10 text-center">How It Works</h2>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Step 1 */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-4">
                                    <Zap size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">1. Choose Mode</h3>
                                <p className="text-gray-400 text-sm">
                                    ガッツリ書きたい人は「テキストモード」、
                                    手軽に作りたい人は直感的な「ブロックモード」を選択。
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 mb-4">
                                    <Layers size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">2. Create & Visualize</h3>
                                <p className="text-gray-400 text-sm">
                                    リアルタイムプレビューを見ながら作成。
                                    HTML/CSSの知識がなくても、美しいカードが作れます。
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-400 mb-4">
                                    <Share2 size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">3. Share Globally</h3>
                                <p className="text-gray-400 text-sm">
                                    完成したらワンクリックで投稿。
                                    あなたの作品がタイムラインに流れ、世界中の人が閲覧します。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 📝 タイムライン (既存の投稿一覧) --- */}
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-white">Latest Snippets</h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                    
                    {posts.length === 0 && (
                        <div className="text-center py-20 text-gray-500">
                            <p>まだ投稿がありません。あなたが最初のクリエイターになりましょう！</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}