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
    GripVertical, Trash2, Save, Loader2, Code2, Monitor, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toJpeg } from 'html-to-image';
import { useRouter } from 'next/navigation';

// --- Block Definitions & Components ---
type BlockType = 'heading' | 'text' | 'image' | 'button' | 'container';

interface Block {
    id: string;
    type: BlockType;
    content: string;
}

const INITIAL_BLOCKS: Block[] = [
    { id: '1', type: 'heading', content: 'ここに見出しを入力' },
    { id: '2', type: 'text', content: 'ここにテキストを入力' },
    { id: '3', type: 'button', content: 'ボタン' },
];

const SortableBlock = ({ block, onDelete, onChange }: { block: Block, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getPlaceholder = () => {
        switch (block.type) {
            case 'heading': return '見出しを入力 (例: Hello World)';
            case 'text': return '本文を入力';
            case 'button': return 'ボタンの文字 (例: Click Me)';
            case 'image': return '画像のURL (https://...)';
            default: return '内容を入力';
        }
    };

    // ★ブロックごとの色定義（ここを修正！）
    const getBlockStyles = () => {
        switch (block.type) {
            case 'heading': // 青
                return {
                    container: 'bg-blue-900/10 border-blue-500/30 hover:border-blue-500/50',
                    icon: 'bg-blue-500/20 text-blue-400',
                    input: 'text-blue-100 placeholder:text-blue-500/40'
                };
            case 'text': // ★緑 (Emerald) に変更！
                return {
                    container: 'bg-emerald-900/10 border-emerald-500/30 hover:border-emerald-500/50',
                    icon: 'bg-emerald-500/20 text-emerald-400',
                    input: 'text-emerald-100 placeholder:text-emerald-500/40'
                };
            case 'image': // 紫
                return {
                    container: 'bg-purple-900/10 border-purple-500/30 hover:border-purple-500/50',
                    icon: 'bg-purple-500/20 text-purple-400',
                    input: 'text-purple-100 placeholder:text-purple-500/40'
                };
            case 'button': // オレンジ
                return {
                    container: 'bg-orange-900/10 border-orange-500/30 hover:border-orange-500/50',
                    icon: 'bg-orange-500/20 text-orange-400',
                    input: 'text-orange-100 placeholder:text-orange-500/40'
                };
            default: // デフォルト
                return {
                    container: 'bg-[#222] border-white/10',
                    icon: 'bg-white/5 text-gray-400',
                    input: 'text-gray-200'
                };
        }
    };

    const styles = getBlockStyles();

    return (
        <div ref={setNodeRef} style={style} className="group flex items-center gap-2 mb-3">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-600 hover:text-white transition-colors">
                <GripVertical size={20} />
            </div>
            
            {/* ★ここでスタイルを適用 */}
            <div className={`flex-1 border rounded-lg p-3 flex items-center gap-3 transition-colors ${styles.container}`}>
                <div className={`p-2 rounded ${styles.icon}`}>
                    {block.type === 'heading' && <Type size={16} />}
                    {block.type === 'text' && <Box size={16} />}
                    {block.type === 'image' && <ImageIcon size={16} />}
                    {block.type === 'button' && <MousePointerClick size={16} />}
                    {block.type === 'container' && <Layout size={16} />}
                </div>
                
                {block.type === 'text' ? (
                    <textarea 
                        value={block.content}
                        onChange={(e) => onChange(block.id, e.target.value)}
                        className={`flex-1 bg-transparent border-none focus:outline-none text-sm font-mono resize-none h-auto min-h-[24px] overflow-hidden ${styles.input}`}
                        placeholder={getPlaceholder()}
                        rows={1}
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
                        className={`flex-1 bg-transparent border-none focus:outline-none text-sm font-mono ${styles.input}`}
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
                        <img src={block.content} alt="Preview" className="w-full h-full object-cover" crossOrigin="anonymous" />
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
    const { user, markAsPosted } = useAuth();
    const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
    const [isSaving, setIsSaving] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'heading' ? '' : type === 'button' ? 'Click Me' : ''
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

    const generateThumbnail = async () => {
        if (!captureRef.current) return null;
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
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
            const thumbnailBase64 = await generateThumbnail();
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'block',
                blocks: blocks,
                codeSnippet: generateHTMLPreview(blocks),
                thumbnail: thumbnailBase64 || null,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            markAsPosted();
            router.push('/');
        } catch (error) {
            console.error("Post Error: ", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const generateHTMLPreview = (blocks: Block[]) => {
        return blocks.map(b => {
            if(b.type === 'heading') return `<h2>${b.content}</h2>`;
            if(b.type === 'text') return `<p>${b.content}</p>`;
            if(b.type === 'button') return `<button>${b.content}</button>`;
            if(b.type === 'image') return `<img src="${b.content}" alt="Image" />`;
            return '';
        }).join('');
    };

    return (
        <div className='h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden relative'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                     <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <div className='flex items-center gap-2'>
                        <span className='font-bold text-lg tracking-tight'>Create New Post</span>
                    </div>
                </div>

                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                        <a href='/create' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Code2 className='w-4 h-4' /><span>Text</span></a>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-emerald-600 text-white shadow-lg font-medium'><Monitor className='w-4 h-4' /><span>Block</span></button>
                    </div>
                </div>
                
                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>{user ? 'Autosaved' : 'Guest Mode'}</div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                {/* Left: Block Editor */}
                <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#111]'>
                    
                    {/* ★ボタンエリア：Textを緑(Emerald)に変更！ */}
                    <div className="p-3 border-b border-white/10 flex gap-2 overflow-x-auto bg-[#0f0f0f]">
                        {/* Heading: Blue */}
                        <button onClick={() => addBlock('heading')} className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded text-xs font-bold transition-all">
                            <Type size={14}/> Heading
                        </button>
                        
                        {/* Text: ★Green (Emerald) */}
                        <button onClick={() => addBlock('text')} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded text-xs font-bold transition-all">
                            <Box size={14}/> Text
                        </button>
                        
                        {/* Image: Purple */}
                        <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 rounded text-xs font-bold transition-all">
                            <ImageIcon size={14}/> Image
                        </button>
                        
                        {/* Button: Orange */}
                        <button onClick={() => addBlock('button')} className="flex items-center gap-2 px-3 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 rounded text-xs font-bold transition-all">
                            <MousePointerClick size={14}/> Button
                        </button>
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

                {/* Right: Live Preview & Save Button */}
                <div className='w-1/2 flex flex-col bg-[#050505]'>
                    <div className='h-10 border-b border-white/5 flex items-center px-4 justify-between bg-[#161616]'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest'>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Preview
                        </div>
                    </div>

                    <div className='flex-1 flex items-center justify-center relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] p-8 overflow-hidden'>
                        <div className="w-full h-full max-h-[600px] bg-white rounded-lg shadow-2xl overflow-y-auto p-8 relative">
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