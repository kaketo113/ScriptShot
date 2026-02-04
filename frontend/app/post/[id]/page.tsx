'use client';

import React, { useState, useEffect } from 'react';
import { 
    Heart, MessageCircle, MoreHorizontal, Code2, Play, Share2, ArrowLeft, Layers, Layout, Type, Image as ImageIcon, MousePointerClick, Square, Box, Loader2
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { db } from '../../../lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

// --- Block Definitions & Styles ---
type BlockCategory = 'layout' | 'content' | 'component';

const CATEGORY_STYLES = {
    layout: { bg: 'bg-blue-600', border: 'border-blue-700' },
    content: { bg: 'bg-slate-600', border: 'border-slate-700' },
    component: { bg: 'bg-emerald-600', border: 'border-emerald-700' },
};

const TopNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -top-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor">
        <path d="M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z" />
    </svg>
);
const BottomNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -bottom-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor">
        <path d="M0 0h2l1 1 1 2 2 2h4l2-2 1-2 1-1h2v0H0z" />
    </svg>
);

const ReadOnlyBlock = ({ block }: { block: any }) => {
    const styles = CATEGORY_STYLES[block.category as BlockCategory] || CATEGORY_STYLES.content;
    let Icon = Box;
    if (block.type === 'heading' || block.type === 'text') Icon = Type;
    if (block.type === 'image') Icon = ImageIcon;
    if (block.type === 'button') Icon = MousePointerClick;
    if (block.type === 'section' || block.type === 'container') Icon = Layout;

    return (
        <div className="relative mb-0.5 select-none transform scale-90 origin-left">
            <div className={`
                relative flex items-center h-[36px] px-3 py-1
                ${styles.bg} text-white
                rounded-r-sm shadow-sm
                border-t border-b border-r border-white/10
                ${block.isWrapper ? 'rounded-tl-sm' : 'rounded-l-sm'}
            `}>
                <TopNotch className="text-black/20" />
                <TopNotch className={styles.bg} />
                {!block.isWrapper && <BottomNotch className="text-black/20 translate-y-[1px]" />}
                {!block.isWrapper && <BottomNotch className={styles.bg} />}

                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-white/90" />
                    <span className="font-bold text-[10px] tracking-wide">{block.type}</span>
                    {block.content && (
                        <div className="bg-black/20 rounded px-1.5 py-0.5 shadow-inner border border-black/10">
                            <span className="text-[10px] font-mono text-white/90 block max-w-[120px] truncate">
                                {block.content}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {block.isWrapper && (
                <div className="ml-3 pl-3 border-l-[12px] border-l-inherit min-h-[10px] flex flex-col justify-end relative opacity-80" style={{ borderColor: 'inherit' }}>
                    <div className={`absolute inset-y-0 left-0 w-3 ${styles.bg} opacity-50`}></div>
                    <div className={`
                        relative h-4 w-16 ${styles.bg} rounded-b-sm rounded-tr-sm
                        flex items-center px-2 mt-0.5
                    `}>
                        <TopNotch className={styles.bg} />
                        <BottomNotch className={styles.bg} />
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Type Definitions ---
interface PostData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'text' | 'block';
    code?: string;
    codeSnippet?: string;
    blocks?: any[];
    likes: number;
    comments: number;
    createdAt: Timestamp;
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    // IDから投稿データを取得
    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!params.id) return;
                const docRef = doc(db, "posts", params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as PostData);
                } else {
                    console.log("No such document!");
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [params.id]);

    // プレビュー生成
    useEffect(() => {
        if (post) {
            const displayCode = post.type === 'text' ? post.code : post.codeSnippet;
            if (displayCode) {
                const blob = new Blob([displayCode], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
                return () => URL.revokeObjectURL(url);
            }
        }
    }, [post]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <p className="text-gray-500">The post you are looking for does not exist.</p>
                <a href="/" className="text-blue-400 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </a>
            </div>
        );
    }

    const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Unknown date';

    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            {/* Sidebar */}
            <Sidebar />

            <main className="flex-1 md:ml-64 bg-[#0a0a0a] min-h-screen flex flex-col">
                
                {/* Header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <a href="/" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </a>
                        <span className="font-bold text-sm text-gray-400">Back to Feed</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className='w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px]'>
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={post.userAvatar} alt={post.userName} className='w-full h-full rounded-full bg-black object-cover' 
                                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Left: Code/Logic View */}
                    <div className="w-full lg:w-1/2 bg-[#0d0d0d] border-b lg:border-b-0 lg:border-r border-white/5 relative flex flex-col min-h-[50vh] lg:min-h-auto">
                        <div className="absolute top-4 left-6 z-10 flex items-center gap-3">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20"></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                {post.type === 'text' ? <Code2 className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                                {post.type === 'text' ? 'Source Code' : 'Logic Blocks'}
                            </span>
                        </div>

                        <div className="flex-1 overflow-auto p-6 pt-12 custom-scrollbar relative">
                            {post.type === 'block' && (
                                <div className='absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none'></div>
                            )}

                            {post.type === 'text' ? (
                                <pre className='font-mono text-sm text-blue-300 leading-relaxed whitespace-pre-wrap break-all max-w-4xl mx-auto'>
                                    {post.code || 'No code content'}
                                </pre>
                            ) : (
                                <div className="pl-4 max-w-2xl mx-auto">
                                    {post.blocks && post.blocks.length > 0 ? (
                                        post.blocks.map((block: any) => (
                                            <ReadOnlyBlock key={block.id} block={block} />
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm italic">No blocks data available.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Preview & Details */}
                    <div className="w-full lg:w-1/2 bg-[#1a1a1a] flex flex-col relative z-10 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]">
                        
                        {/* Preview Area */}
                        <div className="flex-1 bg-white relative min-h-[40vh]">
                            <div className="absolute top-0 right-0 p-3 z-10">
                                <span className="px-2 py-1 bg-black/10 backdrop-blur-md rounded text-[10px] font-bold text-black/50 border border-black/5">LIVE PREVIEW</span>
                            </div>
                            {previewUrl ? (
                                <iframe 
                                    src={previewUrl}
                                    className="w-full h-full border-none"
                                    title="Post Preview"
                                    sandbox="allow-scripts"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm">Loading Preview...</div>
                            )}
                        </div>

                        {/* Meta Info Area */}
                        <div className="bg-[#0a0a0a] border-t border-white/10 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-lg font-bold text-white mb-1">{post.userName}&apos;s Snippet</h1>
                                    <p className="text-xs text-gray-500">Posted on {date}</p>
                                </div>
                                <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-white/5 hover:bg-[#222] transition-colors group ${isLiked ? 'text-pink-500 border-pink-500/20' : 'text-gray-400'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    <span className="text-xs font-bold">{post.likes + (isLiked ? 1 : 0)}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-white/5 hover:bg-[#222] transition-colors text-gray-400 hover:text-blue-400 group">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-xs font-bold">{post.comments}</span>
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] border border-white/5 hover:bg-[#222] transition-colors text-gray-400 hover:text-green-400 ml-auto">
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-xs font-bold">Share</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}