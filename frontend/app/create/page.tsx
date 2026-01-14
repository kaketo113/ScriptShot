'use client';

import React, { useState } from 'react';
import { Play, Image as ImageIcon, Loader2, Code2, Box, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { h1 } from 'framer-motion/client';

export default function CreatePage() {
    const router = useRouter();
    const [code, setCode] = useState(`<!-- ここにコードを入力 -->
        <h1>Hello, ScriptShot!</h1>
        <style>
            h1 { color: blue; }
        </style>`);
        
        const [isRunning, setIsRunning] = useState(false);
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);
        const [mode, setMode] = useState<'text' | 'block'>('text');

        // ダミー実行処理
        const runCode = () => {
            setIsRunning(true);
            setTimeout(() => {
                setIsRunning(false);
            }, 2000);
        };

        const switchToBlockMode = () => {
            router.push('/create/block');
        };