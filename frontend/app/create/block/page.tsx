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

    
}