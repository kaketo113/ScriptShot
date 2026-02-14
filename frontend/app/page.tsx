'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
    Code2, Box, ArrowRight, Layers, Share2, Zap, 
    MousePointerClick, CreditCard, Image as ImageIcon, Type,
    Youtube, FileInput, RotateCcw, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 漂う要素のデータ定義
const FLOATING_ITEMS = [
    // Tags (Code Mode)
    { type: 'tag', label: '<div>', top: '10%', left: '10%', delay: 0 },
    { type: 'tag', label: '<main>', top: '20%', left: '85%', delay: 1 },
    { type: 'tag', label: '<a>', top: '75%', left: '15%', delay: 2 },
    { type: 'tag', label: '<p>', top: '60%', left: '80%', delay: 0.5 },
    { type: 'tag', label: '<img>', top: '15%', left: '50%', delay: 1.5 },
    { type: 'tag', label: '<button>', top: '85%', left: '60%', delay: 2.5 },
    
    // Block Icons (Block Mode)
    { type: 'block', icon: Type, label: 'Heading', top: '30%', left: '5%', delay: 0.8 },
    { type: 'block', icon: Box, label: 'Text', top: '50%', left: '92%', delay: 1.2 },
    { type: 'block', icon: ImageIcon, label: 'Image', top: '80%', left: '30%', delay: 0.3 },
    { type: 'block', icon: MousePointerClick, label: 'Button', top: '25%', left: '70%', delay: 2.2 },
    { type: 'block', icon: CreditCard, label: 'Card', top: '65%', left: '5%', delay: 1.8 },
    { type: 'block', icon: Youtube, label: 'YouTube', top: '40%', left: '25%', delay: 2.8 },
    { type: 'block', icon: FileInput, label: 'Input', top: '10%', left: '35%', delay: 1.0 },
];

// 漂うアニメーションコンポーネント
const FloatingElement = ({ item }: { item: any }) => {
    const isTag = item.type === 'tag';
    const Icon = item.icon;

    return (
        <motion.div
            className={`absolute z-0 pointer-events-none select-none flex items-center justify-center
                ${isTag 
                    ? 'px-5 py-3 rounded-xl bg-white border border-blue-100 text-blue-600 font-mono text-base font-bold shadow-lg shadow-blue-500/5' 
                    : 'p-4 rounded-2xl bg-white border border-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/5'
                }
            `}
            style={{ top: item.top, left: item.left }}
            animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
            }}
            transition={{ 
                duration: 5 + Math.random() * 3,
                repeat: Infinity, 
                ease: "easeInOut",
                delay: item.delay 
            }}
        >
            {isTag ? (
                <span>{item.label}</span>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-full bg-emerald-50">
                        <Icon size={28} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{item.label}</span>
                </div>
            )}
        </motion.div>
    );
};

export default function Home() {
    const { user, login } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    
    // ヒーローセクションの表示状態管理
    const [showHero, setShowHero] = useState(false);

    useEffect(() => {
        // ローカルストレージをチェック
        // 'hide_hero_section' が 'true' でなければ表示する
        const isHidden = localStorage.getItem('hide_hero_section');
        if (!isHidden) {
            setShowHero(true);
        }

        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPosts();
    }, []);

    //「今後表示しない」処理
    const handleCloseHero = () => {
        localStorage.setItem('hide_hero_section', 'true');
        setShowHero(false);
    };

    const handleShowHero = () => {
    localStorage.removeItem('hide_hero_section'); // 設定を削除して復活させる
    setShowHero(true);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 上部へ戻る
};

    return (
        <div className='flex min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-500/20'>
            <Sidebar />

            <main className='flex-1 md:ml-64'>
                
                {/* ヒーローセクション */}
                {/* AnimatePresenceで消えるときもアニメーションさせる */}
                <AnimatePresence>
                    {showHero && (
                        <motion.div 
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="relative w-full border-b border-gray-200 overflow-hidden min-h-[650px] flex items-center justify-center bg-white perspective-1000"
                        >
                            
                            {/* 背景グリッド */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] opacity-60"></div>
                            
                            {/* 漂う要素たち */}
                            <div className="absolute inset-0 overflow-hidden">
                                {FLOATING_ITEMS.map((item, index) => (
                                    <FloatingElement key={index} item={item} />
                                ))}
                            </div>

                            {/* 光のエフェクト */}
                            <div className="absolute left-0 top-0 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
                            <div className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 opacity-60"></div>

                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_80%)] z-0 pointer-events-none"></div>

                            <button 
                                onClick={handleCloseHero}
                                className="absolute top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/50 hover:bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:text-red-500 transition-all shadow-sm backdrop-blur-sm group"
                            >
                                <span>今後表示しない</span>
                                <div className="bg-gray-200 group-hover:bg-red-100 rounded-full p-0.5 transition-colors">
                                    <X size={12} />
                                </div>
                            </button>

                            {/* コンテンツ */}
                            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center">
                                
                                <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 drop-shadow-sm">
                                    コードを書いて、<br className="md:hidden" />世界に共有しよう。
                                </h1>
                                
                                <p className="text-gray-500 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
                                    ScriptShotは、あなたのコードやアイデアを美しく共有するプラットフォームです。
                                    <br className="hidden md:block" />
                                    <a href='/create'><span className="text-blue-600 font-bold decoration-blue-200 underline decoration-4 underline-offset-4"> プログラミング</span></a> も 
                                    <a href='/create/block'><span className="text-emerald-600 font-bold decoration-emerald-200 underline decoration-4 underline-offset-4 ml-2"> ノーコード制作</span></a> も、これ一つで。
                                </p>

                                {/* モード選択エリア */}
                                <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
                                    {!user ? (
                                        <button 
                                            onClick={login}
                                            className="group relative px-10 py-5 bg-black text-white font-bold rounded-2xl text-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-4 shadow-xl w-full md:w-auto"
                                        >
                                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-6 h-6" />
                                            <span>Googleで始める</span>
                                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    ) : (
                                        <>
                                            {/* Text Mode */}
                                            <a href="/create" className="group flex-1 flex flex-col items-center p-6 rounded-3xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left relative overflow-hidden hover:-translate-y-1">
                                                <div className="relative z-10 flex flex-col items-center text-center gap-4 py-2">
                                                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                                        <Code2 size={32} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xl text-gray-900 mb-1">コードを書く</div>
                                                        <div className="text-sm text-gray-500">HTML/CSSを直接編集</div>
                                                    </div>
                                                </div>
                                            </a>

                                            {/* Block Mode */}
                                            <a href="/create/block" className="group flex-1 flex flex-col items-center p-6 rounded-3xl bg-white border-2 border-emerald-100 hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-left relative overflow-hidden hover:-translate-y-1">
                                                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span>🔰 おすすめ</span>
                                                </div>
                                                <div className="relative z-10 flex flex-col items-center text-center gap-4 py-2">
                                                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                                        <MousePointerClick size={32} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xl text-gray-900 mb-1">ブロックで作る</div>
                                                        <div className="text-sm text-emerald-600/70 group-hover:text-emerald-600">直感的なドラッグ＆ドロップ</div>
                                                    </div>
                                                </div>
                                            </a>
                                        </>
                                    )}
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 使い方ガイド (ヒーローセクションが表示されている時だけ出す) */}
                <AnimatePresence>
                    {showHero && (
                        <motion.div 
                            initial={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-b border-gray-200 bg-[#F9FAFB]"
                        >
                            <div className="max-w-6xl mx-auto px-6 py-16">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 text-center">このサイトの機能</h2>
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 transition-colors shadow-sm">
                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4"><Zap size={24} /></div>
                                        <h3 className="text-xl font-bold mb-2 text-gray-900">1. 選べるモード</h3>
                                        <p className="text-gray-500 text-sm">ガッツリ書きたい人は「テキストモード」、<br />手軽に作りたい人「ブロックモード」を選択。</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-purple-200 transition-colors shadow-sm">
                                        <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 mb-4"><Layers size={24} /></div>
                                        <h3 className="text-xl font-bold mb-2 text-gray-900">2. リアルタイムプレビュー</h3>
                                        <p className="text-gray-500 text-sm">自分が今書いているコードを<br />一画面で見ることができます。</p>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 transition-colors shadow-sm">
                                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 mb-4"><Share2 size={24} /></div>
                                        <h3 className="text-xl font-bold mb-2 text-gray-900">3. ワンクリックで投稿</h3>
                                        <p className="text-gray-500 text-sm">完成して投稿するとあなたの作品を<br />世界中の人が閲覧します。</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* タイムライン */}
                <div className="max-w-5xl mx-auto px-6 py-12">
                    {!showHero && (
                        <button 
                            onClick={handleShowHero}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
                        >
                            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
                            <span>使い方ガイドを再表示</span>
                        </button>
                    )}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900">最新の投稿</h2>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                    {posts.length === 0 && (
                        <div className="text-center py-20 text-gray-400">
                            <p>まだ投稿がありません。あなたが最初のクリエイターになりましょう！</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}