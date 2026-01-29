'use client';

import React, { useState, useEffect, useId, useRef } from 'react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent,
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy, 
    useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
    Box, 
    ArrowLeft, 
    Trash2,
    GripVertical,
    Layout,
    Type,
    Image as ImageIcon,
    MousePointerClick,
    Square,
    Layers,
    Code2
} from 'lucide-react';

// --- Types & Definitions ---
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

// --- Visual Config (Theme) ---
const BLOCK_THEME = {
  layout: {
    base: 'bg-indigo-600',
    border: 'border-indigo-500',
    gradient: 'from-indigo-500/50 to-indigo-700/50',
    shadow: 'shadow-[0_4px_0_#312e81]',
  },
  content: {
    base: 'bg-slate-700',
    border: 'border-slate-600',
    gradient: 'from-slate-600/50 to-slate-800/50',
    shadow: 'shadow-[0_4px_0_#1e293b]',
  },
  component: {
    base: 'bg-emerald-600',
    border: 'border-emerald-500',
    gradient: 'from-emerald-500/50 to-emerald-700/50',
    shadow: 'shadow-[0_4px_0_#064e3b]',
  }
};

const TOOLBOX_BLOCKS: BlockDefinition[] = [
    { type: 'section', label: 'Section Wrapper', category: 'layout', icon: Layout, isWrapper: true },
    { type: 'container', label: 'Container', category: 'layout', icon: Box, isWrapper: true },
    { type: 'heading', label: '見出し', category: 'content', hasInput: true, defaultContent: 'Hello World', icon: Type },
    { type: 'text', label: '本文', category: 'content', hasInput: true, defaultContent: 'Welcome to my website.', icon: Type },
    { type: 'image', label: '画像', category: 'content', hasInput: true, defaultContent: 'https://placehold.co/600x400', icon: ImageIcon },
    { type: 'button', label: 'ボタン', category: 'component', hasInput: true, defaultContent: 'Click Me', icon: MousePointerClick },
    { type: 'card', label: 'カード', category: 'component', hasInput: true, defaultContent: 'Card Content', icon: Square },
];

// --- Sub Components ---

// 3D Notch
const TopNotch3D = ({ className, colorClass }: { className?: string, colorClass: string }) => (
  <div className={`absolute -top-[5px] left-4 z-10 ${className}`}>
    <svg width="16" height="5" viewBox="0 0 16 5" className="absolute top-[1px] opacity-30 text-black block">
      <path d="M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z" fill="currentColor" />
    </svg>
    <svg width="16" height="5" viewBox="0 0 16 5" className={`${colorClass} block`}>
      <path d="M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z" fill="currentColor" />
    </svg>
    <svg width="16" height="5" viewBox="0 0 16 5" className="absolute top-0 left-0 opacity-40 text-white pointer-events-none">
       <path d="M2 5l1-1 1-2 2-2h4l2 2 1 2 1 1" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  </div>
);

// Auto Resize TextArea Hook
const useAutoResizeTextArea = (value: string | undefined) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value]);
  return ref;
};

// Toolbox Item
const ToolboxBlock = ({ def, onClick }: { def: BlockDefinition, onClick: () => void }) => {
    const styles = BLOCK_THEME[def.category];
    const Icon = def.icon || Layers;
    
    return (
        <div 
            onClick={onClick}
            className={`
                flex items-center gap-2 px-3 py-2 mb-2 
                ${styles.base} text-white rounded-sm shadow-sm
                cursor-pointer transition-transform hover:scale-105 hover:brightness-110
                select-none relative group border border-white/10
            `}
        >
            <Icon size={16} className="text-white/90" />
            <span className="font-bold text-xs">{def.label}</span>
        </div>
    );
};

// --- Main Block Component (Pro Version) ---
const ProBlock = ({ 
    id, 
    block, 
    onDelete, 
    onChange 
}: { 
    id: string, 
    block: BlockInstance, 
    onDelete: (id: string) => void, 
    onChange: (id: string, val: string) => void 
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const theme = BLOCK_THEME[block.category] || BLOCK_THEME.content;
    const textAreaRef = useAutoResizeTextArea(block.content);
    const def = TOOLBOX_BLOCKS.find(b => b.type === block.type);
    const isWrapper = def?.isWrapper;

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`
                group relative mb-3 pl-2 pr-2 py-1 transition-all select-none
                ${isDragging ? 'scale-105 rotate-1 opacity-90 z-50' : ''}
            `}
            {...attributes} 
        >
            <div 
                className={`
                    relative rounded-lg flex flex-col
                    ${theme.base} 
                    bg-gradient-to-br ${theme.gradient}
                    border-t border-l border-white/20 border-r border-b border-black/20
                    ${isDragging ? 'shadow-2xl ring-2 ring-white/30' : theme.shadow}
                    transition-shadow duration-200
                `}
            >
                <TopNotch3D colorClass={theme.base} />
                
                <div className="flex items-start gap-3 p-3 min-h-[50px]">
                    <div 
                        {...listeners}
                        className="mt-1 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/80 transition-colors p-1 rounded hover:bg-black/10"
                    >
                        <GripVertical size={18} />
                    </div>

                    <div className="flex flex-col gap-1 pt-1.5 min-w-[100px]">
                        <div className="flex items-center gap-1.5 text-white font-bold text-xs tracking-wider uppercase opacity-90 text-shadow-sm">
                            {def?.icon && <def.icon size={12} />}
                            <span>{def?.label}</span>
                        </div>
                    </div>

                    {def?.hasInput && (
                        <div className="flex-1 relative group/input pt-0.5">
                             <div className={`
                                absolute -inset-1 rounded opacity-0 group-hover/input:opacity-100 transition-opacity
                                bg-black/10 pointer-events-none
                             `}></div>
                            <textarea
                                ref={textAreaRef}
                                value={block.content}
                                onChange={(e) => onChange(id, e.target.value)}
                                className="w-full bg-black/20 text-white text-sm font-mono p-2 rounded border border-transparent focus:border-white/30 focus:bg-black/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none overflow-hidden leading-relaxed placeholder-white/30"
                                placeholder="Value..."
                                rows={1}
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}

                    <button 
                        onClick={() => onDelete(id)}
                        className="mt-1 p-1.5 text-white/40 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {isWrapper && (
                    <div className="px-3 pb-2">
                        <div className="border-l-2 border-white/10 ml-4 pl-4 py-2 min-h-[30px] flex items-center text-xs text-white/30 border-dashed">
                             <span className="italic">Children would go here...</span>
                        </div>
                        <div className="h-2 bg-black/10 mx-4 rounded-b-sm"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Debounce Hook for Performance ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Main Page Component ---
export default function BlockCreatePage() {
    // State
    const [blocks, setBlocks] = useState<BlockInstance[]>([
        { id: '1', type: 'heading', content: 'Block Editer', category: 'content' },
        { id: '2', type: 'text', content: 'さあはじめよう！', category: 'content' },
        { id: '3', type: 'button', content: 'ボタン', category: 'component' },
    ]);
    
    // Performance: Use debounced blocks for preview generation
    const debouncedBlocks = useDebounce(blocks, 500);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const dndContextId = useId();

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addBlock = (def: BlockDefinition) => {
        const newBlock: BlockInstance = {
            id: crypto.randomUUID(),
            type: def.type,
            content: def.defaultContent || '',
            category: def.category
        };
        setBlocks([...blocks, newBlock]);
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const updateBlockContent = (id: string, content: string) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

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

    // HTML Generator (Updated to use debounced blocks)
    useEffect(() => {
        const generateHTML = () => {
            let html = '';
            debouncedBlocks.forEach(block => {
                switch(block.type) {
                    case 'section':
                        html += `<section class="py-12 px-6 bg-white border-b border-gray-200"><div class="p-4 border-2 border-dashed border-blue-200 text-center text-blue-400 rounded">Section</div></section>`; break;
                    case 'container':
                        html += `<div class="container mx-auto max-w-4xl p-4"><div class="p-4 border-2 border-dashed border-gray-200 text-gray-400 rounded">Container</div></div>`; break;
                    case 'heading':
                        html += `<h1 class="text-3xl font-bold text-gray-900 mb-4">${block.content}</h1>`; break;
                    case 'text':
                        html += `<p class="text-gray-600 mb-4 leading-relaxed">${block.content}</p>`; break;
                    case 'image':
                        html += `<img src="${block.content}" alt="Image" class="w-full h-64 object-cover rounded-lg mb-6 shadow-md" />`; break;
                    case 'button':
                        html += `<button class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg">${block.content}</button>`; break;
                    case 'card':
                        html += `<div class="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-4"><p>${block.content}</p></div>`; break;
                }
            });
            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>body { background-color: #f3f4f6; padding: 2rem; font-family: system-ui, sans-serif; }</style>
                </head>
                <body>
                    <div class="max-w-2xl mx-auto bg-gray-50 min-h-screen p-8 shadow-xl rounded-xl">
                        ${html || '<div class="text-center text-gray-400 py-10">Empty Canvas</div>'}
                    </div>
                </body>
                </html>
            `;
        };

        const html = generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [debouncedBlocks]);

    return (
        <div className='min-h-screen bg-[#111] text-white flex flex-col font-sans'>
            {/* HEADER */}
            <header className='h-16 border-b border-white/10 flex items-center px-6 bg-[#0a0a0a] sticky top-0 z-50'>
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <h2 className='font-bold text-lg tracking-tight text-gray-200'>Builder Pro</h2>
                </div>
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                     <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm text-gray-400 hover:text-white transition-all'>
                            <Code2 className='w-4 h-4' />
                            <span>Text</span>
                        </button>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm bg-indigo-600 text-white shadow-lg font-medium'>
                            <Box className='w-4 h-4' />
                            <span>Block</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                {/* TOOLBOX */}
                <div className='w-64 bg-[#161616] border-r border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Components</h3>
                    </div>
                    <div className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'>
                        {['layout', 'content', 'component'].map(cat => (
                            <div key={cat}>
                                <div className='text-[10px] font-bold text-gray-600 mb-3 px-1 uppercase'>{cat}</div>
                                {TOOLBOX_BLOCKS.filter(b => b.category === cat).map(b => (
                                    <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className='flex-1 bg-[#0f0f0f] relative flex flex-col border-r border-white/10'>
                    <div className='absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none'></div>
                    <div className='flex-1 overflow-auto p-8 relative z-0 custom-scrollbar'>
                        <DndContext 
                            id={dndContextId}
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext 
                                items={blocks.map(b => b.id)} 
                                strategy={verticalListSortingStrategy}
                            >
                                <div className='min-h-[600px] pb-40 max-w-2xl mx-auto'>
                                    {blocks.map((block) => (
                                        <ProBlock 
                                            key={block.id} 
                                            id={block.id}
                                            block={block} 
                                            onDelete={deleteBlock}
                                            onChange={updateBlockContent}
                                        />
                                    ))}
                                    {blocks.length === 0 && (
                                        <div className='flex flex-col items-center justify-center py-20 opacity-30'>
                                            <Box className='w-16 h-16 mb-4 text-gray-500' />
                                            <p className='text-gray-400 font-bold'>Drag blocks here</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className='w-96 bg-[#111] flex flex-col'>
                    <div className='p-3 border-b border-white/5 flex justify-between items-center bg-[#161616]'>
                        <span className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Live Preview</span>
                    </div>
                    <div className='flex-1 bg-white relative'>
                         {previewUrl ? (
                            <iframe 
                                src={previewUrl}
                                className="w-full h-full border-none"
                                title="Live Preview"
                                sandbox="allow-scripts"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Initializing...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}