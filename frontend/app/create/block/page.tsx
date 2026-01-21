'use client';

import React, { useState, useEffect } from 'react';
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
    Play, 
    Code2, 
    Box, 
    ArrowLeft, 
    Trash2,
    GripVertical,
    Layout,
    Type,
    Image as ImageIcon,
    MousePointerClick,
    Square,
    Layers
} from 'lucide-react';

// --- Block Types & Definitions ---
type BlockCategory = 'layout' | 'content' | 'component';

interface BlockDefinition {
    type: string;
    label: string;
    category: BlockCategory;
    hasInput?: boolean;
    inputType?: 'text' | 'color'; // 入力タイプ拡張
    defaultContent?: string;
    icon?: React.ElementType;
    isWrapper?: boolean; // Sectionなどのコンテナ扱い
}

interface BlockInstance {
    id: string;
    type: string;
    content: string;
    category: BlockCategory;
}

// Visual Config
const BLOCK_HEIGHT = 42;

const CATEGORY_STYLES = {
    layout: { 
        bg: 'bg-blue-600', 
        border: 'border-blue-700',
        shadow: 'shadow-blue-900/20'
    },
    content: { 
        bg: 'bg-slate-600', 
        border: 'border-slate-700',
        shadow: 'shadow-slate-900/20'
    },
    component: { 
        bg: 'bg-emerald-600', 
        border: 'border-emerald-700',
        shadow: 'shadow-emerald-900/20'
    },
};

const TOOLBOX_BLOCKS: BlockDefinition[] = [
    // Layout
    { type: 'section', label: 'Section Wrapper', category: 'layout', icon: Layout, isWrapper: true },
    { type: 'container', label: 'Container', category: 'layout', icon: Box, isWrapper: true },
    
    // Content
    { type: 'heading', label: 'Heading H1', category: 'content', hasInput: true, defaultContent: 'Hello World', icon: Type },
    { type: 'text', label: 'Paragraph', category: 'content', hasInput: true, defaultContent: 'Welcome to my website.', icon: Type },
    { type: 'image', label: 'Image URL', category: 'content', hasInput: true, defaultContent: 'https://placehold.co/600x400', icon: ImageIcon },

    // Components
    { type: 'button', label: 'Button', category: 'component', hasInput: true, defaultContent: 'Click Me', icon: MousePointerClick },
    { type: 'card', label: 'Simple Card', category: 'component', hasInput: true, defaultContent: 'Card Content', icon: Square },
];

// --- Puzzle Notch Component (SVG) ---
const TopNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -top-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor">
        <path d="M0 5h2l1-1 1-2 2-2h4l2 2 1 2 1 1h2v5H0z" />
    </svg>
);

const BottomNotch = ({ className }: { className?: string }) => (
    <svg className={`absolute -bottom-[4px] left-4 w-4 h-[5px] z-10 ${className}`} viewBox="0 0 16 5" fill="currentColor">
        <path d="M0 0h2l1 1 1 2 2 2h4l2-2 1-2 1-1h2v0H0z" />
    </svg>
);

// --- Block Component (Sortable) ---
const SortableBlock = ({ 
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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.8 : 1,
    };

    const styles = CATEGORY_STYLES[block.category];
    const def = TOOLBOX_BLOCKS.find(b => b.type === block.type);
    const Icon = def?.icon || Layers;
    const isWrapper = def?.isWrapper;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`group relative mb-0.5 select-none ${isDragging ? 'z-50' : ''}`}
        >
            {/* Main Block Shape */}
            <div className={`
                relative flex items-center h-[${BLOCK_HEIGHT}px] px-3 py-2
                ${styles.bg} text-white
                rounded-r-sm shadow-md cursor-grab active:cursor-grabbing
                border-t border-b border-r border-white/10
                ${isWrapper ? 'rounded-tl-sm' : 'rounded-l-sm'}
            `}>
                {/* Visual Notches */}
                <TopNotch className="text-black/20" />
                <TopNotch className={styles.bg} />
                
                {!isWrapper && <BottomNotch className="text-black/20 translate-y-[1px]" />}
                {!isWrapper && <BottomNotch className={styles.bg} />}

                {/* Content */}
                <div className="flex items-center gap-2 w-full">
                    <Icon size={16} className="text-white/90" />
                    <span className="font-bold text-xs tracking-wide">{def?.label}</span>

                    {/* Input Fields */}
                    {def?.hasInput && (
                        <div className="flex-1 flex items-center gap-1 bg-black/20 rounded px-2 py-0.5 mx-2 shadow-inner border border-black/10 min-w-0">
                            <input 
                                type="text" 
                                className="w-full bg-transparent text-xs font-mono text-white focus:outline-none placeholder-white/50 truncate"
                                value={block.content}
                                onChange={(e) => onChange(id, e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                </div>

                {/* Delete Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="ml-auto p-1 text-white/50 hover:text-white hover:bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {/* Wrapper Visuals (Bottom Arm for Layouts) */}
            {isWrapper && (
                <div className="ml-3 pl-3 border-l-[12px] border-l-inherit min-h-[20px] flex flex-col justify-end relative opacity-80" style={{ borderColor: 'inherit' }}>
                    <div className={`absolute inset-y-0 left-0 w-3 ${styles.bg} opacity-50`}></div>
                    <div className={`
                        relative h-5 w-20 ${styles.bg} rounded-b-sm rounded-tr-sm
                        flex items-center px-2 text-[10px] text-white/70 font-mono mt-0.5
                    `}>
                        <TopNotch className={styles.bg} />
                        <BottomNotch className={styles.bg} />
                        <span className="ml-4 opacity-50">&lt;/{def?.type}&gt;</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Toolbox Item ---
const ToolboxBlock = ({ def, onClick }: { def: BlockDefinition, onClick: () => void }) => {
    const styles = CATEGORY_STYLES[def.category];
    const Icon = def.icon || Layers;
    
    return (
        <div 
            onClick={onClick}
            className={`
                flex items-center gap-2 px-3 py-2 mb-2 
                ${styles.bg} text-white rounded-sm shadow-sm
                cursor-pointer transition-transform hover:scale-105 hover:brightness-110
                select-none relative
            `}
        >
            <div className="absolute -top-[3px] left-3 w-3 h-[3px] bg-inherit rounded-t-sm opacity-50"></div>
            <div className="absolute -bottom-[3px] left-3 w-3 h-[3px] bg-inherit rounded-b-sm shadow-sm"></div>

            <Icon size={16} className="text-white/90" />
            <span className="font-bold text-xs">{def.label}</span>
        </div>
    );
};

export default function BlockCreatePage() {
    // State
    const [blocks, setBlocks] = useState<BlockInstance[]>([
        { id: '1', type: 'heading', content: 'Welcome to Web Builder', category: 'content' },
        { id: '2', type: 'text', content: 'Build websites by stacking blocks.', category: 'content' },
        { id: '3', type: 'button', content: 'Get Started', category: 'component' },
    ]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

    // HTML Generator
    const generateHTML = () => {
        let html = '';
        
        blocks.forEach(block => {
            switch(block.type) {
                case 'section':
                    html += `<section class="py-12 px-6 bg-white border-b border-gray-200">\n`;
                    // Note: Nesting logic would go here in a full tree structure
                    html += `  <div class="p-4 border-2 border-dashed border-blue-200 text-center text-blue-400 rounded">Section Content Area</div>\n`;
                    html += `</section>\n`;
                    break;
                case 'container':
                    html += `<div class="container mx-auto max-w-4xl p-4">\n`;
                    html += `  <div class="p-4 border-2 border-dashed border-gray-200 text-gray-400 rounded">Container Content</div>\n`;
                    html += `</div>\n`;
                    break;
                case 'heading':
                    html += `<h1 class="text-3xl font-bold text-gray-900 mb-4">${block.content}</h1>\n`;
                    break;
                case 'text':
                    html += `<p class="text-gray-600 mb-4 leading-relaxed">${block.content}</p>\n`;
                    break;
                case 'image':
                    html += `<img src="${block.content}" alt="Image" class="w-full h-64 object-cover rounded-lg mb-6 shadow-md" />\n`;
                    break;
                case 'button':
                    html += `<button class="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg active:scale-95">${block.content}</button>\n`;
                    break;
                case 'card':
                    html += `<div class="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-4">\n`;
                    html += `  <h3 class="font-bold text-lg mb-2">Card Title</h3>\n`;
                    html += `  <p class="text-gray-500">${block.content}</p>\n`;
                    html += `</div>\n`;
                    break;
            }
        });

        // Wrap in full HTML document
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
                    ${html || '<div class="text-center text-gray-400 py-10">Add blocks to see preview</div>'}
                </div>
            </body>
            </html>
        `;
    };

    // Update preview when blocks change
    useEffect(() => {
        const html = generateHTML();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [blocks]);

    return (
        <div className='min-h-screen bg-[#111] text-white flex flex-col font-sans'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50'>
                <div className='flex items-center gap-4'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <h2 className='font-bold text-lg tracking-tight text-gray-200'>Web Builder</h2>
                </div>
                <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                    <a href="/create" className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'>
                        <Code2 className='w-4 h-4' />
                        <span>Text</span>
                    </a>
                    <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'>
                        <Box className='w-4 h-4' />
                        <span>Block</span>
                    </button>
                </div>
                <div className="w-24"></div> {/* Spacer */}
            </header>

            <div className='flex-1 flex overflow-hidden'>
                
                {/* Toolbox */}
                <div className='w-64 bg-[#161616] border-r border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Web Parts</h3>
                    </div>
                    <div className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-1'>LAYOUT</div>
                            {TOOLBOX_BLOCKS.filter(b => b.category === 'layout').map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-1'>CONTENT</div>
                            {TOOLBOX_BLOCKS.filter(b => b.category === 'content').map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-1'>COMPONENTS</div>
                            {TOOLBOX_BLOCKS.filter(b => b.category === 'component').map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Workspace (Center) */}
                <div className='flex-1 bg-[#0f0f0f] relative flex flex-col border-r border-white/10'>
                    <div className='absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none'></div>
                    
                    <div className='flex-1 overflow-auto p-8 relative z-0 custom-scrollbar'>
                        <DndContext 
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
                                        <SortableBlock 
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
                                            <p className='text-gray-400 font-bold'>Start Building</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Live Preview (Right) */}
                <div className='w-96 bg-[#111] flex flex-col'>
                    <div className='p-3 border-b border-white/5 flex justify-between items-center bg-[#161616]'>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        </div>
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
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading...</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}