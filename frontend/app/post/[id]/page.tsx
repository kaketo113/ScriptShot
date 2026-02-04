'use client';

import React, { useState, useEffect } from 'react';
import { 
    Heart, MessageCircle, MoreHorizontal, Code2, Share2, ArrowLeft, Layers, Layout, Type, Image as ImageIcon, MousePointerClick, Box, Loader2
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
            <div className={`relative flex items-center h-[36px] px-3 py-1 ${styles.bg} text-white rounded-r-sm shadow-sm border-t border-b border-r border-white/10 ${block.isWrapper ? 'rounded-tl-sm' : 'rounded-l-sm'}`}>
                <TopNotch className="text-black/20" />
                <TopNotch className={styles.bg} />
                {!block.isWrapper && <BottomNotch className="text-black/20 translate-y-[1px]" />}
                {!block.isWrapper && <BottomNotch className={styles.bg} />}

                <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span className="font-bold text-[10px] tracking-wide">{block.type}</span>
                    {block.content && (
                        <div className="bg-black/20 rounded px-1.5 py-0.5">
                            <span className="text-[10px] font-mono truncate block max-w-[120px]">
                                {block.content}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Types ---
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

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

    const { id } = React.use(params); // ✅ Promise unwrap

    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    // Fetch post
    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (!id) return;

                const docRef = doc(db, "posts", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setPost({ id: docSnap.id, ...docSnap.data() } as PostData);
                } else {
                    setPost(null);
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    // Preview generator
    useEffect(() => {
        if (!post) return;

        const displayCode = post.type === 'text' ? post.code : post.codeSnippet;

        if (!displayCode) return;

        const blob = new Blob([displayCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [post]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <a href="/" className="text-blue-400 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                </a>
            </div>
        );
    }

    const date = post.createdAt?.toDate
        ? post.createdAt.toDate().toLocaleString()
        : 'Unknown date';

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />

            <main className="flex-1 md:ml-64 bg-[#0a0a0a] flex flex-col">

                <header className="h-16 border-b border-white/10 flex items-center px-6 sticky top-0 bg-[#0a0a0a] z-50">
                    <a href="/" className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5" />
                    </a>
                    <span className="ml-3 text-sm text-gray-400 font-bold">Back to Feed</span>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* Left */}
                    <div className="w-full lg:w-1/2 bg-[#0d0d0d] border-r border-white/5 p-6 overflow-auto">
                        {post.type === 'text' ? (
                            <pre className="font-mono text-sm text-blue-300 whitespace-pre-wrap">
                                {post.code}
                            </pre>
                        ) : (
                            post.blocks?.map((block) => (
                                <ReadOnlyBlock key={block.id} block={block} />
                            ))
                        )}
                    </div>

                    {/* Right */}
                    <div className="w-full lg:w-1/2 bg-[#1a1a1a] flex flex-col">

                        <div className="flex-1 bg-white">
                            {previewUrl ? (
                                <iframe src={previewUrl} className="w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Loading preview...
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-white/10 bg-[#0a0a0a]">
                            <h1 className="text-lg font-bold mb-1">{post.userName}&apos;s Snippet</h1>
                            <p className="text-xs text-gray-500 mb-4">Posted on {date}</p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsLiked(!isLiked)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] ${
                                        isLiked ? 'text-pink-500' : 'text-gray-400'
                                    }`}
                                >
                                    <Heart className={isLiked ? 'fill-current' : ''} />
                                    {post.likes + (isLiked ? 1 : 0)}
                                </button>

                                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] text-gray-400">
                                    <MessageCircle />
                                    {post.comments}
                                </button>

                                <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#161616] text-gray-400">
                                    <Share2 />
                                    Share
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
