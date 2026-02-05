'use client';

import React, { useState, useEffect } from 'react';
import { 
    Heart, MessageCircle, MoreHorizontal, Code2, Play, Share2, Layers, 
    Sparkles, TrendingUp, Image as ImageIcon, Loader2
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { db } from '../lib/firebase';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Types ---
interface PostData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'text' | 'block';
    code?: string;
    codeSnippet?: string;
    thumbnail?: string; 
    blocks?: any[];
    likes: number;
    comments: number;
    createdAt: Timestamp;
}

// --- Animation Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const cardVariants: Variants = {
    hidden: { y: 50, opacity: 0, scale: 0.95 },
    show: { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        transition: { type: "spring", stiffness: 50, damping: 15 }
    }
};

// --- Components ---

const SkeletonCard = () => (
    <div className="bg-[#161616]/40 backdrop-blur-md rounded-3xl overflow-hidden mb-8 border border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        <div className="px-6 py-4 flex items-center gap-3 border-b border-white/5">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="space-y-2">
                <div className="w-24 h-3 bg-white/10 rounded" />
                <div className="w-16 h-2 bg-white/10 rounded" />
            </div>
        </div>
        <div className="h-64 bg-white/5" />
        <div className="px-6 py-4 flex gap-4">
            <div className="w-8 h-8 rounded bg-white/10" />
            <div className="w-8 h-8 rounded bg-white/10" />
        </div>
    </div>
);

const PostCard = ({ post }: { post: PostData }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    useEffect(() => {
        if (!post.thumbnail) {
            const code = post.type === 'text' ? post.code : post.codeSnippet;
            if (code) {
                const blob = new Blob([code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        }
    }, [post]);

    const handleCardClick = () => {
        window.location.href = `/post/${post.id}`;
    };

    return (
        <motion.article 
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            onClick={handleCardClick}
            // カードの背景をさらに透明にして、後ろの派手なグラデーションを透かす
            className='bg-[#0a0a0a]/50 backdrop-blur-xl rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/10 hover:border-blue-500/30 hover:shadow-blue-900/20 transition-all cursor-pointer group/card relative'
        >
            {/* Header */}
            <div className='px-6 py-4 flex items-center justify-between border-b border-white/5 bg-white/5'>
                <div className='flex items-center gap-3'>
                    <motion.div whileHover={{ scale: 1.1 }} className='w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-cyan-400 to-blue-600'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.userAvatar} alt={post.userName} className='w-full h-full rounded-full bg-black object-cover border-2 border-black' 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                    </motion.div>
                    <div>
                        <h3 className='font-bold text-sm text-white group-hover/card:text-cyan-400 transition-colors'>
                            {post.userName}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className='text-[10px] text-gray-400'>
                                {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </span>
                            {post.type === 'block' ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Block
                                </span>
                            ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                                    <Code2 className="w-3 h-3" /> Text
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={(e) => e.stopPropagation()} className='text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors'>
                    <MoreHorizontal className='w-5 h-5' />
                </button>
            </div>

            {/* Content */}
            <div className='flex flex-col md:flex-row h-80 md:h-72 border-b border-white/5'>
                {/* Code Side */}
                <div className='w-full md:w-1/2 bg-[#000000]/60 border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group'>
                    <div className="absolute top-3 left-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 z-10">
                        {post.type === 'text' ? <Code2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                        LOGIC
                    </div>
                    {/* Matrix Grid Decoration */}
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.05)_25%,rgba(255,255,255,.05)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.05)_75%,rgba(255,255,255,.05)_76%,transparent_77%,transparent)] bg-[length:30px_30px] opacity-20 pointer-events-none" />
                    
                    <div className="p-6 pt-10 h-full overflow-hidden relative opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                        <pre className='font-mono text-xs text-blue-100/90 leading-relaxed whitespace-pre-wrap break-all line-clamp-[12]'>
                            {post.code || 'No code content'}
                        </pre>
                        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                    </div>
                </div>

                {/* Preview Side */}
                <div className='w-full md:w-1/2 bg-[#111]/80 relative overflow-hidden group'>
                    <div className="absolute top-3 right-4 text-[10px] font-bold text-white/90 uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 z-10 shadow-lg">
                        Preview
                    </div>
                    
                    {post.thumbnail ? (
                        <div className="w-full h-full bg-white flex items-center justify-center relative">
                            <img 
                                src={post.thumbnail} 
                                alt="Preview" 
                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    ) : previewUrl ? (
                        <iframe 
                            src={previewUrl}
                            className="w-full h-full border-none opacity-90 bg-white pointer-events-none"
                            title="Post Preview"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs gap-2">
                            <Loader2 className="animate-spin w-4 h-4" /> Generating...
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                        <motion.div 
                            initial={{ scale: 0.5 }}
                            whileHover={{ scale: 1.1 }}
                            className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] cursor-pointer"
                        >
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className='px-6 py-4 bg-[#111]/40 flex items-center gap-6 border-t border-white/5'>
                <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes + (isLiked ? 1 : 0)}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} className='flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors'>
                    <MessageCircle className='w-5 h-5' />
                    <span>{post.comments}</span>
                </motion.button>
                <motion.button whileTap={{ scale: 0.9, rotate: 15 }} onClick={(e) => e.stopPropagation()} className='ml-auto text-gray-400 hover:text-green-400 transition-colors'>
                    <Share2 className='w-5 h-5' />
                </motion.button>
            </div>
        </motion.article>
    );
};

export default function HomePage() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"));
                const querySnapshot = await getDocs(q);
                const fetchedPosts: PostData[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() } as PostData);
                });
                fetchedPosts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        // 親要素の背景色は削除し、下の fixed 要素に任せる
        <div className='flex min-h-screen font-sans overflow-hidden selection:bg-cyan-500/30 text-white'>
            <Sidebar />
            
            {/* メインエリアは背景透明にする */}
            <main className='flex-1 md:ml-64 relative overflow-y-auto custom-scrollbar h-screen bg-transparent'>
                
                {/* =================================================================================
                    ★ 究極進化版：ミッドナイト・オーロラ背景
                    z-index を -1 にして、コンテンツの裏に強制的に配置
                   ================================================================================= */}
                <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                    {/* 1. ベースの深い青色（ここが重要：真っ黒にしない） */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#000000] to-[#000000]" />

                    {/* 2. 強烈な光の柱（シアン） */}
                    <motion.div 
                        animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                        transition={{ duration: 8, repeat: Infinity }}
                        className="absolute -top-[300px] left-[20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"
                    />

                    {/* 3. 漂う光の霧（紫） */}
                    <motion.div 
                        animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"
                    />

                    {/* 4. 底から湧き上がる光（青） */}
                    <div className="absolute bottom-[-200px] left-0 right-0 h-[400px] bg-blue-900/20 blur-[100px]" />

                    {/* 5. グリッドパターン（濃くして視認性を上げる） */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
                    
                    {/* 6. ノイズ（質感をプラス） */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </div>

                <div className='relative z-10 max-w-3xl mx-auto px-4 pb-20'>
                    {/* Hero Section */}
                    <div className="pt-8 pb-6 md:pt-16 md:pb-12">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-between mb-2"
                        >
                            <h1 className='text-4xl md:text-5xl font-black tracking-tight drop-shadow-2xl'>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-blue-200">
                                    Discover
                                </span>
                            </h1>
                        </motion.div>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-400 text-sm font-medium pl-1"
                        >
                            Explore the latest snippets from the community.
                        </motion.p>
                    </div>

                    {/* Timeline Feed */}
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : posts.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className='space-y-8'
                        >
                            <AnimatePresence>
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className='text-center py-20 opacity-50 flex flex-col items-center gap-4'
                        >
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                                <ImageIcon className="w-10 h-10 text-gray-500" />
                            </div>
                            <p className="text-gray-400">No posts yet. Be the first creator!</p>
                        </motion.div>
                    )}

                    {!loading && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className='text-center py-12 text-gray-500 text-sm'
                        >
                            <div className="w-1 h-12 bg-gradient-to-b from-transparent via-cyan-900/50 to-transparent mx-auto mb-4" />
                            <p className="font-mono text-xs tracking-widest uppercase">End of Feed</p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}