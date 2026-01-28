'use client';

import React, { useState } from 'react';
import { 
    Heart, 
    MessageCircle, 
    MoreHorizontal, 
    Code2, 
    Play, 
    Share2,
    Layers,
    Layout,
    Type,
    Image as ImageIcon,
    MousePointerClick,
    Square,
    Box
} from 'lucide-react';
// Sidebarコンポーネントをインポート
import { Sidebar } from '../components/Sidebar';

// Block Definitions & Styles
type BlockCategory = 'layout' | 'content' | 'component';

const CATEGORY_STYLES = {
    layout: { bg: 'bg-blue-600', border: 'border-blue-700' },
    content: { bg: 'bg-slate-600', border: 'border-slate-700' },
    component: { bg: 'bg-emerald-600', border: 'border-emerald-700' },
};

// ブロックの凹凸パーツ
const TopNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -top-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox='0 0 16 5' fill='currentColor'>
        <path d='M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z' />
    </svg>
);
const BottomNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -bottom-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox='0 0 16 5' fill='currentColor'>
        <path d='M0 0h2l1 1 1 2 2 2h4l2-2 1-2 1-1h2v0H0z' />
    </svg>
);

// 読み取り専用ブロックコンポーネント
const ReadOnlyBlock = ({ block }: { block: BlockData }) => {
    const styles = CATEGORY_STYLES[block.category];
    let Icon = Box;
    if (block.type === 'heading' || block.type === 'text') Icon = Type;
    if (block.type === 'image') Icon = ImageIcon;
    if (block.type === 'button') Icon = MousePointerClick;
    if (block.type === 'section' || block.type === 'container') Icon = Layout;

    return (
        <div className='relative mb-0.5 select-none transform scale-90 origin-left'>
            <div className={`
                relative flex items-center h-[36px] px-3 py-1
                ${styles.bg} text-white
                rounded-r-sm shadow-sm
                border-t border-b border-r border-white/10
                ${block.isWrapper ? 'rounded-tl-sm' : 'rounded-l-sm'}
            `}>
                <TopNotch className='text-black/20' />
                <TopNotch className={styles.bg} />
                {!block.isWrapper && <BottomNotch className='text-black/20 translate-y-[1px]' />}
                {!block.isWrapper && <BottomNotch className={styles.bg} />}

                <div className='flex items-center gap-2'>
                    <Icon size={14} className='text-white/90' />
                    <span className='font-bold text-[10px] tracking-wide'>{block.type}</span>
                    {block.content && (
                        <div className='bg-black/20 rounded px-1.5 py-0.5 shadow-inner border border-black/10'>
                            <span className='text-[10px] font-mono text-white/90 block max-w-[120px] truncate'>
                                {block.content}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {block.isWrapper && (
                <div className='ml-3 pl-3 border-l-[12px] border-l-inherit min-h-[10px] flex flex-col justify-end relative opacity-80' style={{ borderColor: 'inherit' }}>
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

// Types
interface BlockData {
    id: string;
    type: string;
    content: string;
    category: BlockCategory;
    isWrapper?: boolean;
}

interface Post {
    id: number;
    user: {
        name: string;
        avatar: string;
        id: string;
    };
    type: 'text' | 'block';
    content: string;
    likes: number;
    comments: number;
    time: string;
    previewImage: string;
    codeSnippet?: string; // Textモード用
    blocks?: BlockData[]; // Blockモード用
}

// Mock Data
const MOCK_POSTS: Post[] = [
    {
        id: 1,
        user: {
            name: 'mizoguchi_dev',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanto', 
            id: 'user_01'
        },
        type: 'text',
        content: 'Tailwind CSSだけで作るグラスモーフィズムのカードデザイン。backdrop-filterが肝です。',
        likes: 120,
        comments: 3,
        time: '2h ago',
        previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
        codeSnippet: `<div class='backdrop-blur-md bg-white/30 border border-white/20 rounded-xl p-6 shadow-lg'>
  <h2 class='text-white font-bold'>Glass UI</h2>
  <p class='text-blue-100'>Modern design style.</p>
</div>`
    },
    {
        id: 2,
        user: {
            name: 'block_master',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
            id: 'user_02'
        },
        type: 'block',
        content: 'ブロックエディタで作成したヒーローセクション。コンテナの中に要素を積み上げるだけでレスポンシブ対応も完璧。',
        likes: 85,
        comments: 12,
        time: '5h ago',
        previewImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2616&auto=format&fit=crop',
        blocks: [
            { id: '1', type: 'section', content: '', category: 'layout', isWrapper: true },
            { id: '2', type: 'container', content: '', category: 'layout', isWrapper: true },
            { id: '3', type: 'heading', content: 'Welcome to Future', category: 'content' },
            { id: '4', type: 'text', content: 'Build with Blocks', category: 'content' },
            { id: '5', type: 'button', content: 'Get Started', category: 'component' },
        ]
    },
];

// Post Card Component
const PostCard = ({ post }: { post: Post }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <article className='bg-[#161616] rounded-3xl overflow-hidden mb-8 shadow-xl border border-white/5 hover:border-white/10 transition-colors'>
            
            {/* 1. Header */}
            <div className='px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#1a1a1a]'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 p-[1px]'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.user.avatar} alt={post.user.name} className='w-full h-full rounded-full bg-black object-cover' />
                    </div>
                    <div>
                        <h3 className='font-bold text-sm text-white hover:text-blue-400 cursor-pointer transition-colors'>
                            {post.user.name}
                        </h3>
                        <div className='flex items-center gap-2'>
                            <span className='text-[10px] text-gray-500'>{post.time}</span>
                            {post.type === 'block' ? (
                                <span className='text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1'>
                                    <Layers className='w-3 h-3' /> Block
                                </span>
                            ) : (
                                <span className='text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1'>
                                    <Code2 className='w-3 h-3' /> Text
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button className='text-gray-500 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors'>
                    <MoreHorizontal className='w-5 h-5' />
                </button>
            </div>

            {/* 2. Body */}
            <div className='flex flex-col md:flex-row h-80 md:h-72 border-b border-white/5'>
                
                {/* Left */}
                <div className='w-full md:w-1/2 bg-[#0d0d0d] border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden group'>
                    <div className='absolute top-3 left-4 text-[10px] font-bold text-gray-600 uppercase tracking-widest flex items-center gap-2 z-10'>
                        {post.type === 'text' ? <Code2 className='w-3 h-3' /> : <Layers className='w-3 h-3' />}
                        {post.type === 'text' ? 'Code' : 'Logic Flow'}
                    </div>
                    
                    <div className='p-6 pt-10 h-full overflow-auto custom-scrollbar relative'>
                        {/* 背景装飾 */}
                        {post.type === 'block' && (
                            <div className='absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none'></div>
                        )}

                        {post.type === 'text' ? (
                            <pre className='font-mono text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-all'>
                                {post.codeSnippet}
                            </pre>
                        ) : (
                            <div className='pl-2'>
                                {post.blocks?.map((block) => (
                                    <ReadOnlyBlock key={block.id} block={block} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right */}
                <div className='w-full md:w-1/2 bg-[#222] relative overflow-hidden group'>
                    <div className='absolute top-3 right-4 text-[10px] font-bold text-white/80 uppercase tracking-widest bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10 z-10'>
                        Preview
                    </div>
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={post.previewImage} 
                        alt='Preview' 
                        className='w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105' 
                    />
                    
                    {/* Play Button */}
                    {/* <div className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                        <div className='w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-lg cursor-pointer hover:bg-white/20 hover:scale-110 transition-all'>
                            <Play className='w-5 h-5 text-white fill-current ml-0.5' />
                        </div>
                    </div> */}
                </div>
            </div>

            {/* 3. Footer */}
            <div className='px-6 py-4 bg-[#161616]'>
                <div className='flex items-center gap-6 mb-3'>
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

                <div className='text-sm text-gray-300 leading-relaxed'>
                    {post.content}
                </div>
            </div>
        </article>
    );
};

export default function HomePage() {
    return (
        <div className='flex min-h-screen bg-black text-white font-sans'>
            <Sidebar />
            <main className='flex-1 md:ml-64 bg-[#0a0a0a] min-h-screen'>
                <div className='h-4 md:h-8'></div>
                <div className='max-w-3xl mx-auto px-4 pb-20'>
                    <div className='md:hidden flex items-center justify-between mb-6 px-2'>
                        <span className='text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>ScriptShot</span>
                    </div>
                    <div className='space-y-6'>
                        {MOCK_POSTS.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                    <div className='text-center py-12 text-gray-600 text-sm'>
                        <div className='w-1 h-8 bg-gradient-to-b from-transparent via-gray-800 to-transparent mx-auto mb-4'></div>
                        <p>You're all caught up!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}