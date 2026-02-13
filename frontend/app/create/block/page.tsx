'use client';

import React, { useState, useRef, useId } from 'react';
import { 
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay 
} from '@dnd-kit/core';
import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Type, Image as ImageIcon, MousePointerClick, Box, 
    GripVertical, Trash2, Save, Loader2, ArrowLeft, AlignLeft,
    PlusCircle, LayoutTemplate, Code2, Monitor, HelpCircle
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toJpeg } from 'html-to-image';
import { useRouter } from 'next/navigation';

// Types
type BlockType = 'heading' | 'text' | 'image' | 'button';

interface Block {
    id: string;
    type: BlockType;
    content: string;
}

const INITIAL_BLOCKS: Block[] = [
    { id: '1', type: 'heading', content: 'ようこそ！' },
    { id: '2', type: 'text', content: 'これはサンプルテキストです。ここをクリックして自由に編集してください。' },
];

// Components

// 1. ブロック追加ボタン
const ToolButton = ({ type, icon: Icon, label, colorClass, onClick }: any) => (
    <button 
        onClick={() => onClick(type)}
        className={`
            flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 group
            ${colorClass} hover:scale-105 active:scale-95 shadow-lg
        `}
    >
        <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
            <Icon size={24} />
        </div>
        <span className="text-xs font-bold tracking-wide">{label}</span>
    </button>
);

// 2. ソート可能なブロックカード
const SortableBlock = ({ block, onDelete, onChange }: { block: Block, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    // ブロックごとの設定（色、ラベル、プレースホルダー）
    const config = {
        heading: { 
            label: '見出し (Heading)', 
            icon: Type, 
            color: 'border-blue-500/50 bg-blue-900/10',
            textClass: 'text-blue-100 placeholder:text-blue-500/50 font-bold text-lg',
            placeholder: 'タイトルを入力...' 
        },
        text: { 
            label: '本文 (Text)', 
            icon: Box, 
            color: 'border-emerald-500/50 bg-emerald-900/10',
            textClass: 'text-emerald-100 placeholder:text-emerald-500/50 text-sm leading-relaxed',
            placeholder: 'ここに文章を入力...' 
        },
        image: { 
            label: '画像 (Image URL)', 
            icon: ImageIcon, 
            color: 'border-purple-500/50 bg-purple-900/10',
            textClass: 'text-purple-100 placeholder:text-purple-500/50 font-mono text-xs',
            placeholder: 'https://example.com/image.jpg' 
        },
        button: { 
            label: 'ボタン (Button)', 
            icon: MousePointerClick, 
            color: 'border-orange-500/50 bg-orange-900/10',
            textClass: 'text-orange-100 placeholder:text-orange-500/50 font-bold text-center',
            placeholder: 'ボタンの文字' 
        },
    }[block.type];

    const Icon = config.icon;

    return (
        <div ref={setNodeRef} style={style} className="relative mb-4 pl-8 group">
            {/* 連結線 */}
            <div className="absolute left-[19px] -top-6 bottom-0 w-0.5 bg-white/10 group-last:bottom-auto group-last:h-1/2 -z-10"></div>
            
            {/* ドラッグハンドル */}
            <div {...attributes} {...listeners} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/5 rounded-full transition-colors z-10 text-gray-500 hover:text-white">
                <GripVertical size={20} />
            </div>

            {/* カード本体 */}
            <div className={`
                relative flex items-stretch gap-0 rounded-xl border overflow-hidden transition-all
                ${config.color} hover:border-opacity-100 border-opacity-40
            `}>
                {/* アイコンエリア */}
                <div className="w-12 flex items-center justify-center bg-black/20 border-r border-white/5">
                    <Icon size={18} className="opacity-70" />
                </div>

                {/* 入力エリア */}
                <div className="flex-1 p-3">
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-50 mb-1">{config.label}</div>
                    {block.type === 'text' ? (
                        <textarea 
                            value={block.content}
                            onChange={(e) => onChange(block.id, e.target.value)}
                            className={`w-full bg-transparent border-none focus:outline-none resize-none h-auto min-h-[24px] ${config.textClass}`}
                            placeholder={config.placeholder}
                            rows={2}
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
                            className={`w-full bg-transparent border-none focus:outline-none ${config.textClass}`}
                            placeholder={config.placeholder}
                        />
                    )}
                </div>

                {/* 削除ボタン */}
                <button 
                    onClick={() => onDelete(block.id)} 
                    className="w-12 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-l border-white/5"
                    title="Delete block"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

// 3. プレビューレンダラー
const BlockRenderer = ({ block }: { block: Block }) => {
    switch (block.type) {
        case 'heading':
            return <h2 className="text-3xl font-bold mb-6 text-gray-800 pb-2 border-b-2 border-blue-500 inline-block">{block.content}</h2>;
        case 'text':
            return <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        case 'button':
            return (
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all mb-6">
                    {block.content}
                </button>
            );
        case 'image':
            return (
                <div className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-gray-50">
                    {block.content.startsWith('http') ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={block.content} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                        <div className="h-48 flex flex-col items-center justify-center text-gray-300">
                            <ImageIcon size={48} className="mb-2" />
                            <span className="text-sm">Image Preview</span>
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
};

// Main Page Component
export default function CreateBlockPage() {
    const { user, markAsPosted } = useAuth();
    const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const dndContextId = useId();

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
            return await toJpeg(captureRef.current, {
                quality: 0.8, width: 800, height: 600, backgroundColor: '#ffffff', style: { background: 'white' }
            });
        } catch (err) { return null; }
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
                blocks,
                codeSnippet: 'Generated from Blocks',
                thumbnail: thumbnailBase64 || null,
                caption,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            markAsPosted();
            router.push('/');
        } catch (error) {
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='h-screen w-full bg-[#050505] text-white flex flex-col font-sans overflow-hidden relative'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                     <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <div className='flex items-center gap-2'>
                        <LayoutTemplate size={20} className="text-emerald-500" />
                        <span className='font-bold text-lg tracking-tight'>Block Builder</span>
                    </div>
                </div>

                 {/* モード切り替えボタン */}
                 <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                        <a href='/create' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Code2 className='w-4 h-4' /><span>Text</span></a>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-emerald-600 text-white shadow-lg font-medium'><Monitor className='w-4 h-4' /><span>Block</span></button>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-[#161616] px-3 py-1.5 rounded-full border border-white/5 text-xs text-gray-400">
                    <HelpCircle size={14} className="text-blue-500" />
                    <span>左側でコードを編集すると、右側にリアルタイムで反映されます</span>
                </div>

                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>{user ? 'Autosaved' : 'Guest Mode'}</div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                
                {/* 左側 */}
                <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#0a0a0a] relative z-10'>
                    
                    {/* Toolbox */}
                    <div className="p-6 border-b border-white/5 bg-[#111]">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <PlusCircle size={14} /> Add Block
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            <ToolButton type="heading" icon={Type} label="Heading" colorClass="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:border-blue-500" onClick={addBlock} />
                            <ToolButton type="text" icon={Box} label="Text" colorClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500" onClick={addBlock} />
                            <ToolButton type="image" icon={ImageIcon} label="Image" colorClass="bg-purple-500/10 text-purple-400 border-purple-500/20 hover:border-purple-500" onClick={addBlock} />
                            <ToolButton type="button" icon={MousePointerClick} label="Button" colorClass="bg-orange-500/10 text-orange-400 border-orange-500/20 hover:border-orange-500" onClick={addBlock} />
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0a0a0a]">
                        <div className="max-w-xl mx-auto">
                            {blocks.length === 0 ? (
                                <div className="text-center py-20 opacity-50 border-2 border-dashed border-white/10 rounded-2xl">
                                    <p className="text-gray-400 mb-2">まだブロックがありません</p>
                                    <p className="text-sm text-gray-600">上のボタンを押して追加してください</p>
                                </div>
                            ) : (
                                <DndContext id={dndContextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        {blocks.map((block) => (
                                            <SortableBlock key={block.id} block={block} onDelete={removeBlock} onChange={updateBlock} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                            
                            {/* 終了 */}
                            {blocks.length > 0 && (
                                <div className="flex justify-center mt-4 opacity-30">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右側 */}
                <div className='w-1/2 flex flex-col bg-[#050505]'>
                    <div className='h-10 border-b border-white/5 flex items-center justify-between px-4 bg-[#111]'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest'>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Preview
                        </div>
                        <div className="text-[10px] text-gray-600">Mobile / Desktop</div>
                    </div>

                    <div className='flex-1 flex items-center justify-center relative bg-[#0e0e0e] p-8 overflow-hidden'>
                        <div className="w-full h-full max-w-[480px] max-h-[700px] bg-white rounded-3xl shadow-2xl overflow-y-auto relative ring-8 ring-[#1a1a1a]">
                            <div className="sticky top-0 left-0 right-0 h-8 bg-gray-50 border-b flex items-center justify-center z-10">
                                <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
                            </div>
                            <div className="p-8 min-h-full">
                                {blocks.map(block => (
                                    <BlockRenderer key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 投稿ボタン・キャプション */}
                    <div className='border-t border-white/10 bg-[#111] p-4 flex gap-4 shrink-0 items-end'>
                        <div className="relative flex-1">
                            <div className="absolute top-3 left-3 text-gray-500">
                                <AlignLeft size={16} />
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="作品の説明を入力..."
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none h-12 custom-scrollbar focus:h-24 transition-all"
                            />
                        </div>

                        <button 
                            onClick={handlePost} 
                            disabled={isSaving}
                            className='h-12 px-6 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-900/20 flex items-center gap-2 shrink-0'
                        >
                            {isSaving ? <Loader2 className='animate-spin' /> : <Save size={20} />}
                            <span>Post</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* サムネ用 */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <div ref={captureRef} style={{ width: '800px', height: '600px', background: '#ffffff', padding: '40px' }}>
                    {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>
        </div>
    );
}