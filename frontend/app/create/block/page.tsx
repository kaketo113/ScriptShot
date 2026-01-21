'use client';

import React, { useState } from 'react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    defaultDropAnimationSideEffects
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
    Zap,
    GripVertical,
    Repeat,
    MessageSquare,
    Move,
    RotateCw,
    Command
} from 'lucide-react';

// --- Block Types & Definitions ---
type BlockCategory = 'event' | 'control' | 'motion' | 'looks';

interface BlockDefinition {
    type: string;
    label: string;
    category: BlockCategory;
    hasInput?: boolean;
    icon?: React.ElementType;
}

interface BlockInstance {
    id: string;
    type: string;
    content: string; // User input value
    category: BlockCategory;
}

// Modern Dark UI Colors
const CATEGORY_STYLES = {
    event: { 
        border: 'border-l-yellow-400', 
        iconColor: 'text-yellow-400',
        gradient: 'from-yellow-400/10 to-transparent'
    },
    control: { 
        border: 'border-l-orange-500', 
        iconColor: 'text-orange-500',
        gradient: 'from-orange-500/10 to-transparent'
    },
    motion: { 
        border: 'border-l-cyan-400', 
        iconColor: 'text-cyan-400',
        gradient: 'from-cyan-400/10 to-transparent'
    },
    looks: { 
        border: 'border-l-purple-400', 
        iconColor: 'text-purple-400',
        gradient: 'from-purple-400/10 to-transparent'
    },
};

const TOOLBOX_BLOCKS: BlockDefinition[] = [
    { type: 'start', label: 'On Start', category: 'event', icon: Zap },
    { type: 'loop', label: 'Loop Forever', category: 'control', icon: Repeat },
    { type: 'move', label: 'Move Steps', category: 'motion', hasInput: true, icon: Move },
    { type: 'turn', label: 'Turn Degrees', category: 'motion', hasInput: true, icon: RotateCw },
    { type: 'say', label: 'Say Message', category: 'looks', hasInput: true, icon: MessageSquare },
];

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
    const Icon = def?.icon || Command;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`
                relative flex items-center gap-3 px-4 py-3 mb-2 
                rounded-r-md rounded-l-sm bg-[#1e1e1e] border-l-[3px]
                shadow-lg cursor-grab active:cursor-grabbing touch-none
                group transition-all hover:bg-[#252525]
                ${styles.border}
                ${isDragging ? 'shadow-2xl scale-105 ring-1 ring-white/20' : ''}
            `}
        >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} opacity-20 pointer-events-none rounded-r-md`}></div>

            <GripVertical size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            
            <Icon size={18} className={`${styles.iconColor}`} />

            <div className="flex items-center gap-2 font-mono text-sm text-gray-200 select-none whitespace-nowrap flex-1">
                {block.type === 'start' && <span className="font-bold text-yellow-100">ON APP START</span>}
                
                {block.type === 'loop' && <span className="font-bold text-orange-100">WHILE (TRUE)</span>}
                
                {block.type === 'move' && (
                    <>
                        <span className="text-cyan-100">MOVE</span>
                        <input 
                            type="number" 
                            className="w-16 px-2 py-1 bg-black/50 border border-white/10 rounded text-center text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            value={block.content}
                            onChange={(e) => onChange(id, e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()} 
                        />
                        <span className="text-gray-500 text-xs">STEPS</span>
                    </>
                )}
                
                {block.type === 'turn' && (
                    <>
                        <span className="text-cyan-100">ROTATE</span>
                        <input 
                            type="number" 
                            className="w-16 px-2 py-1 bg-black/50 border border-white/10 rounded text-center text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
                            value={block.content}
                            onChange={(e) => onChange(id, e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-gray-500 text-xs">DEG</span>
                    </>
                )}
                
                {block.type === 'say' && (
                    <>
                        <span className="text-purple-100">PRINT</span>
                        <span className="text-gray-500">"</span>
                        <input 
                            type="text" 
                            className="w-32 px-2 py-1 bg-black/50 border border-white/10 rounded text-left text-purple-300 focus:outline-none focus:border-purple-500/50 transition-colors"
                            value={block.content}
                            onChange={(e) => onChange(id, e.target.value)}
                            onPointerDown={(e) => e.stopPropagation()}
                        />
                        <span className="text-gray-500">"</span>
                    </>
                )}
            </div>

            <button 
                onClick={(e) => {
                    e.stopPropagation(); 
                    onDelete(id);
                }}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

// --- Toolbox Item ---
const ToolboxBlock = ({ def, onClick }: { def: BlockDefinition, onClick: () => void }) => {
    const styles = CATEGORY_STYLES[def.category];
    const Icon = def.icon || Command;
    
    return (
        <div 
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 mb-2 rounded-r-md rounded-l-sm 
                bg-[#1a1a1a] border-l-[3px] border-l-transparent
                hover:bg-[#252525] hover:border-l-${styles.border.split('-')[2]} 
                cursor-pointer transition-all select-none group
            `}
        >
            <Icon size={16} className={`text-gray-500 group-hover:${styles.iconColor} transition-colors`} />
            <span className="font-mono text-xs font-medium text-gray-400 group-hover:text-gray-200">{def.label}</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-gray-600 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">
                ADD
            </div>
        </div>
    );
};

export default function BlockCreatePage() {
    // State
    const [blocks, setBlocks] = useState<BlockInstance[]>([
        { id: '1', type: 'start', content: '', category: 'event' },
        { id: '2', type: 'say', content: 'Hello World', category: 'looks' },
        { id: '3', type: 'move', content: '100', category: 'motion' },
    ]);
    const [generatedCode, setGeneratedCode] = useState('');

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Handlers
    const addBlock = (def: BlockDefinition) => {
        const newBlock: BlockInstance = {
            id: crypto.randomUUID(),
            type: def.type,
            content: def.hasInput ? (def.type === 'say' ? 'Hello' : '10') : '',
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

    // Generate Code (Pseudo-JavaScript)
    const generateCode = () => {
        let code = "// LOGIC FLOW\n";
        blocks.forEach(block => {
            switch(block.type) {
                case 'start': 
                    code += "app.onStart(() => {\n"; 
                    break;
                case 'loop': 
                    code += "  while(true) {\n"; 
                    break;
                case 'move': 
                    code += `    actor.move(${block.content || 0});\n`; 
                    break;
                case 'turn': 
                    code += `    actor.rotate(${block.content || 0});\n`; 
                    break;
                case 'say': 
                    code += `    console.log("${block.content}");\n`; 
                    break;
            }
        });
        if (blocks.some(b => b.type === 'start')) code += "});";
        setGeneratedCode(code);
    };

    React.useEffect(() => {
        generateCode();
    }, [blocks]);

    const runCode = () => {
        alert(`Debug Output:\n\n${blocks.map(b => {
            if(b.type === 'say') return `[LOG] ${b.content}`;
            if(b.type === 'move') return `[ACT] Moved ${b.content}px`;
            if(b.type === 'turn') return `[ACT] Rotated ${b.content}deg`;
            if(b.type === 'start') return `[SYS] Process Started`;
            return null;
        }).filter(Boolean).join('\n')}`);
    };

    return (
        <div className='min-h-screen bg-black text-white flex flex-col font-sans'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50'>
                <div className='flex items-center gap-4'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <h2 className='font-bold text-lg tracking-tight'>Logic Editor</h2>
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

                <button
                    onClick={runCode}
                    className='flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 text-sm'
                >
                    <Play className='w-4 h-4 fill-current' />
                    <span>Run</span>
                </button>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                
                {/* Toolbox (Left) */}
                <div className='w-64 bg-[#111] border-r border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5 bg-[#161616]'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Component Library</h3>
                    </div>
                    <div className='flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar'>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-2'>EVENTS & FLOW</div>
                            {TOOLBOX_BLOCKS.filter(b => ['event', 'control'].includes(b.category)).map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-2'>ACTIONS</div>
                            {TOOLBOX_BLOCKS.filter(b => ['motion', 'looks'].includes(b.category)).map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Workspace (Center) */}
                <div className='flex-1 bg-[#0a0a0a] relative flex flex-col'>
                    {/* Grid Background */}
                    <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none'></div>
                    
                    <div className='flex-1 overflow-auto p-8 relative z-0 custom-scrollbar'>
                        <div className="max-w-3xl mx-auto">
                            <DndContext 
                                sensors={sensors} 
                                collisionDetection={closestCenter} 
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext 
                                    items={blocks.map(b => b.id)} 
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className='min-h-[500px] pb-40'>
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
                                            <div className='flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-xl bg-white/5'>
                                                <Box className='w-12 h-12 text-gray-600 mb-4 opacity-50' />
                                                <p className='text-gray-500 font-mono text-sm'>No blocks added</p>
                                                <p className='text-gray-700 text-xs mt-1'>Select from library to start</p>
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {/* Code Preview (Right) */}
                <div className='w-80 bg-[#111] text-gray-300 flex flex-col border-l border-white/10'>
                    <div className='p-4 border-b border-white/5 bg-[#161616] flex justify-between items-center'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Live Preview</h3>
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    </div>
                    <div className='flex-1 overflow-auto p-4 font-mono text-xs text-green-400/90 leading-relaxed custom-scrollbar'>
                        <pre className='whitespace-pre-wrap break-all'>{generatedCode}</pre>
                    </div>
                </div>

            </div>
        </div>
    );
}