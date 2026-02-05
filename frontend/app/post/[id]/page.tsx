'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Heart, MessageCircle, Code2, Share2, ArrowLeft, Layers, 
    Layout, Type, Image as ImageIcon, MousePointerClick, Box, Loader2,
    Play, Copy, Check
} from 'lucide-react';
import { Sidebar } from '../../../components/Sidebar';
import { db } from '../../../lib/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// --- Animation Variants ---
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { 
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

// --- Custom Hook: High-Speed Typewriter Effect ---
// 高速化チューニング版
const useTypewriter = (text: string | undefined) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (!text) return;
        
        setIsTyping(true);
        setDisplayedText(''); 
        
        let currentIndex = 0;
        const totalLength = text.length;

        // 文字数が多いほど「1フレームに進む文字数」を微増させるが、
        // あくまで「流れるような文字送り」を維持するバランス設定
        let charsPerTick = 1;
        if (totalLength > 100) charsPerTick = 2;
        if (totalLength > 500) charsPerTick = 3;
        if (totalLength > 1000) charsPerTick = 5;

        // ブラウザの描画限界に近い速度(5ms)で回す
        const intervalId = setInterval(() => {
            if (currentIndex >= totalLength) {
                clearInterval(intervalId);
                setIsTyping(false);
                // 最後に念のため全文をセットしてズレ防止
                setDisplayedText(text); 
                return;
            }

            // 次の文字位置を計算
            const nextIndex = Math.min(currentIndex + charsPerTick, totalLength);
            
            // sliceで切り出してセット（ここが高速描画の肝）
            setDisplayedText(text.slice(0, nextIndex));
            currentIndex = nextIndex;
        }, 5); // 5ミリ秒間隔（ほぼ毎フレーム更新）

        return () => clearInterval(intervalId);
    }, [text]);

    return { displayedText, isTyping };
};

// --- Block Definitions ---
type BlockCategory = 'layout' | 'content' | 'component';
const CATEGORY_STYLES = {
    layout: { bg: 'bg-blue-600', border: 'border-blue-700' },
    content: { bg: 'bg-slate-600', border: 'border-slate-700' },
    component: { bg: 'bg-emerald-600', border: 'border-emerald-700' },
};

const DetailBlock = ({ block, index }: { block: any, index: number }) => {
    const styles = CATEGORY_STYLES[block.category as BlockCategory] || CATEGORY_STYLES.content;
    let Icon = Box;
    if (block.type === 'heading' || block.type === 'text') Icon = Type;
    if (block.type === 'image') Icon = ImageIcon;
    if (block.type === 'button') Icon = MousePointerClick;
    if (block.type === 'section' || block.type === 'container') Icon = Layout;

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
                relative flex items-center h-[42px] px-4 py-2 mb-2
                ${styles.bg} text-white rounded-md shadow-lg border border-white/10
                cursor-default
                ${block.isWrapper ? 'ml-0' : 'ml-6'}
            `}
            whileHover={{ scale: 1.02, x: 5 }}
        >
            <div className="flex items-center gap-3">
                <Icon size={16} className="text-white/90" />
                <span className="font-bold text-xs tracking-wider uppercase opacity-90">{block.type}</span>
            </div>
            {block.content && (
                <div className="ml-auto bg-black/20 rounded px-2 py-1 border border-black/10">
                    <span className="text-xs font-mono text-white/90 truncate max-w-[150px] block">
                        {block.content}
                    </span>
                </div>
            )}
        </motion.div>
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
    const { id } = React.use(params);
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [copied, setCopied] = useState(false);

    // 引数なしで呼び出す（内部で自動最適化）
    const { displayedText, isTyping } = useTypewriter(post?.code);
    
    const codeContainerRef = useRef<HTMLDivElement>(null);
    const codeEndRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!post) return;
        const displayCode = post.type === 'text' ? post.code : post.codeSnippet;
        if (!displayCode) return;
        const blob = new Blob([displayCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [post]);

    // タイピング中は自動スクロール（少し余裕を持たせる）
    useEffect(() => {
        if (isTyping && codeEndRef.current) {
            codeEndRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
        }
    }, [displayedText, isTyping]);

    const highlightedCode = useMemo(() => {
        if (!post?.code) return '';
        const textToHighlight = isTyping ? displayedText : post.code;
        // Prism.jsのハイライト処理
        return Prism.highlight(textToHighlight, Prism.languages.markup, 'markup');
    }, [post?.code, displayedText, isTyping]);

    const handleCopy = () => {
        if (!post?.code) return;
        navigator.clipboard.writeText(post.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-400 font-mono animate-pulse">Loading masterpiece...</p>
                </motion.div>
            </div>
        );
    }

    if (!post) return null;

    const date = post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : 'Just now';

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
            <Sidebar />

            <motion.main 
                className="flex-1 md:ml-64 flex flex-col h-screen relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.header variants={itemVariants} className="absolute top-0 left-0 right-0 h-16 px-6 flex items-center justify-between z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
                    <motion.a 
                        href="/" 
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="p-2 rounded-full group-hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">Back</span>
                    </motion.a>
                    
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={post.userAvatar} 
                            alt={post.userName} 
                            className="w-8 h-8 rounded-full border border-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }}
                        />
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-white leading-none">{post.userName}</div>
                            <div className="text-[10px] text-gray-500 font-mono mt-1">{date}</div>
                        </div>
                    </div>
                </motion.header>

                <div className="flex-1 flex flex-col lg:flex-row pt-16 h-full">

                    {/* Left Panel (Code Editor) */}
                    <motion.div variants={itemVariants} className="w-full lg:w-1/2 bg-[#1e1e1e] flex flex-col border-r border-black/50 relative z-10">
                        <div className="h-10 bg-[#252526] flex items-center justify-between px-4 border-b border-black">
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                                {post.type === 'text' ? <Code2 size={14} className="text-blue-400" /> : <Layers size={14} className="text-green-400" />}
                                <span className="tracking-wider">{post.type === 'text' ? 'SOURCE CODE' : 'BLOCK LOGIC'}</span>
                            </div>
                            {post.type === 'text' && (
                                <motion.button 
                                    onClick={handleCopy}
                                    whileTap={{ scale: 0.9 }}
                                    className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? <motion.span key="check" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Check size={12} className="text-green-400" /></motion.span> : <motion.span key="copy" initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}><Copy size={12} /></motion.span>}
                                    </AnimatePresence>
                                    <span>{copied ? 'Copied' : 'Copy'}</span>
                                </motion.button>
                            )}
                        </div>

                        <div 
                            ref={codeContainerRef}
                            className="flex-1 overflow-auto custom-scrollbar p-0 bg-[#1e1e1e]"
                        >
                            {post.type === 'text' ? (
                                <div className="relative min-h-full">
                                    <pre 
                                        className="m-0 p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap break-all"
                                        style={{ fontFamily: '"JetBrains Mono", Menlo, Consolas, monospace' }}
                                    >
                                        {/* HTMLとしてレンダリング */}
                                        <code dangerouslySetInnerHTML={{ __html: highlightedCode || '' }} />
                                        
                                        {/* カーソル演出 (タイピング中のみ表示) */}
                                        {isTyping && (
                                            <span className="inline-block w-2.5 h-5 bg-blue-500 align-middle ml-0.5 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        )}
                                        <div ref={codeEndRef} />
                                    </pre>
                                </div>
                            ) : (
                                <div className="p-6 space-y-2 bg-[#1e1e1e] min-h-full overflow-hidden">
                                    {post.blocks?.map((block, i) => (
                                        <DetailBlock key={i} block={block} index={i} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Right Panel (Preview) */}
                    <motion.div variants={itemVariants} className="w-full lg:w-1/2 bg-[#0d0d0d] flex flex-col relative overflow-hidden">
                        
                        <motion.div 
                            className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-50"
                            animate={{ 
                                backgroundPosition: ["0px 0px", "-20px -20px"] 
                            }}
                            transition={{ 
                                repeat: Infinity, 
                                duration: 10, 
                                ease: "linear" 
                            }}
                        />

                        <div className="h-10 bg-[#111] flex items-center justify-between px-4 border-b border-white/5 relative z-10">
                            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                                <Play size={14} className="text-green-500" />
                                <span className="tracking-wider">LIVE PREVIEW</span>
                            </div>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                            </div>
                        </div>

                        <div className="flex-1 relative p-8 flex flex-col z-10">
                            {previewUrl ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ 
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 20,
                                        delay: 0.3 
                                    }}
                                    className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10 relative"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <iframe 
                                        src={previewUrl} 
                                        className="w-full h-full border-none"
                                        sandbox="allow-scripts allow-modals"
                                    />
                                </motion.div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-600">
                                    Loading preview...
                                </div>
                            )}
                        </div>

                        <motion.div variants={itemVariants} className="h-16 bg-[#111] border-t border-white/5 flex items-center justify-between px-6 z-20 relative">
                             <div className="flex items-center gap-4">
                                <motion.button
                                    onClick={() => setIsLiked(!isLiked)}
                                    whileTap={{ scale: 0.85 }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                        isLiked 
                                        ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' 
                                        : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <motion.div animate={isLiked ? { scale: [1, 1.5, 1] } : {}}>
                                        <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                                    </motion.div>
                                    <span className="text-sm font-medium">{post.likes + (isLiked ? 1 : 0)}</span>
                                </motion.button>

                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    <MessageCircle size={18} />
                                    <span className="text-sm font-medium">{post.comments}</span>
                                </motion.button>
                            </div>

                            <motion.button whileTap={{ scale: 0.9, rotate: 10 }} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                <Share2 size={20} />
                            </motion.button>
                        </motion.div>
                    </motion.div>

                </div>
            </motion.main>
        </div>
    );
}