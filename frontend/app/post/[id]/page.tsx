'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Heart, MessageCircle, Code2, Share2, ArrowLeft, Layers, 
    Layout, Type, Image as ImageIcon, MousePointerClick, Box, Loader2,
    Play, Copy, Check, AlignLeft,
    Minus, FileInput, CreditCard, Youtube
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // コードハイライトはダークテーマのままが見やすいので維持
import { useRouter } from 'next/navigation';

// --- 型定義 ---
interface PostData {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    type: 'text' | 'block';
    code?: string;
    codeSnippet?: string;
    blocks?: any[];
    caption?: string;
    likes: number;
    comments: number;
    createdAt: Timestamp;
}

// --- ヘルパーコンポーネント & フック ---

const useTypewriter = (text: string | undefined, isActive: boolean) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!text || !isActive) {
            if (!isActive) {
                setDisplayedText(text || '');
                setIsTyping(false);
            }
            return;
        }
        
        setIsTyping(true);
        setDisplayedText(''); 
        let currentIndex = 0;
        const totalLength = text.length;
        let charsPerTick = 1;
        
        if (totalLength > 100) charsPerTick = 2;
        if (totalLength > 500) charsPerTick = 3;
        if (totalLength > 1000) charsPerTick = 5;

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

// ★修正: 白背景で見やすい配色に変更
const getBlockConfig = (type: string) => {
    switch (type) {
        case 'heading': return { label: '見出し', icon: Type, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
        case 'text': return { label: '本文', icon: Box, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
        case 'image': return { label: '画像', icon: ImageIcon, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' };
        case 'button': return { label: 'ボタン', icon: MousePointerClick, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' };
        case 'card': return { label: 'カード', icon: CreditCard, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
        case 'youtube': return { label: '動画', icon: Youtube, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
        case 'input': return { label: '入力欄', icon: FileInput, bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700' };
        case 'divider': return { label: '区切り線', icon: Minus, bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' };
        default: return { label: '不明', icon: Layout, bg: 'bg-gray-100', border: 'border-gray-200', text: 'text-gray-600' };
    }
};

const DetailBlock = ({ block, index }: { block: any, index: number }) => {
    const config = getBlockConfig(block.type);
    const Icon = config.icon;
    let displayContent = block.content;
    
    if (block.type === 'card') {
        try {
            const data = JSON.parse(block.content);
            displayContent = data.title || 'カードブロック';
        } catch { displayContent = 'カードブロック'; }
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

// プレビュー用レンダラー
const BlockRenderer = ({ block }: { block: any }) => {
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    switch (block.type) {
        case 'heading': return <h2 className="text-2xl font-bold mb-4 text-gray-900 pb-2 border-b-2 border-blue-500 inline-block">{block.content}</h2>;
        case 'text': return <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        case 'button': return <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all mb-4">{block.content || 'ボタン'}</button>;
        case 'image': return block.content ? (/* eslint-disable-next-line @next/next/no-img-element */<img src={block.content} alt="プレビュー" className="w-full mb-4 rounded-xl shadow-sm h-auto object-cover" />) : null;
        case 'divider': return <hr className="my-6 border-t-2 border-dashed border-gray-300" />;
        case 'input': return <input type="text" placeholder={block.content} disabled className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 mb-4" />;
        case 'youtube': { const vId = getYouTubeId(block.content); return vId ? (<div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-lg"><iframe src={`https://www.youtube.com/embed/${vId}`} className="w-full h-full" allowFullScreen title="動画" /></div>) : null; }
        case 'card': {
            let d = { title: '', desc: '', btn: '', img: '' }; try { d = JSON.parse(block.content); } catch {}
            return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
                    {d.img && (/* eslint-disable-next-line @next/next/no-img-element */<img src={d.img} alt={d.title} className="w-full h-40 object-cover" />)}
                    <div className="p-5"><h3 className="font-bold text-lg mb-2 text-gray-900">{d.title}</h3><p className="text-gray-600 text-sm mb-4 leading-relaxed">{d.desc}</p>{d.btn && (<button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">{d.btn}</button>)}</div>
                </div>
            );
        }
        default: return null;
    }
};

const PostSlide = ({ post, isActive }: { post: PostData, isActive: boolean }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const { displayedText, isTyping } = useTypewriter(post?.code, isActive);
    const codeEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!post || post.type !== 'text' || !post.code) return;
        const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:2rem;font-family:sans-serif;background-color:#ffffff;display:flex;flex-direction:column;align-items:center;gap:1rem}h2{color:#333}p{color:#666;line-height:1.6}button{background:#2563eb;color:white;border:none;padding:0.5rem 1rem;border-radius:0.25rem;cursor:pointer}img{max-width:100%;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}</style></head><body>${post.code}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [post]);

    useEffect(() => {
        if (isTyping && isActive && codeEndRef.current) {
            codeEndRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }, [displayedText, isTyping, isActive]);

    const highlightedCode = useMemo(() => {
        if (!post?.code) return '';
        const textToHighlight = isTyping ? displayedText : post.code;
        return Prism.highlight(textToHighlight, Prism.languages.markup, 'markup');
    }, [post?.code, displayedText, isTyping]);

    const handleCopy = () => {
        if (!post?.code) return;
        navigator.clipboard.writeText(post.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'たった今';

    return (
        <div className="h-full w-full flex flex-col lg:flex-row pt-16 snap-start overflow-hidden relative">
            {/* 左パネル: ソースコード / ブロック構成 (白背景) */}
            <div className="w-full lg:w-1/2 bg-white flex flex-col border-r border-gray-200 relative z-10">
                <div className="h-10 bg-gray-50 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        {post.type === 'text' ? <Code2 size={14} className="text-blue-600" /> : <Layers size={14} className="text-green-600" />}
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
                    {post.caption && (
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                <AlignLeft size={12} /><span>説明</span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{post.caption}</p>
                        </div>
                    )}

                    {post.type === 'text' ? (
                        <div className="relative min-h-full bg-[#1e1e1e]"> {/* コードエリアだけは黒背景の方が見やすい */}
                            <pre className="m-0 p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap break-all" style={{ fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace' }}>
                                <code dangerouslySetInnerHTML={{ __html: highlightedCode || '' }} />
                                {isTyping && <span className="inline-block w-2.5 h-5 bg-blue-500 align-middle ml-0.5 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />}
                                <div ref={codeEndRef} />
                            </pre>
                        </div>
                    ) : (
                        <div className="p-6 space-y-2 bg-white min-h-full overflow-hidden">
                            {post.blocks?.map((block, i) => (
                                <DetailBlock key={i} block={block} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 右パネル: プレビュー (オフホワイト背景) */}
            <div className="w-full lg:w-1/2 bg-[#F9FAFB] flex flex-col relative overflow-hidden">
                {/* 背景ドットを薄いグレーに */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-100 pointer-events-none" />

                <div className="h-10 bg-white flex items-center justify-between px-4 border-b border-gray-200 relative z-10 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                        <Play size={14} className="text-green-600" />
                        <span className="tracking-wider font-bold">プレビュー</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.userAvatar} alt={post.userName} className="w-6 h-6 rounded-full border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }} />
                        <span className="text-xs font-bold text-gray-800">{post.userName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{date}</span>
                    </div>
                </div>

                <div className="flex-1 relative p-8 flex flex-col z-10 items-center justify-center">
                    {post.type === 'text' ? (
                        previewUrl ? (
                            <div className="flex-1 w-full bg-white rounded-lg shadow-xl overflow-hidden ring-1 ring-gray-200 relative">
                                <iframe src={previewUrl} className="w-full h-full border-none" sandbox="allow-scripts allow-modals" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">読み込み中...</div>
                        )
                    ) : (
                        <div className="w-full h-full max-w-[480px] max-h-[700px] bg-white rounded-3xl shadow-xl overflow-y-auto relative ring-4 ring-gray-200 border border-gray-100">
                            <div className="sticky top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-100 flex items-center justify-center z-10">
                                <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                            </div>
                            <div className="p-8 min-h-full">
                                {post.blocks?.map((block: any, i: number) => (
                                    <BlockRenderer key={i} block={block} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* フッターアクション (白背景) */}
                <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6 z-20 relative shrink-0">
                        <div className="flex items-center gap-4">
                        <button onClick={() => setIsLiked(!isLiked)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isLiked ? 'bg-pink-50 text-pink-600 border border-pink-200' : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}>
                            <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                            <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all">
                            <MessageCircle size={18} />
                            <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                    </div>
                    <button className="p-2 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                        <Share2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PostDetailPage({ params }: { params: Promise<{ id: string }>; }) {
    const { id: initialId } = React.use(params);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activePostId, setActivePostId] = useState(initialId);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostData));
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        if (!loading && posts.length > 0 && containerRef.current) {
            const targetElement = document.getElementById(`post-${initialId}`);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'auto' });
            }
        }
    }, [loading, posts, initialId]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || loading) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const postId = entry.target.id.replace('post-', '');
                    setActivePostId(postId);
                    window.history.replaceState(null, '', `/post/${postId}`);
                }
            });
        }, {
            root: container,
            threshold: 0.6
        });

        const sections = document.querySelectorAll('.post-section');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, [loading, posts]);

    if (loading) {
        return (
            // ローディング画面も白背景に
            <div className="h-screen bg-[#F9FAFB] flex items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        // 全体のコンテナ (白背景)
        <div className="flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 md:ml-64 relative h-full">
                {/* ヘッダー (白 + ぼかし) */}
                <header className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 pointer-events-none">
                    <a href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors pointer-events-auto p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-tight">フィードに戻る</span>
                    </a>
                </header>

                <div 
                    ref={containerRef}
                    className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {posts.map((post) => (
                        <section 
                            key={post.id} 
                            id={`post-${post.id}`} 
                            className="post-section h-full w-full snap-start relative"
                        >
                            <PostSlide post={post} isActive={post.id === activePostId} />
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
}