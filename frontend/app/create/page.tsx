'use client';

import React, { useState, useCallback } from 'react';
import { Play, Image as ImageIcon, Loader2, Code2, Box, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatePage() {
    const [code, setCode] = useState(`<!-- HTML/CSSを入力 -->
<div class="container">
    <h1>Hello, World!</h1>
    <p>Code generated preview</p>
</div>

<style>
    body {
        font-family: sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        background-color: #fff;
    }
    .container {
        text-align: center;
        padding: 2rem;
        border: 2px dashed #3b82f6;
        border-radius: 1rem;
    }
    h1 {
        color: #3b82f6;
    }
</style>`);
        
        const [isRunning, setIsRunning] = useState(false);
        const [previewUrl, setPreviewUrl] = useState<string | null>(null);

        // コード実行処理
        const runCode = useCallback(() => {
            if (!code) return;

            setIsRunning(true);

            setTimeout(() => {
                try {
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                    }

                    const blob = new Blob([code], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);

                    setPreviewUrl(url);
                } catch (error) {
                    console.error('Preview generation failed:', error);
                } finally {
                    setIsRunning(false);
                }
            }, 600);
        }, [code, previewUrl]);

        const lineNumbers = code.split('\n').map((_, i) => i + 1);// 行番号生成

        return (
            <div className='min-h-screen bg-black text-white flex flex-col font-sans'>
            
                <main className='flex-1 min-h-screen flex flex-col'>

                    {/* header */} 
                    <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] sticky top-0 z-50'>
                        <div className='flex items-center gap-4'>
                            <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                                <ArrowLeft className='w-5 h-5' />
                            </a>
                            <h2 className='font-bold text-lg tracking-tight'>Create New Post</h2>
                        </div>

                        {/* モード切替 */}
                        <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                            <button
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium`}
                            >
                                <Code2 className='w-4 h-4' />
                                <span>Text</span>
                            </button>
                            <button
                                onClick={() => console.log('Switch to block mode')}
                                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium`}
                            >
                                <Box className='w-4 h-4' />
                                <span>Block</span>
                            </button>
                        </div>

                        <div className='w-40 flex justify-end'>
                            {/* TODO:下書き保存 */}
                        </div>
                    </header>

                    <div className='flex-1 flex overflow-hidden'>

                        {/* エディタ部分 */}
                        <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#111]'>
                            <div className='flex-1 relative group'>
                                <div className='absolute top-0 right-0 bg-[#222] text-xs text-gray-400 px-3 py-1 rounded-bl-lg border-b border-l border-white/5 z-10'>
                                    HTML / CSS
                                </div>
                                <textarea
                                    className='w-full h-full bg-transparent text-gray-300 font-mono text-sm p-6 resize-none focus:outline-none leading-relaxed'
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck={false}
                                    placeholder='Write your code here...'
                                />
                                <div className='absolute top-6 left-0 w-8 text-right text-gray-700 font-mono text-sm select-none pointer-events-none opacity-50'>
                                    1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9<br />10<br />11<br />12<br />13<br />14<br />15<br />16<br />17<br />18<br />19<br />20
                                </div>
                            </div>

                            {/* キャプション */}
                            <div className='h-40 border-t border-white/10 p-4 bg-[#161616]'>
                                <textarea
                                    className='w-full h-full bg-transparent text-sm text-white placeholder-gray-500 resize-none focus:outline-none'
                                    placeholder='キャプションを追加...'
                                />
                            </div>
                        </div>

                        {/* プレビュー部分 */}
                        <div className='w-1/2 bg-[#050505] flex flex-col'>
                            <div className='flex-1 flex items-center justify-center relative overflow-hidden p-8'>

                                {/* プレビュー内容 */}
                                {previewUrl ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className='relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-white'
                                    >
                                        <div className='h-8 bg-[#f0f0f0] flex items-center px-3 gap-1.5 border-b border-gray-300'>
                                            <div className='w-2.5 h-2.5 rounded-full bg-red-400'></div>
                                            <div className='w-2.5 h-2.5 rounded-full bg-yellow-400'></div>
                                            <div className='w-2.5 h-2.5 rounded-full bg-green-400'></div>
                                            <div className='ml-2 h-5 w-2/3 bg-white border border-gray-200 rounded text-[10px] flex items-center px-2 text-gray-400 font-sans'>localhost:3000</div>
                                        </div>
                                        {/* 実行結果 */}
                                        <img src={previewUrl} alt="Preview" className='w-full h-full object-cover' />
                                    </motion.div>
                                ) : (
                                    <div className='text-center text-gray-600'>
                                        <div className='w-20 h-20 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner'>
                                            <ImageIcon className='w-8 h-8 opacity-40' />
                                        </div>
                                        <p className='text-sm font-medium'>コードを実行してプレビューを表示</p>
                                        <p className='text-xs text-gray-700 mt-2'>Code Snap Technology</p>
                                    </div>
                                )}
                            </div>

                            {/* アクションバー */}
                            <div className='h-20 border-t border-white/10 flex items-center justify-between px-8 bg-[#111]'>
                                <button
                                    onClick={runCode}
                                    disabled={isRunning}
                                    className='flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                                >
                                    {isRunning ? <Loader2 className='w-5 h-5 animate-spin' /> : <Play className='w-5 h-5 fill-current' />}
                                    Run Code
                                </button>

                                <button
                                    disabled={!previewUrl}
                                    className='px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20'
                                >
                                    Post
                                </button>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        );
}