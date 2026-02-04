'use client';

import React, { useState, useEffect, useId } from 'react';
import { 
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Code2, Box, ArrowLeft, Trash2, Layout, Type, Image as ImageIcon, MousePointerClick, Square, Layers, Loader2, Save
} from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';

// --- Block Definitions & Styles ---
type BlockCategory = 'layout' | 'content' | 'component';

interface BlockDefinition {
    type: string;
    label: string;
    category: BlockCategory;
    hasInput?: boolean;
    defaultContent?: string;
    icon?: React.ElementType;
    isWrapper?: boolean;
}

interface BlockInstance {
    id: string;
    type: string;
    content: string;
    category: BlockCategory;
}

const BLOCK_HEIGHT = 42;

const CATEGORY_STYLES = {
    layout: { bg: 'bg-blue-600', border: 'border-blue-700', shadow: 'shadow-blue-900/20' },
    content: { bg: 'bg-slate-600', border: 'border-slate-700', shadow: 'shadow-slate-900/20' },
    component: { bg: 'bg-emerald-600', border: 'border-emerald-700', shadow: 'shadow-emerald-900/20' },
};
// ツールボックス
const TOOLBOX_BLOCKS: BlockDefinition[] = [
    { type: 'section', label: '項', category: 'layout', icon: Layout, isWrapper: true },
    { type: 'container', label: '容器', category: 'layout', icon: Box, isWrapper: true },
    { type: 'heading', label: '見出し', category: 'content', hasInput: true, defaultContent: '見出し', icon: Type },
    { type: 'text', label: 'テキスト', category: 'content', hasInput: true, defaultContent: 'テキスト', icon: Type },
    { type: 'image', label: '画像', category: 'content', hasInput: true, defaultContent: 'https://placehold.co/400', icon: ImageIcon },
    { type: 'button', label: 'ボタン', category: 'component', hasInput: true, defaultContent: 'ボタン', icon: MousePointerClick },
    { type: 'card', label: 'カード', category: 'component', hasInput: true, defaultContent: 'カード', icon: Square },
];

const TopNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -top-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor"><path d="M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z" /></svg>
);
const BottomNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -bottom-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor"><path d="M0 0h2l1 1 1 2 2 2h4l2-2 1-2 1-1h2v0H0z" /></svg>
);

const SortableBlock = ({ id, block, onDelete, onChange }: { id: string, block: BlockInstance, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto', opacity: isDragging ? 0.8 : 1 };
    const styles = CATEGORY_STYLES[block.category];
    const def = TOOLBOX_BLOCKS.find(b => b.type === block.type);
    const Icon = def?.icon || Layers;
    const isWrapper = def?.isWrapper;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`group relative mb-0.5 select-none ${isDragging ? 'z-50' : ''}`}>
            <div className={`relative flex items-center h-[${BLOCK_HEIGHT}px] px-3 py-2 ${styles.bg} text-white rounded-r-sm shadow-md cursor-grab active:cursor-grabbing border-t border-b border-r border-white/10 ${isWrapper ? 'rounded-tl-sm' : 'rounded-l-sm'}`}>
                <TopNotch className="text-black/20" /><TopNotch className={styles.bg} />
                {!isWrapper && <BottomNotch className="text-black/20 translate-y-[1px]" />}{!isWrapper && <BottomNotch className={styles.bg} />}
                <div className="flex items-center gap-2 w-full">
                    <Icon size={16} className="text-white/90" />
                    <span className="font-bold text-xs tracking-wide">{def?.label}</span>
                    {def?.hasInput && (
                        <div className="flex-1 flex items-center gap-1 bg-black/20 rounded px-2 py-0.5 mx-2 shadow-inner border border-black/10 min-w-0">
                            <input type="text" className="w-full bg-transparent text-xs font-mono text-white focus:outline-none placeholder-white/50 truncate" value={block.content} onChange={(e) => onChange(id, e.target.value)} onPointerDown={(e) => e.stopPropagation()} />
                        </div>
                    )}
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(id); }} className="ml-auto p-1 text-white/50 hover:text-white hover:bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12} /></button>
            </div>
            {isWrapper && (
                <div className="ml-3 pl-3 border-l-[12px] border-l-inherit min-h-[20px] flex flex-col justify-end relative opacity-80" style={{ borderColor: 'inherit' }}>
                    <div className={`absolute inset-y-0 left-0 w-3 ${styles.bg} opacity-50`}></div>
                    <div className={`relative h-5 w-20 ${styles.bg} rounded-b-sm rounded-tr-sm flex items-center px-2 text-[10px] text-white/70 font-mono mt-0.5`}>
                        <TopNotch className={styles.bg} /><BottomNotch className={styles.bg} /><span className="ml-4 opacity-50">&lt;/{def?.type}&gt;</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const ToolboxBlock = ({ def, onClick }: { def: BlockDefinition, onClick: () => void }) => {
    const styles = CATEGORY_STYLES[def.category];
    const Icon = def.icon || Layers;
    return (
        <div onClick={onClick} className={`flex items-center gap-2 px-3 py-2 mb-2 ${styles.bg} text-white rounded-sm shadow-sm cursor-pointer transition-transform hover:scale-105 hover:brightness-110 select-none relative`}>
            <div className="absolute -top-[3px] left-3 w-3 h-[3px] bg-inherit rounded-t-sm opacity-50"></div><div className="absolute -bottom-[3px] left-3 w-3 h-[3px] bg-inherit rounded-b-sm shadow-sm"></div>
            <Icon size={16} className="text-white/90" /><span className="font-bold text-xs">{def.label}</span>
        </div>
    );
};

export default function BlockCreatePage() {
    const [blocks, setBlocks] = useState<BlockInstance[]>([
        { id: '1', type: 'heading', content: 'ようこそ', category: 'content' },
        { id: '2', type: 'button', content: '押してみて！', category: 'component' },
    ]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const dndContextId = useId(); 
    
    // ユーザー情報を取得
    const { user } = useAuth();

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    const addBlock = (def: BlockDefinition) => {
        setBlocks([...blocks, { id: crypto.randomUUID(), type: def.type, content: def.defaultContent || '', category: def.category }]);
    };
    const deleteBlock = (id: string) => setBlocks(blocks.filter(b => b.id !== id));
    const updateBlockContent = (id: string, content: string) => setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id && over) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const generateHTML = () => {
        let html = '';
        blocks.forEach(block => {
            switch(block.type) {
                case 'section': html += `<section class="py-12 px-6 bg-white border-b border-gray-200"><div class="p-4 border-2 border-dashed border-blue-200 text-center text-blue-400 rounded">Section Content</div></section>\n`; break;
                case 'container': html += `<div class="container mx-auto max-w-4xl p-4"><div class="p-4 border-2 border-dashed border-gray-200 text-gray-400 rounded">Container Content</div></div>\n`; break;
                case 'heading': html += `<h1 class="text-3xl font-bold text-gray-900 mb-4">${block.content}</h1>\n`; break;
                case 'text': html += `<p class="text-gray-600 mb-4 leading-relaxed">${block.content}</p>\n`; break;
                case 'image': html += `<img src="${block.content}" class="w-full h-64 object-cover rounded-lg mb-6 shadow-md" />\n`; break;
                case 'button': html += `<button class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg active:scale-95">${block.content}</button>\n`; break;
                case 'card': html += `<div class="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-4"><h3 class="font-bold text-lg mb-2">Card</h3><p class="text-gray-500">${block.content}</p></div>\n`; break;
            }
        });
        return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="https://cdn.tailwindcss.com"></script><style>body { background-color: #f3f4f6; padding: 2rem; font-family: system-ui, sans-serif; }</style></head><body><div class="max-w-2xl mx-auto bg-gray-50 min-h-screen p-8 shadow-xl rounded-xl">${html}</div></body></html>`;
    };

    useEffect(() => {
        const html = generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [blocks]);

    // Blockモードの保存処理
    const handlePost = async () => {
        setIsSaving(true);
        try {
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'block',
                blocks: blocks,
                codeSnippet: generateHTML(),
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            alert("投稿しました！");
            window.location.href = '/'; 
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("保存に失敗しました...");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='min-h-screen bg-[#111] text-white flex flex-col font-sans'>
            <header className='h-16 border-b border-white/10 flex items-center px-6 bg-[#0a0a0a] sticky top-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'><ArrowLeft className='w-5 h-5' /></a>
                    <h2 className='font-bold text-lg tracking-tight text-gray-200'>Create New Post</h2>
                </div>
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                        <a href="/create" className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Code2 className='w-4 h-4' /><span>Text</span></a>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'><Box className='w-4 h-4' /><span>Block</span></button>
                    </div>
                </div>
                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>
                        {user ? 'Autosaved' : 'Guest Mode'}
                    </div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                <div className='w-64 bg-[#161616] border-r border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5'><h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Web Parts</h3></div>
                    <div className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'>
                        {['layout', 'content', 'component'].map(cat => (
                            <div key={cat}><div className='text-[10px] font-bold text-gray-600 mb-3 px-1 uppercase'>{cat}</div>
                            {TOOLBOX_BLOCKS.filter(b => b.category === cat).map(b => (<ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />))}</div>
                        ))}
                    </div>
                </div>

                <div className='flex-1 bg-[#0f0f0f] relative flex flex-col border-r border-white/10'>
                    <div className='absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none'></div>
                    <div className='flex-1 overflow-auto p-8 relative z-0 custom-scrollbar'>
                        <DndContext id={dndContextId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                <div className='min-h-[600px] pb-40 max-w-2xl mx-auto'>
                                    {blocks.map((block) => (<SortableBlock key={block.id} id={block.id} block={block} onDelete={deleteBlock} onChange={updateBlockContent} />))}
                                    {blocks.length === 0 && (<div className='flex flex-col items-center justify-center py-20 opacity-30'><Box className='w-16 h-16 mb-4 text-gray-500' /><p className='text-gray-400 font-bold'>Start Building</p></div>)}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className='w-96 bg-[#111] flex flex-col'>
                    <div className='p-3 border-b border-white/5 flex justify-between items-center bg-[#161616]'><span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Live Preview</span></div>
                    <div className='flex-1 bg-white relative'>
                         {previewUrl ? (<iframe src={previewUrl} className="w-full h-full border-none" title="Live Preview" sandbox="allow-scripts" />) : (<div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>)}
                    </div>
                    {/* 保存ボタン */}
                    <div className='h-16 border-t border-white/10 flex items-center justify-center px-6 bg-[#161616]'>
                        <button
                            onClick={handlePost}
                            disabled={isSaving || blocks.length === 0}
                            className='flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 w-full justify-center'
                        >
                            {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                            <span>{isSaving ? 'Posting...' : 'Post Creation'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}