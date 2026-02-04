'use client';

import React, { useState, useEffect } from 'react';
import { 
    Heart, 
    MessageCircle, 
    MoreHorizontal, 
    Code2, 
    Play, 
    Share2,
    Layers,
    Loader2
} from 'lucide-react';
// Sidebarコンポーネントをインポート (相対パス: ./components/Sidebar)
import { Sidebar } from '../components/Sidebar';
// Firebase関連 (相対パス: ./lib/firebase)
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

// --- Type Definitions ---
interface PostData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'text' | 'block';
    code?: string;        // Textモード用
    codeSnippet?: string; // Blockモード用(HTML)
    blocks?: any[];       // Blockモード用(JSON)
    likes: number;
    comments: number;
    createdAt: Timestamp;
}

// --- Post Card Component ---
const PostCard = ({ post }: { post: PostData }) => {
    const [isLiked, setIsLiked] = useState(false);
    
    // 表示用のコードを判別
    const displayCode = post.type === 'text' ? post.code : post.codeSnippet;
    
    // プレビュー用のURL生成
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (displayCode) {
            const blob = new Blob([displayCode], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [displayCode]);

    // 日付フォーマット
    const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Just now';

    return (
        <article className='bg-[#161616] rounded-3xl overflow-hidden mb-8 shadow-xl border border-white/5 hover:border-white/10 transition-colors'>
            
            {/* 1. Header */}
            <div className='px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#1a1a1a]'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px]'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.userAvatar} alt={post.userName} className='w-full h-full rounded-full bg-black object-cover' 
                             onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                    </div>
                    <div>
                        <h3 className='font-bold text-sm text-white hover:text-blue-400 cursor-pointer transition-colors'>
                            {post.userName}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className='text-[10px] text-gray-500'>{date}</span>
                            {post.type === 'block' ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                    <Layers className="w-3 h-3" /> Block
                                </span>
                            ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                                    <Code2 className="w-3 h-3" /> Text
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button className='text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors'>
                    <MoreHorizontal className='w-5 h-5' />
                </button>
            </div>

            {/* 2. Body: Split View */}
            <div className='flex flex-col md:flex-row h-80 md:h-72 border-b border-white/5'>
                
                {/* Left: Code Area */}
                <div className='w-full md:w-1/2 bg-[#0d0d0d] border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group'>
                    <div className="absolute top-3 left-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 z-10">
                        <Code2 className="w-3 h-3" />
                        Code Preview
                    </div>
                    
                    <div className="p-6 pt-10 h-full overflow-auto custom-scrollbar relative">
                        <pre className='font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-all'>
                            {displayCode || 'No code content'}
                        </pre>
                    </div>
                </div>

                {/* Right: Preview Area */}
                <div className='w-full md:w-1/2 bg-[#222] relative overflow-hidden group'>
                    <div className="absolute top-3 right-4 text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10 z-10">
                        Preview
                    </div>
                    
                    {previewUrl ? (
                        <iframe 
                            src={previewUrl}
                            className="w-full h-full border-none opacity-90 transition-opacity duration-700 group-hover:opacity-100"
                            title="Post Preview"
                            sandbox="allow-scripts"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs">Loading Preview...</div>
                    )}
                    
                    {/* Overlay (Click Guard) */}
                    <div className="absolute inset-0 bg-transparent"></div>
                </div>
            </div>

            {/* 3. Footer */}
            <div className='px-6 py-4 bg-[#161616]'>
                <div className='flex items-center gap-6'>
                    <button 
                        onClick={() => setIsLiked(!isLiked)}
                        className={`flex items-center gap-2 text-sm font-medium transition-colors group ${isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Heart className={`w-5 h-5 transition-transform group-active:scale-75 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button className='flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors group'>
                        <MessageCircle className='w-5 h-5 group-active:scale-90 transition-transform' />
                        <span>{post.comments}</span>
                    </button>
                    <button className='flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-green-400 transition-colors ml-auto'>
                        <Share2 className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default function HomePage() {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    // Firestoreからデータ取得
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // created_atで降順（新しい順）
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                
                const fetchedPosts: PostData[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() } as PostData);
                });
                
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching posts:", error);
                // エラー時のフォールバック
                try {
                    const q = query(collection(db, "posts"));
                    const querySnapshot = await getDocs(q);
                    const fetchedPosts: PostData[] = [];
                    querySnapshot.forEach((doc) => fetchedPosts.push({ id: doc.id, ...doc.data() } as PostData));
                    setPosts(fetchedPosts);
                } catch(e) {
                    console.error("Retry failed:", e);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className='flex min-h-screen bg-black text-white font-sans'>
            <Sidebar />
            <main className='flex-1 md:ml-64 bg-[#0a0a0a] min-h-screen'>
                <div className="h-4 md:h-8"></div>
                <div className='max-w-3xl mx-auto px-4 pb-20'>
                    
                    <div className="md:hidden flex items-center justify-between mb-6 px-2">
                        <span className='text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>ScriptShot</span>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-[#161616] rounded-3xl h-96 animate-pulse border border-white/5"></div>
                            ))}
                        </div>
                    ) : posts.length > 0 ? (
                        <div className='space-y-6'>
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-20 opacity-50'>
                            <p>No posts yet. Be the first creator!</p>
                        </div>
                    )}

                    {!loading && (
                        <div className='text-center py-12 text-gray-600 text-sm'>
                            <div className="w-1 h-8 bg-gradient-to-b from-transparent via-gray-800 to-transparent mx-auto mb-4"></div>
                            <p>You're all caught up!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}