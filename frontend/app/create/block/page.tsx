'use client';

import React, { useState } from 'react';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent
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
    Type, 
    Image as ImageIcon, 
    Square, 
    GripVertical, 
    Trash2, 
    ArrowLeft, 
    Code2, 
    Box, 
    Play,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
type BlockType = 'heading' | 'text' | 'image' | 'button';

interface BlockItem {
    id: string;
    type: BlockType;
    content: string;
}

interface SidebarItemProps {
    type: BlockType;
    label: string;
    icon: React.ElementType;
}

//ツールボックスのアイテム
const SidebarItem = ({ type, label, icon: Icon, onClick }: SidebarItemProps & { onClick: () => void }) => (
    <div 
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg cursor-pointer hover:bg-[#333] hover:scale-[1.02] transition-all border border-transparent hover:border-white/10 group select-none active:scale-95"
    >
        <div className="p-2 bg-black/30 rounded-md text-gray-400 group-hover:text-white transition-colors">
            <Icon size={18} />
        </div>
        <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>
        <div className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-gray-500 bg-black/50 px-2 py-0.5 rounded">
            Add
        </div>
    </div>
);

// --- Sortable Item (キャンバス上のブロック) ---
const SortableBlock =({ id, type, content, onDelete, onChange }: { id: string, type: BlockType, content: string, onDelete: (id: string) => void, onChange: (id: string, val: string) => void }) => {
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
        opacity: isDragging ? 0.5 : 1,
    };

    return(
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`relative group bg-[#1a1a1a] rounded-lg border border-white/5 hover:border-blue-500/50 transition-colors mb-3 ${isDragging ? 'shadow-xl ring-2 ring-blue-500' : ''}`}
        >
            {/* Drag Handle (つまみ) */}
            <div 
                {...attributes} 
                {...listeners}
                className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-l-lg touch-none"
            >
                <GripVertical size={14} />
            </div>

            {/* Content Area (入力エリア) */}
            <div className="pl-10 pr-12 py-4">
                {type === 'heading' && (
                    <input 
                        type="text" 
                        value={content}
                        onChange={(e) => onChange(id, e.target.value)}
                        className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-600 focus:outline-none"
                        placeholder="Heading Title"
                    />
                )}
                {type === 'text' && (
                    <textarea 
                        value={content}
                        onChange={(e) => onChange(id, e.target.value)}
                        className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-600 focus:outline-none resize-none field-sizing-content min-h-[60px]"
                        placeholder="Enter text here..."
                    />
                )}
                {type === 'button' && (
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md opacity-80 pointer-events-none">
                            Button
                        </div>
                        <input 
                            type="text" 
                            value={content}
                            onChange={(e) => onChange(id, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none border-b border-white/10 focus:border-blue-500 px-2 py-1"
                            placeholder="Button Label"
                        />
                    </div>
                )}
                {type === 'image' && (
                    <div className="p-4 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center text-gray-500 gap-2 bg-black/20">
                        <ImageIcon size={24} />
                        <span className="text-xs">Image Placeholder</span>
                    </div>
                )}
            </div>

            {/* Delete Button */}
            <button 
                onClick={() => onDelete(id)}
                className="absolute right-3 top-3 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

export default function BlockCreatePage() {
    const [blocks, setBlocks] = useState<BlockItem[]>([
        { id: '1', type: 'heading', content: 'Welcome to ScriptShot' },
        { id: '2', type: 'text', content: 'This is a block-based editor. Drag items from the left or reorder blocks here.' },
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // DnD Sensors (ドラッグ操作の検知設定)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // 5px動かしたらドラッグ開始
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Handlers
    const addBlock = (type: BlockType) => {
        const newBlock: BlockItem = {
            id: crypto.randomUUID(),
            type,
            content: type === 'heading' ? 'New Heading' : type === 'button' ? 'Click Me' : ''
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

    //プレビュー用画面
    const generateHTML = () => {
        const bodyContent = blocks.map(block => {
            switch(block.type) {
                case 'heading': return `<h2 class="text-2xl font-bold mb-4 text-gray-800">${block.content}</h2>`;
                case 'text': return `<p class="mb-4 text-gray-600 leading-relaxed">${block.content}</p>`;
                case 'button': return `<button class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">${block.content}</button>`;
                case 'image': return `<div class="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4 border-2 border-dashed border-gray-300">Image Placeholder</div>`;
                default: return '';
            }
        }).join('\n');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>body { font-family: sans-serif; padding: 2rem; }</style>
            </head>
            <body>
                <div class="max-w-2xl mx-auto">
                    ${bodyContent}
                </div>
            </body>
            </html>
        `;
    };

    const runPreview = () => {
        setIsRunning(true);
        setTimeout(() => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const blob = new Blob([generateHTML()], { type: 'text/html' });
            setPreviewUrl(URL.createObjectURL(blob));
            setIsRunning(false);
        }, 500);
    };
}