'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
    Code2, Box, ArrowRight, Layers, Share2, Zap, 
    MousePointerClick, CreditCard, Image as ImageIcon, Type,
    Youtube, FileInput, RotateCcw, X, ChevronLeft, ChevronRight, PlayCircle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 漂う要素の設定
const FLOATING_ITEMS = [
    { type: 'tag', label: '<div>', top: '10%', left: '10%', delay: 0 },
    { type: 'tag', label: '<main>', top: '20%', left: '85%', delay: 1 },
    { type: 'tag', label: '<a>', top: '75%', left: '15%', delay: 2 },
    { type: 'tag', label: '<p>', top: '60%', left: '80%', delay: 0.5 },
    { type: 'tag', label: '<img>', top: '15%', left: '50%', delay: 1.5 },
    { type: 'tag', label: '<button>', top: '85%', left: '60%', delay: 2.5 },
    { type: 'block', icon: Type, label: 'Heading', top: '30%', left: '5%', delay: 0.8 },
    { type: 'block', icon: Box, label: 'Text', top: '50%', left: '92%', delay: 1.2 },
    { type: 'block', icon: ImageIcon, label: 'Image', top: '80%', left: '30%', delay: 0.3 },
    { type: 'block', icon: MousePointerClick, label: 'Button', top: '25%', left: '70%', delay: 2.2 },
    { type: 'block', icon: CreditCard, label: 'Card', top: '65%', left: '5%', delay: 1.8 },
    { type: 'block', icon: Youtube, label: 'YouTube', top: '40%', left: '25%', delay: 2.8 },
    { type: 'block', icon: FileInput, label: 'Input', top: '10%', left: '35%', delay: 1.0 },
];

const FloatingElement = ({ item }: { item: any }) => {
    const isTag = item.type === 'tag';
    const Icon = item.icon;
    return (
        <motion.div
            className={`absolute z-0 pointer-events-none select-none flex items-center justify-center
                ${isTag 
                    ? 'px-5 py-3 rounded-xl bg-white/80 backdrop-blur-sm border border-blue-100 text-blue-600 font-mono text-base font-bold shadow-lg shadow-blue-500/5' 
                    : 'p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/5'
                }`}
            style={{ top: item.top, left: item.left }}
            animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 5 + Math.random() * 3, repeat: Infinity, ease: "easeInOut", delay: item.delay }}
        >
            {isTag ? <span>{item.label}</span> : (
                <div className="flex flex-col items-center gap-2">
                    <div className="p-2 rounded-full bg-emerald-50"><Icon size={28} /></div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">{item.label}</span>
                </div>
            )}
        </motion.div>
    );
};

export default function Home() {
    const { user, login } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [showHero, setShowHero] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const timelineRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isHidden = localStorage.getItem('hide_hero_section');
        if (!isHidden) setShowHero(true);

        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchPosts();
    }, []);

    const handleCloseHero = () => {
        localStorage.setItem('hide_hero_section', 'true');
        setShowHero(false);
    };

    const handleShowHero = () => {
        localStorage.removeItem('hide_hero_section');
        setShowHero(true);
        setCurrentSlide(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToTimeline = () => {
        timelineRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const nextSlide = () => setCurrentSlide((prev) => (prev === 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? 1 : prev - 1));

    return (
        <div className='flex min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-500/20 overflow-x-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 relative'>
                <AnimatePresence>
                    {showHero && (
                        <motion.div 
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                        >
                            {/* Hero Slides (100vh) */}
                            <div className="relative w-full border-b border-gray-200 min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:32px_32px] opacity-40"></div>
                                
                                <button onClick={handleCloseHero} className="absolute top-6 right-6 z-50 flex items-center gap-2 px-3 py-1.5 bg-white/50 hover:bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 hover:text-red-500 transition-all backdrop-blur-sm group shadow-sm">
                                    <span>使い方ガイドを非表示</span>
                                    <X size={14} />
                                </button>

                                <div className="relative w-full flex-1 flex items-center justify-center">
                                    <AnimatePresence mode="wait">
                                        {currentSlide === 0 ? (
                                            <motion.div 
                                                key="slide1"
                                                initial={{ x: 100, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -100, opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                                            >
                                                <div className="absolute inset-0 overflow-hidden">
                                                    {FLOATING_ITEMS.map((item, index) => <FloatingElement key={index} item={item} />)}
                                                </div>
                                                <div className="relative z-10">
                                                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 drop-shadow-sm leading-tight">
                                                        コードを書いて、<br />世界に共有しよう。
                                                    </h1>
                                                    <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-12">
                                                        ScriptShotは、あなたのコードやアイデアを美しく共有するプラットフォームです。
                                                    </p>
                                                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl mx-auto justify-center">
                                                        <a href="/create" className="group flex-1 p-6 rounded-3xl bg-white border border-gray-100 hover:border-blue-300 shadow-xl transition-all hover:-translate-y-1">
                                                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-4 inline-block"><Code2 size={32} /></div>
                                                            <div className="font-bold text-xl text-gray-900">コードを書く</div>
                                                            <div className="text-sm text-gray-400">HTML/CSSを直接編集</div>
                                                        </a>
                                                        <a href="/create/block" className="group flex-1 p-6 rounded-3xl bg-white border-2 border-emerald-100 hover:border-emerald-400 shadow-xl transition-all hover:-translate-y-1 relative">
                                                            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg transform rotate-3">🔰おすすめ</div>
                                                            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-4 inline-block"><MousePointerClick size={32} /></div>
                                                            <div className="font-bold text-xl text-gray-900">ブロックで作る</div>
                                                            <div className="text-sm text-emerald-600/70">手軽にドラッグ＆ドロップ</div>
                                                        </a>
                                                    </div>
                                                </div>
                                                <button onClick={() => setCurrentSlide(1)} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 group flex flex-col items-center gap-2 z-30">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-blue-600">操作説明動画</span>
                                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all"><ChevronRight size={28} /></div>
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div 
                                                key="slide2"
                                                initial={{ x: 100, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -100, opacity: 0 }}
                                                transition={{ duration: 0.5 }}
                                                className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
                                            >
                                                <button onClick={() => setCurrentSlide(0)} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 group flex flex-col items-center gap-2 z-30">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">戻る</span>
                                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:scale-110 transition-all"><ChevronLeft size={28} /></div>
                                                </button>
                                                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                                    <PlayCircle className="text-blue-600" size={32} /> 1分でわかるScriptShot
                                                </h2>
                                                <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-[8px] border-white ring-1 ring-gray-200">
                                                    <video src="/videos/how-to-use.mp4" className="w-full h-full object-cover" controls autoPlay muted playsInline />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-40">
                                    <button onClick={() => setCurrentSlide(0)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === 0 ? 'bg-blue-600 w-8' : 'bg-gray-200 w-2 hover:bg-gray-300'}`} />
                                    <button onClick={() => setCurrentSlide(1)} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === 1 ? 'bg-blue-600 w-8' : 'bg-gray-200 w-2 hover:bg-gray-300'}`} />
                                </div>

                                <button onClick={scrollToTimeline} className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all animate-bounce z-40">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
                                    <ChevronDown size={20} />
                                </button>
                            </div>

                            {/* サイトの機能紹介エリア (bg-[#F9FAFB]) */}
                            <div className="border-b border-gray-200 bg-[#F9FAFB]">
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
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* タイムラインセクション */}
                <div ref={timelineRef} className="max-w-7xl mx-auto px-6 py-16">
                    {!showHero && (
                        <button onClick={handleShowHero} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group mb-6">
                            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
                            <span>使い方ガイドを再表示</span>
                        </button>
                    )}

                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">最新の投稿</h2>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {posts.map(post => <PostCard key={post.id} post={post} />)}
                    </div>

                    {posts.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                            <p className="text-lg">まだ投稿がありません。<br />あなたが最初のクリエイターになりましょう！</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}