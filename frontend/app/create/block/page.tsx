'use client';

import React, { useState, useRef, useId, useEffect } from 'react';
import { 
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors 
} from '@dnd-kit/core';
import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Type, Image as ImageIcon, MousePointerClick, Box, 
    GripVertical, Trash2, Save, Loader2, ArrowLeft, AlignLeft,
    PlusCircle, LayoutTemplate, Code2, Monitor,
    Minus, FileInput, CreditCard, Youtube, 
    ChevronLeft, ChevronRight, AlertTriangle, Maximize, Smartphone
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toJpeg } from 'html-to-image';
import { useRouter } from 'next/navigation';
import { storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Types
type BlockType = 'heading' | 'text' | 'image' | 'button' | 'divider' | 'input' | 'card' | 'youtube';

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
            flex-shrink-0 w-24 flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 group snap-start relative
            ${colorClass} hover:scale-105 hover:z-50 active:scale-95 shadow-sm hover:shadow-md
        `}
    >
        <div className="p-2 rounded-full bg-white/80 group-hover:bg-white transition-colors border border-black/5 shadow-sm">
            <Icon size={20} />
        </div>
        <span className="text-xs font-bold tracking-wide truncate w-full text-center">{label}</span>
    </button>
);

// 2. ソート可能なブロックカード
const SortableBlock = ({ block, onDelete, onChange }: { block: Block, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    const parseCardData = (json: string) => {
        try { return JSON.parse(json); } 
        catch { return { title: '', desc: '', btn: '', img: '' }; }
    };
    
    const updateCardData = (key: string, val: string) => {
        const current = parseCardData(block.content);
        const updated = { ...current, [key]: val };
        onChange(block.id, JSON.stringify(updated));
    };

    const getConfig = () => {
        switch (block.type) {
            case 'heading': return { 
                label: '見出し', icon: Type, 
                color: 'border-blue-300 bg-blue-100', 
                textClass: 'text-blue-900 font-bold text-lg', placeholder: '見出しを入力...' 
            };
            case 'text': return { 
                label: '本文', icon: Box, 
                color: 'border-emerald-300 bg-emerald-100', 
                textClass: 'text-emerald-900 text-sm', placeholder: 'ここに文章を入力...' 
            };
            case 'image': return { 
                label: '画像', icon: ImageIcon, 
                color: 'border-purple-300 bg-purple-100', 
                textClass: 'text-purple-900 font-mono text-xs', placeholder: '画像URL (https://...)' 
            };
            case 'button': return { 
                label: 'ボタン', icon: MousePointerClick, 
                color: 'border-orange-300 bg-orange-100', 
                textClass: 'text-orange-900 font-bold text-center', placeholder: 'ボタンの文字' 
            };
            case 'divider': return { 
                label: '区切り線', icon: Minus, 
                color: 'border-gray-300 bg-gray-100', 
                textClass: 'hidden', placeholder: '' 
            };
            case 'input': return { 
                label: '入力欄', icon: FileInput, 
                color: 'border-cyan-300 bg-cyan-100', 
                textClass: 'text-cyan-900 font-mono text-sm', placeholder: 'プレースホルダー' 
            };
            case 'youtube': return { 
                label: '動画', icon: Youtube, 
                color: 'border-red-300 bg-red-100', 
                textClass: 'text-red-900 font-mono text-xs', placeholder: 'YouTube URL' 
            };
            case 'card': return { 
                label: 'カード', icon: CreditCard, 
                color: 'border-yellow-300 bg-yellow-100', 
                textClass: '', placeholder: '' 
            };
            default: return { 
                label: '不明', icon: Box, 
                color: 'border-gray-300 bg-gray-100', 
                textClass: '', placeholder: '' 
            };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <div ref={setNodeRef} style={style} className="relative mb-4 pl-8 group">
            <div className="absolute left-[19px] -top-6 bottom-0 w-0.5 bg-gray-300 group-last:bottom-auto group-last:h-1/2 -z-10"></div>
            
            <div {...attributes} {...listeners} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded-full transition-colors z-10 text-gray-400 hover:text-gray-700" title="ドラッグして移動">
                <GripVertical size={20} />
            </div>

            <div className={`relative flex items-stretch gap-0 rounded-xl border overflow-hidden transition-all ${config.color} shadow-sm hover:shadow-md`}>
                <div className="w-12 flex items-center justify-center bg-white/40 border-r border-black/5 shrink-0">
                    <Icon size={18} className="opacity-80 text-black" />
                </div>

                <div className="flex-1 p-3 min-w-0">
                    <div className="text-[10px] text-black/50 font-bold tracking-wider mb-1 flex items-center gap-1 uppercase">
                        {config.label}
                    </div>
                    
                    {block.type === 'card' ? (
                        <div className="space-y-2">
                            <input type="text" placeholder="画像URL" className="w-full bg-white/70 rounded px-2 py-1 text-xs text-gray-800 border border-black/10 focus:border-yellow-500 focus:bg-white outline-none" 
                                value={parseCardData(block.content).img} onChange={(e) => updateCardData('img', e.target.value)} />
                            <input type="text" placeholder="タイトル" className="w-full bg-white/70 rounded px-2 py-1 text-sm font-bold text-gray-900 border border-black/10 focus:border-yellow-500 focus:bg-white outline-none" 
                                value={parseCardData(block.content).title} onChange={(e) => updateCardData('title', e.target.value)} />
                            <textarea placeholder="説明文" rows={2} className="w-full bg-white/70 rounded px-2 py-1 text-xs text-gray-700 border border-black/10 focus:border-yellow-500 focus:bg-white outline-none resize-none" 
                                value={parseCardData(block.content).desc} onChange={(e) => updateCardData('desc', e.target.value)} />
                            <input type="text" placeholder="ボタンの文字" className="w-full bg-white/70 rounded px-2 py-1 text-xs text-gray-800 border border-black/10 focus:border-yellow-500 focus:bg-white outline-none" 
                                value={parseCardData(block.content).btn} onChange={(e) => updateCardData('btn', e.target.value)} />
                        </div>
                    ) : block.type === 'divider' ? (
                        <div className="h-6 flex items-center"><div className="w-full h-px bg-gray-400 border-t border-dashed border-gray-400 opacity-50"></div></div>
                    ) : block.type === 'text' ? (
                        <textarea 
                            value={block.content}
                            onChange={(e) => onChange(block.id, e.target.value)}
                            className={`w-full bg-transparent border-none focus:outline-none resize-none h-auto min-h-[24px] ${config.textClass} placeholder:text-black/30`}
                            placeholder={config.placeholder}
                            rows={2}
                            onInput={(e) => { e.currentTarget.style.height = 'auto'; e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'; }}
                        />
                    ) : (
                        <input 
                            type="text" 
                            value={block.content}
                            onChange={(e) => onChange(block.id, e.target.value)}
                            className={`w-full bg-transparent border-none focus:outline-none ${config.textClass} placeholder:text-black/30`}
                            placeholder={config.placeholder}
                        />
                    )}
                </div>

                <button onClick={() => onDelete(block.id)} className="w-12 flex items-center justify-center text-black/40 hover:text-red-600 hover:bg-red-500/10 transition-colors border-l border-black/5 shrink-0" title="削除">
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

// 3. プレビューレンダラー
const BlockRenderer = ({ block }: { block: Block }) => {
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    switch (block.type) {
        case 'heading': return <h2 className="text-2xl font-bold mb-4 text-gray-900 pb-2 border-b-2 border-blue-500 inline-block">{block.content}</h2>;
        case 'text': return <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">{block.content}</p>;
        case 'button': return <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all mb-4">{block.content || 'ボタン'}</button>;
        case 'image': return (
            <div className="w-full mb-4 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                {block.content ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.content} alt="Preview" className="w-full h-auto object-cover" crossOrigin="anonymous" />
                ) : (
                    <div className="h-32 flex items-center justify-center text-gray-400 gap-2"><ImageIcon size={24}/><span className="text-sm">画像プレビュー</span></div>
                )}
            </div>
        );
        case 'divider': return <hr className="my-6 border-t-2 border-dashed border-gray-300" />;
        case 'input': return <div className="mb-4"><input type="text" placeholder={block.content || '入力欄'} disabled className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-500" /></div>;
        case 'youtube': {
            const videoId = getYouTubeId(block.content);
            return (
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-lg">
                    {videoId ? (<iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen title="YouTube video" />) : (<div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100 gap-2"><Youtube size={24}/><span className="text-sm">動画プレビュー</span></div>)}
                </div>
            );
        }
        case 'card': {
            let cardData = { title: '', desc: '', btn: '', img: '' }; try { cardData = JSON.parse(block.content); } catch {}
            return (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
                    {cardData.img && (/* eslint-disable-next-line @next/next/no-img-element */<img src={cardData.img} alt={cardData.title} className="w-full h-40 object-cover" crossOrigin="anonymous" />)}
                    <div className="p-5">
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{cardData.title || 'カードタイトル'}</h3>
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{cardData.desc || 'ここに説明文が入ります。'}</p>
                        {cardData.btn && (<button className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-colors">{cardData.btn}</button>)}
                    </div>
                </div>
            );
        }
        default: return null;
    }
};

// Main Page Component
export default function CreateBlockPage() {
    const { user } = useAuth();
    const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    // 離脱確認モーダルの状態
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPath, setPendingPath] = useState<string>('/');

    // ビューモードの状態管理 (mobile | desktop)
    const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

    const captureRef = useRef<HTMLDivElement>(null);
    const toolboxRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const previewBottomRef = useRef<HTMLDivElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    
    const router = useRouter();
    const dndContextId = useId();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // ブラウザの閉じる/リロード対策
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        if (previewBottomRef.current) {
            previewBottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [blocks.length]);

    const scrollToolbox = (direction: 'left' | 'right') => {
        if (toolboxRef.current) {
            const scrollAmount = 300;
            toolboxRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const addBlock = (type: BlockType) => {
        let initialContent = '';
        if (type === 'card') {
            initialContent = JSON.stringify({ 
                title: '新しいカード', desc: '説明文を入力してください', btn: '詳しく見る', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80' 
            });
        } else if (type === 'button') initialContent = 'ここをクリック';
        else if (type === 'input') initialContent = '入力してください...';

        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: initialContent
        };
        setBlocks([...blocks, newBlock]);
        setIsDirty(true);
    };

    const removeBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        setIsDirty(true);
    };

    const updateBlock = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
        setIsDirty(true);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
            setIsDirty(true);
        }
    };

    const generateThumbnail = async () => {
        if (!captureRef.current) return null;
        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            return await toJpeg(captureRef.current, { 
                quality: 0.8, 
                width: 800, 
                height: 600, 
                backgroundColor: '#ffffff', 
                style: { background: 'white' },
                cacheBust: true 
            });
        } catch (err) { 
            console.error("Thumbnail generation failed:", err);
            return null; 
        }
    };

    const handlePost = async () => {
        if (blocks.length === 0) return;
        setIsSaving(true);
        try {
            // 1. サムネイル生成
            const thumbnailBase64 = await generateThumbnail();
            let thumbnailUrl = null;

            // 2. Storageへアップロード
            if (thumbnailBase64) {
                const base64Data = thumbnailBase64.replace(/^data:image\/jpeg;base64,/, "");
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/jpeg' });

                const fileName = `thumbnails/block_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                const storageRef = ref(storage, fileName);

                await uploadBytes(storageRef, blob);
                thumbnailUrl = await getDownloadURL(storageRef);
            }

            // 3. Firestoreへ保存
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'block',
                blocks,
                codeSnippet: 'Generated from Blocks',
                thumbnail: thumbnailUrl, // ここがURLに変わる
                caption,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            
            setIsDirty(false);
            router.push('/');
        } catch (error) {
            console.error("Error saving post:", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const handleNavigation = (path: string) => {
        if (isDirty) {
            setPendingPath(path);
            setShowConfirmModal(true);
        } else {
            router.push(path);
        }
    };

    const confirmNavigation = () => {
        setShowConfirmModal(false);
        router.push(pendingPath);
    };

    const toggleFullScreen = () => {
        if (previewWrapperRef.current) {
            if (!document.fullscreenElement) {
                previewWrapperRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className='h-screen w-full bg-[#F9FAFB] text-gray-900 flex flex-col font-sans overflow-hidden'>
            
            {/* Header */}
            <header className='h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm z-50 shrink-0 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                     <button onClick={() => handleNavigation('/')} className='text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </button>
                    <div className='flex items-center gap-2'>
                        <LayoutTemplate size={20} className="text-emerald-600" />
                        <span className='font-bold text-lg tracking-tight'>ブロックエディタ</span>
                    </div>
                </div>

                 <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button 
                            onClick={() => handleNavigation('/create')}
                            className='flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all text-gray-500 hover:text-gray-900 hover:bg-white/50 font-medium'
                        >
                            <Code2 className='w-4 h-4' /><span>コード</span>
                        </button>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all bg-white text-emerald-600 shadow-sm font-bold border border-gray-100'><LayoutTemplate className='w-4 h-4' /><span>ブロック</span></button>
                    </div>
                </div>
                
                <div className='flex items-center gap-3'>
                    <div className='text-xs text-gray-400 font-medium'>{user ? '自動保存なし' : 'ゲストモード'}</div>
                </div>
            </header>

            {/* Main Content */}
            <div className='flex-1 flex overflow-hidden p-4 md:p-6 gap-4 md:gap-6'>
                <div className='w-1/2 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative z-10'>
                    <div className="py-6 px-4 border-b border-gray-100 bg-white relative group/toolbox z-20">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <PlusCircle size={14} /> 追加したいブロックを選択
                            </h3>
                            <div className="flex gap-1">
                                <button onClick={() => scrollToolbox('left')} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button onClick={() => scrollToolbox('right')} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={toolboxRef}
                            className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x scroll-smooth relative z-20"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            <ToolButton type="heading" icon={Type} label="見出し" colorClass="border-blue-300 hover:border-blue-400 text-blue-700 bg-blue-100" onClick={addBlock} />
                            <ToolButton type="text" icon={Box} label="本文" colorClass="border-emerald-300 hover:border-emerald-400 text-emerald-700 bg-emerald-100" onClick={addBlock} />
                            <ToolButton type="image" icon={ImageIcon} label="画像" colorClass="border-purple-300 hover:border-purple-400 text-purple-700 bg-purple-100" onClick={addBlock} />
                            <ToolButton type="button" icon={MousePointerClick} label="ボタン" colorClass="border-orange-300 hover:border-orange-400 text-orange-700 bg-orange-100" onClick={addBlock} />
                            <ToolButton type="card" icon={CreditCard} label="カード" colorClass="border-yellow-300 hover:border-yellow-400 text-yellow-700 bg-yellow-100" onClick={addBlock} />
                            <ToolButton type="youtube" icon={Youtube} label="動画" colorClass="border-red-300 hover:border-red-400 text-red-700 bg-red-100" onClick={addBlock} />
                            <ToolButton type="input" icon={FileInput} label="入力欄" colorClass="border-cyan-300 hover:border-cyan-400 text-cyan-700 bg-cyan-100" onClick={addBlock} />
                            <ToolButton type="divider" icon={Minus} label="区切り線" colorClass="border-gray-300 hover:border-gray-400 text-gray-700 bg-gray-100" onClick={addBlock} />
                        </div>
                        
                        <div className="absolute right-0 top-12 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden z-20"></div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white relative z-10">
                        <div className="max-w-xl mx-auto pb-20">
                            {blocks.length === 0 ? (
                                <div className="text-center py-20 opacity-50 border-2 border-dashed border-gray-200 rounded-2xl">
                                    <p className="text-gray-400 mb-2">まだブロックがありません</p>
                                    <p className="text-sm text-gray-500">上のボタンを押して追加してください</p>
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
                            <div ref={bottomRef}></div>
                        </div>
                    </div>
                </div>

                {/* 右側：プレビュー */}
                <div className='w-1/2 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden'>
                    <div className='h-12 border-b border-gray-100 flex items-center justify-between px-6 bg-white'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest'>
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            プレビュー
                        </div>
                        
                        {/*　モード切り替え & 全画面表示ボタン */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                                <button 
                                    onClick={() => setViewMode('mobile')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="モバイル表示"
                                >
                                    <Smartphone size={14} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('desktop')}
                                    className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    title="PC表示"
                                >
                                    <Monitor size={14} />
                                </button>
                            </div>
                            
                            <div className="w-px h-4 bg-gray-200 mx-1"></div>

                            <button 
                                onClick={toggleFullScreen}
                                className='flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors px-2 py-1 rounded hover:bg-emerald-50'
                                title="全画面表示"
                            >
                                <Maximize size={12} />
                                <span>全画面</span>
                            </button>
                        </div>
                    </div>

                    <div 
                        ref={previewWrapperRef}
                        className='flex-1 flex items-center justify-center relative bg-[#F3F4F6] p-8 overflow-hidden'
                    >
                        <div 
                            className={`
                                bg-white shadow-xl overflow-y-auto relative border border-gray-100
                                transition-all duration-300 ease-in-out
                                ${viewMode === 'mobile' 
                                    ? 'w-full h-full max-w-[480px] max-h-[700px] rounded-3xl ring-4 ring-gray-200' 
                                    : 'w-full h-full rounded-xl'
                                }
                            `}
                        >
                            {viewMode === 'mobile' && (
                                <div className="sticky top-0 left-0 right-0 h-8 bg-gray-50 border-b border-gray-100 flex items-center justify-center z-10">
                                    <div className="w-16 h-1 bg-gray-300 rounded-full"></div>
                                </div>
                            )}
                            
                            <div className="p-8 min-h-full">
                                {blocks.map(block => (
                                    <BlockRenderer key={block.id} block={block} />
                                ))}
                                <div ref={previewBottomRef}></div>
                            </div>
                        </div>
                    </div>

                    <div className='border-t border-gray-100 bg-white p-5 flex flex-col gap-4 shrink-0'>
                        <div className="relative">
                            <div className="absolute top-3 left-3 text-gray-400">
                                <AlignLeft size={16} />
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="作品の説明を入力してください..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 resize-none h-16 custom-scrollbar transition-all focus:bg-white focus:shadow-sm"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button 
                                onClick={handlePost} 
                                disabled={isSaving}
                                className='flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 active:scale-95 hover:shadow-emerald-500/40'
                            >
                                {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save size={20} />}
                                <span>{isSaving ? '保存中...' : '投稿する'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <div ref={captureRef} style={{ width: '800px', height: '600px', background: '#ffffff', padding: '40px' }}>
                    {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
                </div>
            </div>

            {/* 離脱確認モーダル */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform scale-100 transition-all">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">このページを離れますか？</h3>
                            <p className="text-sm text-gray-500">
                                作成内容は破棄されます。<br />本当によろしいですか？
                            </p>
                            <div className="flex gap-3 w-full mt-4">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button 
                                    onClick={confirmNavigation}
                                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                                >
                                    破棄して移動
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}