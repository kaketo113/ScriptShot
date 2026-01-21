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
    Command,
    CornerDownRight
} from 'lucide-react';

// --- Block Types & Definitions ---
type BlockCategory = 'event' | 'control' | 'motion' | 'looks';

interface BlockDefinition {
    type: string;
    label: string;
    category: BlockCategory;
    hasInput?: boolean;
    icon?: React.ElementType;
    isWrapper?: boolean; // C-shape block (like Loop)
}

interface BlockInstance {
    id: string;
    type: string;
    content: string;
    category: BlockCategory;
    parentId?: string | null; // For nesting (future implementation)
}

// Visual Config
const BLOCK_HEIGHT = 42;
const INDENT_SIZE = 16;

const CATEGORY_STYLES = {
    event: { 
        bg: 'bg-[#EAB308]', // Yellow-500
        border: 'border-[#CA8A04]',
        shadow: 'shadow-yellow-900/20'
    },
    control: { 
        bg: 'bg-[#F97316]', // Orange-500
        border: 'border-[#EA580C]',
        shadow: 'shadow-orange-900/20'
    },
    motion: { 
        bg: 'bg-[#06B6D4]', // Cyan-500
        border: 'border-[#0891B2]',
        shadow: 'shadow-cyan-900/20'
    },
    looks: { 
        bg: 'bg-[#A855F7]', // Purple-500
        border: 'border-[#9333EA]',
        shadow: 'shadow-purple-900/20'
    },
};

const TOOLBOX_BLOCKS: BlockDefinition[] = [
    { type: 'start', label: 'Start', category: 'event', icon: Zap },
    { type: 'loop', label: 'Forever', category: 'control', icon: Repeat, isWrapper: true },
    { type: 'if', label: 'If', category: 'control', icon: Command, isWrapper: true },
    { type: 'move', label: 'Move', category: 'motion', hasInput: true, icon: Move },
    { type: 'turn', label: 'Turn', category: 'motion', hasInput: true, icon: RotateCw },
    { type: 'say', label: 'Say', category: 'looks', hasInput: true, icon: MessageSquare },
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
    const Icon = def?.icon || Command;
    const isWrapper = def?.isWrapper; // C-shape check

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
                ${block.type === 'start' ? 'rounded-t-xl mt-4 !border-t-0' : ''}
            `}>
                {/* Notch Visuals */}
                {block.type !== 'start' && <TopNotch className="text-black/20" />} {/* Shadow for depth */}
                {block.type !== 'start' && <TopNotch className={styles.bg} />}
                
                {!isWrapper && <BottomNotch className="text-black/20 translate-y-[1px]" />}
                {!isWrapper && <BottomNotch className={styles.bg} />}

                {/* Content */}
                <div className="flex items-center gap-2 w-full">
                    <Icon size={16} className="text-white/90" />
                    <span className="font-bold text-xs tracking-wide">{def?.label}</span>

                    {/* Input Fields */}
                    {def?.hasInput && (
                        <div className="flex items-center gap-1 bg-black/20 rounded px-1 py-0.5 mx-1 shadow-inner border border-black/10">
                            <input 
                                type="text" 
                                className="w-12 bg-transparent text-center text-xs font-mono text-white focus:outline-none placeholder-white/50"
                                value={block.content}
                                onChange={(e) => onChange(id, e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>

                {/* Delete Button (Hover) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(id); }}
                    className="ml-auto p-1 text-white/50 hover:text-white hover:bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Trash2 size={12} />
                </button>
            </div>

            {/* C-Shape Wrapper Visuals (Bottom Arm) */}
            {isWrapper && (
                <div className="ml-3 pl-3 border-l-[12px] border-l-inherit min-h-[30px] flex flex-col justify-end relative" style={{ borderColor: 'inherit' }}>
                    {/* The connector bar color needs to match block color. 
                        Since we can't easily inherit tailwind colors in style prop without mapping,
                        we use a trick or mapping. Here we rely on the parent div's color context.
                    */}
                    <div className={`absolute inset-y-0 left-0 w-3 ${styles.bg} opacity-50`}></div>
                    
                    {/* The closing bottom piece of the C-shape */}
                    <div className={`
                        relative h-6 w-24 ${styles.bg} rounded-b-sm rounded-tr-sm
                        flex items-center px-2 text-[10px] text-white/70 font-mono mt-0.5
                    `}>
                        <TopNotch className={styles.bg} />
                        <BottomNotch className={styles.bg} />
                        <span className="ml-4 opacity-50">end</span>
                    </div>
                </div>
            )}
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
                flex items-center gap-2 px-3 py-2 mb-2 
                ${styles.bg} text-white rounded-sm shadow-sm
                cursor-pointer transition-transform hover:scale-105 hover:brightness-110
                select-none relative
            `}
        >
            {/* Pseudo Notches for Preview */}
            <div className="absolute -top-[3px] left-3 w-3 h-[3px] bg-inherit rounded-t-sm opacity-50"></div>
            <div className="absolute -bottom-[3px] left-3 w-3 h-[3px] bg-inherit rounded-b-sm shadow-sm"></div>

            <Icon size={16} className="text-white/90" />
            <span className="font-bold text-xs">{def.label}</span>
        </div>
    );
};

export default function BlockCreatePage() {
    const [blocks, setBlocks] = useState<BlockInstance[]>([
        { id: '1', type: 'start', content: '', category: 'event' },
        { id: '2', type: 'loop', content: '', category: 'control' },
        { id: '3', type: 'move', content: '10', category: 'motion' },
        { id: '4', type: 'say', content: 'Hello', category: 'looks' },
    ]);
    const [generatedCode, setGeneratedCode] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const addBlock = (def: BlockDefinition) => {
        const newBlock: BlockInstance = {
            id: crypto.randomUUID(),
            type: def.type,
            content: def.hasInput ? '10' : '',
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

    // Code Generation Logic
    const generateCode = () => {
        let code = "// LOGIC FLOW\n";
        let indent = "";
        
        blocks.forEach(block => {
            // Simple Indent Logic based on previous block type
            // (Real implementation would need a tree structure)
            
            switch(block.type) {
                case 'start': 
                    code += "onStart(() => {\n"; 
                    indent = "  ";
                    break;
                case 'loop': 
                    code += `${indent}while(true) {\n`; 
                    indent += "  ";
                    break;
                case 'if':
                    code += `${indent}if (condition) {\n`;
                    indent += "  ";
                    break;
                case 'move': 
                    code += `${indent}actor.move(${block.content || 0});\n`; 
                    break;
                case 'turn': 
                    code += `${indent}actor.rotate(${block.content || 0});\n`; 
                    break;
                case 'say': 
                    code += `${indent}console.log("${block.content}");\n`; 
                    break;
            }
        });
        
        // Close brackets (Pseudo)
        code += "});";
        setGeneratedCode(code);
    };

    React.useEffect(() => {
        generateCode();
    }, [blocks]);

    const runCode = () => {
        alert("Running Code...");
    };

    return (
        <div className='min-h-screen bg-[#111] text-white flex flex-col font-sans'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50'>
                <div className='flex items-center gap-4'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <h2 className='font-bold text-lg tracking-tight text-gray-200'>Logic Editor</h2>
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
                    className='flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-bold transition-all shadow-lg active:scale-95 text-sm'
                >
                    <Play className='w-4 h-4 fill-current' />
                    <span>Run</span>
                </button>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                
                {/* Toolbox */}
                <div className='w-64 bg-[#161616] border-r border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Blocks</h3>
                    </div>
                    <div className='flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar'>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-1'>EVENT & CONTROL</div>
                            {TOOLBOX_BLOCKS.filter(b => ['event', 'control'].includes(b.category)).map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                        <div>
                            <div className='text-[10px] font-bold text-gray-600 mb-3 px-1'>ACTIONS</div>
                            {TOOLBOX_BLOCKS.filter(b => ['motion', 'looks'].includes(b.category)).map(b => (
                                <ToolboxBlock key={b.type} def={b} onClick={() => addBlock(b)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Workspace */}
                <div className='flex-1 bg-[#0f0f0f] relative flex flex-col'>
                    {/* Dot Grid Background */}
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
                                <div className='min-h-[600px] pb-40 max-w-2xl'>
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
                                            <p className='text-gray-400 font-bold'>Workspace Empty</p>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className='w-80 bg-[#161616] border-l border-white/10 flex flex-col'>
                    <div className='p-4 border-b border-white/5 flex justify-between items-center'>
                        <h3 className='text-[10px] font-bold text-gray-500 uppercase tracking-widest'>Code Output</h3>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className='flex-1 p-4 font-mono text-xs text-blue-300 leading-relaxed overflow-auto'>
                        <pre>{generatedCode}</pre>
                    </div>
                </div>

            </div>
        </div>
    );
}