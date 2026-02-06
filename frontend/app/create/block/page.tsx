'use client';

import React, { useState, useRef } from 'react';
import { 
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay 
} from '@dnd-kit/core';
import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Plus, Type, Image as ImageIcon, MousePointerClick, Layout, Box, 
    GripVertical, Trash2, ArrowLeft, Save, Loader2, Code2 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toJpeg } from 'html-to-image';

// Block Definitions
type BlockType = 'heading' | 'text' | 'image' | 'button' | 'container';

interface Block {
    id: string;
    type: BlockType;
    content: string;     // ボタンの文字
    linkUrl?: string;    // ボタンの飛び先（オプショナル）
}

// ブロックの初期データ
const INITIAL_BLOCKS: Block[] = [
    { id: '1', type: 'heading', content: 'ここに見出しを入力' },
    { id: '2', type: 'text', content: 'ここにテキストを入力' },
    { id: '3', type: 'button', content: 'ボタン' },
];

// SortableBlock コンポーネント内の修正案
const SortableBlock = ({ block, onDelete, onChange }: { block: Block, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    // ブロックタイプに応じたプレースホルダーとラベルを定義
    const getPlaceholder = () => {
        switch (block.type) {
            case 'heading': return '見出しを入力 (例: Hello World)';
            case 'text': return '本文を入力';
            case 'button': return 'ボタンの文字 (例: Click Me)';
            case 'image': return '画像のURL (https://...)';
            default: return '内容を入力';
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex items-center gap-2 mb-3">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-600 hover:text-white transition-colors">
                <GripVertical size={20} />
            </div>
            
            <div className="flex-1 bg-[#222] border border-white/10 rounded-lg p-3 flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded text-gray-400">
                    {/* アイコン表示部分はそのまま... */}
                    {block.type === 'heading' && <Type size={16} />}
                    {block.type === 'text' && <Box size={16} />}
                    {block.type === 'image' && <ImageIcon size={16} />}
                    {block.type === 'button' && <MousePointerClick size={16} />}
                    {block.type === 'container' && <Layout size={16} />}
                </div>
                
                {/* テキストの場合は複数行入力できるようにする */}
                {block.type === 'text' ? (
                    <textarea 
                        value={block.content}
                        onChange={(e) => onChange(block.id, e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm font-mono resize-none h-auto min-h-[24px] overflow-hidden"
                        placeholder={getPlaceholder()}
                        rows={1}
                        // 入力に合わせて高さを自動調整する
                        onInput={(e) => {
                            e.currentTarget.style.height = 'auto';
                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                        }}
                    />
                ) : (
                    <input 
                        type="text" 
                        value={block.content}
                        onChange={(e) => onChange(block.id, e.target.value)}
                        className="flex-1 bg-transparent border-none focus:outline-none text-white text-sm font-mono"
                        placeholder={getPlaceholder()}
                    />
                )}
            </div>

            <button onClick={() => onDelete(block.id)} className="text-gray-600 hover:text-red-500 transition-colors p-2">
                <Trash2 size={18} />
            </button>
        </div>
    );
};

// Preview Render Component
const BlockRenderer = ({ block }: { block: Block }) => {
    switch (block.type) {
        case 'heading':
            return <h2 className="text-2xl font-bold mb-4 text-gray-800">{block.content}</h2>;
        case 'text':
            return <p className="text-gray-600 mb-4 leading-relaxed">{block.content}</p>;
        case 'button':
            return (
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 transition-colors mb-4">
                    {block.content}
                </button>
            );
        case 'image':
            return (
                <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden">
                    {block.content.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={block.content} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center gap-2">
                            <ImageIcon size={24} />
                            <span className="text-xs">Image URL Preview</span>
                        </div>
                    )}
                </div>
            );
        default:
            return <div className="p-4 border border-gray-200 rounded mb-4 text-gray-500">Unknown Block</div>;
    }
};


export default function CreateBlockPage() {
    const { user } = useAuth();
    const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
    const [isSaving, setIsSaving] = useState(false);
    
    // 撮影用Ref
    const captureRef = useRef<HTMLDivElement>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Actions
    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'heading' ? 'New Heading' : type === 'button' ? 'Click Me' : ''
        };
        setBlocks([...blocks, newBlock]);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlock = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // サムネイル生成関数
    const generateThumbnail = async () => {
        if (!captureRef.current) return null;
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // レンダリング待ち
            
            const dataUrl = await toJpeg(captureRef.current, {
                quality: 0.8,
                width: 800,
                height: 600,
                cacheBust: true,
                backgroundColor: '#ffffff',
                style: { background: 'white' }
            });
            return dataUrl;
        } catch (err) {
            console.error('Thumbnail generation failed:', err);
            return null;
        }
    };

    const handlePost = async () => {
        if (blocks.length === 0) return;
        setIsSaving(true);
        try {
            // 画像生成
            const thumbnailBase64 = await generateThumbnail();

            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'block',
                blocks: blocks, // ブロックデータを保存
                codeSnippet: generateHTMLPreview(blocks), // プレビュー用の簡易HTML
                thumbnail: thumbnailBase64 || null, // 生成した画像を保存
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });

            alert("ブロック投稿しました！");
            window.location.href = '/';
        } catch (error) {
            console.error("Post Error: ", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    // プレビュー用HTML生成ヘルパー
    const generateHTMLPreview = (blocks: Block[]) => {
        return blocks.map(b => {
            if(b.type === 'heading') return `<h2>${b.content}</h2>`;
            if(b.type === 'text') return `<p>${b.content}</p>`;
            if(b.type === 'button') return `<button>${b.content}</button>`;
            return '';
        }).join('');
    };

    return (
        <div className='h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden relative'>
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'><ArrowLeft className='w-5 h-5' /></a>
                    <h2 className='font-bold text-lg tracking-tight'>Create New Post</h2>
                </div>
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                        <a href='/create' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Code2 className='w-4 h-4' /><span>Text</span></a>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-emerald-600 text-white shadow-lg font-medium'><Box className='w-4 h-4' /><span>Block</span></button>
                    </div>
                </div>
                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>{user ? 'Autosaved' : 'Guest Mode'}</div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                {/* Left: Block Editor */}
                <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#111]'>
                    <div className="p-4 border-b border-white/10 flex gap-2 overflow-x-auto">
                        <button onClick={() => addBlock('heading')} className="flex items-center gap-2 px-3 py-2 bg-[#222] hover:bg-[#333] rounded border border-white/10 text-xs transition-colors"><Type size={14}/> Heading</button>
                        <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-3 py-2 bg-[#222] hover:bg-[#333] rounded border border-white/10 text-xs transition-colors"><Box size={14}/> Text</button>
                        <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-3 py-2 bg-[#222] hover:bg-[#333] rounded border border-white/10 text-xs transition-colors"><ImageIcon size={14}/> Image</button>
                        <button onClick={() => addBlock('button')} className="flex items-center gap-2 px-3 py-2 bg-[#222] hover:bg-[#333] rounded border border-white/10 text-xs transition-colors"><MousePointerClick size={14}/> Button</button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {blocks.map((block) => (
                                    <SortableBlock key={block.id} block={block} onDelete={removeBlock} onChange={updateBlock} />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Right: Live Preview */}
                <div className='w-1/2 bg-[#050505] flex flex-col'>
                    <div className='flex-1 flex items-center justify-center relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] p-8 overflow-hidden'>
                        <div className="w-full h-full max-h-[600px] bg-white rounded-lg shadow-2xl overflow-y-auto p-8 relative">
                             {/* 実際のプレビュー表示 */}
                            {blocks.map(block => (
                                <BlockRenderer key={block.id} block={block} />
                            ))}
                        </div>
                    </div>

                    <div className='h-20 border-t border-white/10 flex items-center justify-end px-8 bg-[#111] shrink-0'>
                        <button 
                            onClick={handlePost} 
                            disabled={isSaving} 
                            className='flex items-center gap-2 px-8 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-md hover:bg-emerald-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 active:scale-95 transform duration-100'
                        >
                            {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                            <span>{isSaving ? 'Posting...' : 'Block Post'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 撮影用の隠しスタジオ (Block Mode) */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden' }}>
                <div 
                    ref={captureRef}
                    style={{
                        width: '800px',
                        height: '600px',
                        background: '#ffffff',
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        position: 'relative'
                    }}
                >
                    {/* 撮影用にブロックを展開 */}
                    {blocks.map(block => (
                        <div key={block.id} style={{ width: '100%' }}>
                             <BlockRenderer block={block} />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}