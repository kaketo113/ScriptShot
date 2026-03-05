'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Heart, MessageCircle, Code2, Share2, ArrowLeft, Layers, 
    Layout, Type, Image as ImageIcon, MousePointerClick, Box, Loader2,
    Play, Copy, Check, AlignLeft, Minus, FileInput, CreditCard, Youtube,
    ChevronLeft, ChevronRight, Send
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, writeBatch, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// 1. 型定義 & 設定
interface PostData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'text' | 'block';
    code?: string;
    blocks?: any[];
    caption?: string;
    likes: number;
    comments: number;
    createdAt: Timestamp;
}

interface CommentData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: Timestamp;
}

const BLOCK_CONFIG: Record<string, any> = {
    heading: { label: '見出し', icon: Type, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
    text: { label: '本文', icon: Box, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
    image: { label: '画像', icon: ImageIcon, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
    button: { label: 'ボタン', icon: MousePointerClick, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
    card: { label: 'カード', icon: CreditCard, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    youtube: { label: '動画', icon: Youtube, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
    input: { label: '入力欄', icon: FileInput, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' },
    divider: { label: '区切り線', icon: Minus, bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' },
    default: { label: '不明', icon: Layout, bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' }
};

// 2. カスタムフック
const useTypewriter = (text: string | undefined, isActive: boolean) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!text) return;
        if (!isActive) {
            setDisplayedText(text);
            setIsTyping(false);
            return;
        }
        
        setIsTyping(true);
        setDisplayedText(''); 
        let currentIndex = 0;
        const totalLength = text.length;
        const charsPerTick = totalLength > 1000 ? 5 : totalLength > 500 ? 3 : totalLength > 100 ? 2 : 1;

        const intervalId = setInterval(() => {
            if (currentIndex >= totalLength) {
                clearInterval(intervalId);
                setIsTyping(false);
                setDisplayedText(text); 
                return;
            }
            const nextIndex = Math.min(currentIndex + charsPerTick, totalLength);
            setDisplayedText(text.slice(0, nextIndex));
            currentIndex = nextIndex;
        }, 5);
        return () => clearInterval(intervalId);
    }, [text, isActive]);

    return { displayedText, isTyping };
};

const useFetchPosts = () => {
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const snapshot = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
                setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostData)));
            } catch (error) {
                console.error("Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return { posts, loading };
};

// 3. UIコンポーネント
const DetailBlock = ({ block }: { block: any }) => {
    const config = BLOCK_CONFIG[block.type] || BLOCK_CONFIG.default;
    const Icon = config.icon;
    let displayContent = block.content;

    if (block.type === 'card') {
        try { displayContent = JSON.parse(block.content).title || 'カードブロック'; } 
        catch { displayContent = 'カードブロック'; }
    }

    return (
        <div className={`relative flex items-center h-[42px] px-4 py-2 mb-2 ${config.bg} ${config.text} rounded-md border ${config.border} shadow-sm`}>
            <div className="flex items-center gap-3">
                <Icon size={16} className="opacity-80" />
                <span className="font-bold text-xs tracking-wider uppercase opacity-90">{config.label}</span>
            </div>
            {displayContent && block.type !== 'divider' && (
                <div className="ml-auto bg-white/60 rounded px-2 py-1 border border-black/5 max-w-[150px]">
                    <span className="text-xs font-mono opacity-80 truncate block">{displayContent}</span>
                </div>
            )}
        </div>
    );
};

const BlockRenderer = ({ block }: { block: any }) => {
    switch (block.type) {
        case 'heading': return <h2 className="text-2xl font-bold mb-4 text-gray-900 pb-2 border-b-2 border-blue-500 inline-block">{block.content}</h2>;
        case 'text': return <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        case 'button': return <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all mb-4">{block.content || 'ボタン'}</button>;
        case 'image': return block.content ? <img src={block.content} alt="Preview" className="w-full mb-4 rounded-xl shadow-sm h-auto object-cover" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f3f4f6/a1a1aa?text=Image+Error"; }} /> : null;
        case 'divider': return <hr className="my-6 border-t-2 border-dashed border-gray-300" />;
        case 'input': return <input type="text" placeholder={block.content} disabled className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 mb-4" />;
        case 'youtube': { 
            const match = block.content.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
            const vId = (match && match[2].length === 11) ? match[2] : null;
            return vId ? <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-lg"><iframe src={`https://www.youtube.com/embed/${vId}`} className="w-full h-full allowFullScreen" /></div> : null; 
        }
        case 'card': {
            let d = { title: '', desc: '', btn: '', img: '' }; 
            try { d = JSON.parse(block.content); } catch {}
            return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
                    {d.img && <img src={d.img} alt={d.title} className="w-full h-40 object-cover" crossOrigin="anonymous" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400/f3f4f6/a1a1aa?text=Image+Error"; }} />}
                    <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{d.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{d.desc}</p>
                        {d.btn && <button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">{d.btn}</button>}
                    </div>
                </div>
            );
        }
        default: return null;
    }
};

const CommentSection = ({ post }: { post: PostData }) => {
    const { user } = useAuth();
    const [comments, setComments] = useState<CommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentData)));
        });
        return () => unsubscribe();
    }, [post.id]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) { alert('コメントするにはログインが必要です'); return; }
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const batch = writeBatch(db);
            const commentRef = doc(collection(db, 'posts', post.id, 'comments'));
            batch.set(commentRef, {
                userId: user.uid,
                userName: user.displayName || 'Guest User',
                userAvatar: user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
                content: newComment.trim(),
                createdAt: new Date()
            });

            const postRef = doc(db, 'posts', post.id);
            batch.update(postRef, { comments: increment(1) });

            await batch.commit();
            setNewComment('');
        } catch (error) {
            console.error("コメント追加エラー:", error);
            alert('コメントの送信に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
                
                {/* 作品の説明 */}
                {post.caption && (
                    <div className="flex gap-3 mb-4">
                        <img src={post.userAvatar} alt="" className="w-8 h-8 rounded-full border border-blue-200 shadow-sm mt-1 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                        <div className="flex-1">
                            <div className="flex items-baseline justify-between mb-1">
                                <span className="text-xs font-bold text-gray-900">
                                    {post.userName}
                                    <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold tracking-wider">作者</span>
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja }) : 'たった今'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.caption}</p>
                        </div>
                    </div>
                )}

                {post.caption && <hr className="border-t border-gray-100 mb-6" />}

                {/* コメント入力エリア */}
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 shrink-0">
                    <MessageCircle size={18} className="text-blue-500" />
                    コメント ({comments.length})
                </h3>

                <form onSubmit={handleAddComment} className="mb-6 flex gap-3 shrink-0">
                    <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'} alt="" className="w-8 h-8 rounded-full border border-gray-200 shrink-0" />
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={user ? "素敵なコードですね！..." : "ログインしてコメントを追加..."}
                            disabled={!user || isSubmitting}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors disabled:opacity-50"
                        />
                        <button type="submit" disabled={!newComment.trim() || !user || isSubmitting} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </div>
                </form>

                {/* 投稿されたコメント一覧 */}
                <div className="space-y-4 pb-2">
                    {comments.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-2">一番乗りでコメントしてみましょう！</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.userAvatar} alt="" className="w-8 h-8 rounded-full border border-gray-100 shadow-sm mt-1 shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                                <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-3 border border-gray-100">
                                    <div className="flex items-baseline justify-between mb-1">
                                        <span className="text-xs font-bold text-gray-900">{comment.userName}</span>
                                        <span className="text-[10px] text-gray-400">
                                            {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true, locale: ja }) : 'たった今'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

// 4. メインビューコンポーネント
const PostView = ({ post }: { post: PostData }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    
    const { user } = useAuth();
    const { displayedText, isTyping } = useTypewriter(post?.code, post.type === 'text');
    const codeEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user?.uid || !post.id) return;
        const unsub = onSnapshot(doc(db, 'posts', post.id, 'likes', user.uid), (docSnap) => {
            setIsLiked(docSnap.exists());
        });
        return () => unsub();
    }, [user?.uid, post.id]);

    const handleLike = async () => {
        if (!user) { alert('ログインが必要です'); return; }
        const postRef = doc(db, 'posts', post.id);
        const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
        const userLikedRef = doc(db, 'users', user.uid, 'likedPosts', post.id);
        const batch = writeBatch(db);

        if (isLiked) {
            batch.delete(likeRef);
            batch.delete(userLikedRef);
            batch.update(postRef, { likes: (post.likes || 0) > 0 ? increment(-1) : 0 });
        } else {
            const now = new Date();
            batch.set(likeRef, { createdAt: now });
            batch.set(userLikedRef, { createdAt: now, postId: post.id });
            batch.update(postRef, { likes: increment(1) });
        }
        await batch.commit();
    };

    useEffect(() => {
        if (!post || post.type !== 'text' || !post.code) return;
        const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:2rem;font-family:sans-serif;background-color:#ffffff;display:flex;flex-direction:column;align-items:center;gap:1rem}h2{color:#333}p{color:#666;line-height:1.6}button{background:#2563eb;color:white;border:none;padding:0.5rem 1rem;border-radius:0.25rem;cursor:pointer}img{max-width:100%;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}</style></head><body>${post.code}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [post]);

    useEffect(() => {
        if (isTyping && codeEndRef.current) {
            codeEndRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }, [displayedText, isTyping]);

    const highlightedCode = useMemo(() => {
        if (!post?.code) return '';
        return Prism.highlight(isTyping ? displayedText : post.code, Prism.languages.markup, 'markup');
    }, [post?.code, displayedText, isTyping]);

    const handleCopy = () => {
        if (!post?.code) return;
        navigator.clipboard.writeText(post.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'たった今';

    return (
        <div className="h-auto lg:h-full w-full flex flex-col lg:flex-row relative">
            
            {/* 左側：コード/ブロックエリア */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col border-r border-gray-200 relative z-10 h-[50vh] lg:h-full shrink-0">
                <div className="h-10 bg-gray-50 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        {post.type === 'text' ? <Code2 size={14} className="text-blue-600" /> : <Layers size={14} className="text-emerald-600" />}
                        <span className="tracking-wider font-bold">{post.type === 'text' ? 'ソースコード' : 'ブロック構成'}</span>
                    </div>
                    {post.type === 'text' && (
                        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900 border border-transparent hover:border-gray-200">
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                            <span>{copied ? 'コピー完了' : 'コピー'}</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar p-0 bg-white">
                    {post.type === 'text' ? (
                        <div className="relative min-h-full bg-[#1e1e1e]">
                            <pre className="m-0 p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap break-all" style={{ fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace' }}>
                                <code dangerouslySetInnerHTML={{ __html: highlightedCode || '' }} />
                                {isTyping && <span className="inline-block w-2.5 h-5 bg-blue-500 align-middle ml-0.5 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                <div ref={codeEndRef} />
                            </pre>
                        </div>
                    ) : (
                        <div className="p-6 space-y-2 bg-white min-h-full overflow-hidden">
                            {post.blocks?.map((block, i) => <DetailBlock key={i} block={block} />)}
                        </div>
                    )}
                </div>
            </div>

            {/* 右側：プレビュー & コメントエリア */}
            <div className="w-full lg:w-1/2 bg-[#F9FAFB] flex flex-col relative overflow-hidden h-auto lg:h-full shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-100 pointer-events-none" />

                <div className="h-10 bg-white flex items-center justify-between px-4 border-b border-gray-200 relative z-10 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <Play size={14} className="text-green-600" />
                        <span className="tracking-wider font-bold">プレビュー</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <img src={post.userAvatar} alt={post.userName} className="w-6 h-6 rounded-full border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                        <span className="text-xs font-bold text-gray-800">{post.userName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{date}</span>
                    </div>
                </div>

                <div className="flex-1 relative p-4 lg:p-8 flex flex-col z-10 items-center overflow-y-auto custom-scrollbar min-h-[55vh] lg:min-h-0">
                    {post.type === 'text' ? (
                        previewUrl ? (
                            <div className="w-full aspect-video bg-white rounded-lg shadow-xl overflow-hidden ring-1 ring-gray-200 relative shrink-0">
                                <iframe src={previewUrl} className="w-full h-full border-none" sandbox="allow-scripts allow-modals" />
                            </div>
                        ) : <div className="flex items-center justify-center h-64 text-gray-400">読み込み中...</div>
                    ) : (
                        <div className="w-full h-full max-w-[480px] max-h-[700px] bg-white rounded-3xl shadow-xl overflow-y-auto relative ring-4 ring-gray-200 border border-gray-100 shrink-0">
                            <div className="sticky top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-100 flex items-center justify-center z-10">
                                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="p-4 lg:p-8 min-h-full">
                                {post.blocks?.map((block: any, i: number) => <BlockRenderer key={i} block={block} />)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white border-t border-gray-200 flex flex-col z-20 relative h-[360px] shrink-0">
                    <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-1.5 rounded-full transition-all ${isLiked ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}>
                                <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                                <span className="text-sm font-medium">{post.likes || 0}</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 transition-all pointer-events-none">
                                <MessageCircle size={16} />
                                <span className="text-sm font-medium">{post.comments || 0}</span>
                            </button>
                        </div>
                        <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                            <Share2 size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <CommentSection post={post} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. ページルートコンポーネント
export default function PostDetailPage({ params }: { params: Promise<{ id: string }>; }) {
    const { id: initialId } = React.use(params);
    const { posts, loading } = useFetchPosts();

    const currentIndex = posts.findIndex(p => p.id === initialId);
    const currentPost = posts[currentIndex];
    
    const prevPostId = currentIndex > 0 ? posts[currentIndex - 1].id : null;
    const nextPostId = currentIndex < posts.length - 1 ? posts[currentIndex + 1].id : null;

    if (loading) {
        return (
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!currentPost) {
        return (
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center text-gray-500">
                <p>投稿が見つかりませんでした。</p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 md:ml-64 relative h-full flex flex-col pt-16 md:pt-0">
                <header className="absolute top-16 md:top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 pointer-events-none">
                    <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors pointer-events-auto p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">ホームに戻る</span>
                    </Link>
                </header>

                <div className="flex-1 relative pt-32 md:pt-16 h-full overflow-y-auto lg:overflow-hidden">
                    <PostView post={currentPost} />
                    
                    {prevPostId && (
                        <div className="absolute top-0 left-0 bottom-0 w-24 z-50 flex items-center justify-start pl-6 group pointer-events-none hidden md:flex">
                            <Link href={`/post/${prevPostId}`} className="pointer-events-auto p-4 bg-white border border-gray-200 rounded-full shadow-xl text-gray-500 hover:text-blue-600 transition-all transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100">
                                <ChevronLeft size={28} />
                            </Link>
                        </div>
                    )}

                    {nextPostId && (
                        <div className="absolute top-0 right-0 bottom-0 w-24 z-50 flex items-center justify-end pr-6 group pointer-events-none hidden md:flex">
                            <Link href={`/post/${nextPostId}`} className="pointer-events-auto p-4 bg-white border border-gray-200 rounded-full shadow-xl text-gray-500 hover:text-blue-600 transition-all transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100">
                                <ChevronRight size={28} />
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}