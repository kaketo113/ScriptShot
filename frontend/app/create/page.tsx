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

        return (
            <div className='min-h-screen bg-black text-white flex flex-col'>

                <main className='flex-1 min-h-screen flex flex-col'>

                    {/* header */} 
                    <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]'>
                        <div className='flex items-center gap-4'>
                            <Link href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                                <ArrowLeft className='w-5 h-5' />
                            </Link>
                            <h2 className='font-bold text-lg'>Create New Post</h2>
                        </div>

                        {/* モード切替 */}
                        <div className='flex bg-[#161616] p-1 rounded-lg'>
                            <button
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg`}
                            >
                                <Code2 className='w-4 h-4' />
                                <span>Text</span>
                            </button>
                            <button
                                onClick={switchToBlockMode}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5`}
                            >
                                <Box className='w-4 h-4' />Block
                            </button>
                        </div>

                        <div className='w-40 flex justify-end'>
                            {/* TODO:下書き保存 */}
                        </div>
                    </header>

                    
                </main>
            </div>
        )