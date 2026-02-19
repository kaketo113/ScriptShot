'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Sidebar } from '../components/Sidebar';
import { PostCard } from '../components/PostCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; 
import { useAuth } from '../context/AuthContext';
import { 
    Code2, Box, Layers, Share2, Zap, 
    MousePointerClick, CreditCard, Image as ImageIcon, Type,
    Youtube, FileInput, RotateCcw, X, ChevronLeft, ChevronRight, PlayCircle, ChevronDown, Loader2,
    Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const FETCH_LIMIT = 20; // リアルタイム監視する件数を少し多めに設定
const HOT_LIMIT = 3;

export default function Home() {
    const { user } = useAuth();
    
    // データ管理用のState
    const [posts, setPosts] = useState<any[]>([]);
    const [hotPosts, setHotPosts] = useState<any[]>([]);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);

    // UI管理用のState
    const [showHero, setShowHero] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const timelineRef = useRef<HTMLDivElement>(null);

    // リアルタイムリスナー（onSnapshot）の設定
    useEffect(() => {
        const isHidden = localStorage.getItem('hide_hero_section');
        if (!isHidden) setShowHero(true);

        // 1. 最新の投稿をリアルタイム監視
        const latestQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(FETCH_LIMIT));
        
        const unsubscribeLatest = onSnapshot(latestQuery, (snapshot) => {
            const fetchedLatest = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPosts(fetchedLatest);
            // Hotの取得が終わっていなくても、最新が取れればローディングを解除する
            setIsLoadingInitial(false); 
        }, (error) => {
            console.error("最新投稿の監視エラー:", error);
            setIsLoadingInitial(false);
        });

        // 2. 熱い投稿をリアルタイム監視
        const hotQuery = query(collection(db, "posts"), orderBy("likes", "desc"), limit(HOT_LIMIT));
        
        const unsubscribeHot = onSnapshot(hotQuery, (snapshot) => {
            const fetchedHot = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((post: any) => (post.likes || 0) > 0);
            setHotPosts(fetchedHot);
        }, (error) => {
            console.error("熱い投稿の監視エラー:", error);
        });

        // コンポーネントのアンマウント時にリスナーを解除（メモリリーク防止）
        return () => {
            unsubscribeLatest();
            unsubscribeHot();
        };
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

    return (
        <div className='flex min-h-screen bg-[#F9FAFB] text-[#111827] font-sans selection:bg-blue-500/20 overflow-x-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 relative'>
                {/* ヒーローセクション */}
                <AnimatePresence />

                {/* タイムラインセクション */}
                <div ref={timelineRef} className="max-w-7xl mx-auto px-6 py-16">
                    {!showHero && (
                        <button onClick={handleShowHero} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group mb-6">
                            <RotateCcw size={14} className="group-hover:-rotate-180 transition-transform duration-500" />
                            <span>使い方ガイドを再表示</span>
                        </button>
                    )}

                    {isLoadingInitial ? (
                        <div className="flex justify-center items-center py-32">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* 熱い投稿セクション */}
                            {hotPosts.length > 0 && (
                                <div className="mb-16 bg-white p-8 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

                                    <div className="flex items-center gap-3 mb-8 relative z-10">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-xl">
                                            <Flame size={24} className="animate-pulse" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">今、熱い投稿</h2>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10'>
                                        {hotPosts.map((post, index) => (
                                            <div key={`hot-${post.id}`} className="relative">
                                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 text-white flex items-center justify-center rounded-full font-bold text-sm z-20 shadow-md">
                                                    {index + 1}
                                                </div>
                                                <PostCard post={post} /> 
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 最新の投稿セクション */}
                            <div className="flex items-center gap-3 mb-10 mt-8">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">最新の投稿</h2>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                    <p className="text-lg">まだ投稿がありません。<br />あなたが最初のクリエイターになりましょう！</p>
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                                    {posts.map(post => <PostCard key={`latest-${post.id}`} post={post} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}