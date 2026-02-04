'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Play, Image as ImageIcon, Loader2, Code2, Box, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '../../context/AuthContext';

const highlightHTML = (code: string) => {
    if (!code) return [];
    const regex = /(<!--[\s\S]*?-->)|(<style>[\s\S]*?<\/style>)|(<\/?[a-z0-9-]+)|("[^"]*")|(>)|([^<]+)/gi;
    const tokens = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(code)) !== null) {
        const [fullMatch, comment, styleBlock, tag, attrValue, closeBracket, text] = match;
        const key = match.index;
        if (match.index > lastIndex) tokens.push(<span key={`gap-${lastIndex}`} className="text-gray-300">{code.slice(lastIndex, match.index)}</span>);
        if (comment) tokens.push(<span key={key} className="text-gray-500 italic">{fullMatch}</span>);
        else if (styleBlock) {
            const inner = fullMatch.replace(/<\/?style>/g, '');
            tokens.push(<span key={key}><span className="text-blue-400">&lt;style&gt;</span><span className="text-yellow-200">{inner}</span><span className="text-blue-400">&lt;/style&gt;</span></span>);
        } else if (tag) tokens.push(<span key={key} className="text-blue-400 font-semibold">{fullMatch}</span>);
        else if (attrValue) tokens.push(<span key={key} className="text-orange-300">{fullMatch}</span>);
        else if (closeBracket) tokens.push(<span key={key} className="text-blue-400">{fullMatch}</span>);
        else if (text) tokens.push(<span key={key} className="text-gray-100">{fullMatch}</span>);
        lastIndex = regex.lastIndex;
    }
    return tokens;
};

export default function CreatePage() {
    const [code, setCode] = useState(`<!-- HTML/CSSを入力 -->
<div class="container">
    <h1>Hello, ScriptShot!</h1>
    <p>Code generated preview.</p>
</div>

<style>
    body { 
        font-family: sans-serif;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        margin: 0; 
        background: #fff;
    }
    .container {
        text-align: center;
        padding: 2rem;
        border: 2px dashed #3b82f6;
        border-radius: 1rem;
    }
    h1 { color: #3b82f6; }
</style>`);

    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false); 
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { user } = useAuth();

    const runCode = useCallback(() => {
        if (!code) return;
        setIsRunning(true);
        setTimeout(() => {
            try {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                const blob = new Blob([code], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                setPreviewUrl(url);
            } catch (error) {
                console.error('Preview Error:', error);
            } finally {
                setIsRunning(false);
            }
        }, 600);
    }, [code, previewUrl]);

    const handlePost = async () => {
        if (!code) return;

        setIsSaving(true);
        try {
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user", 
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'text',
                code: code,
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

    const lineNumbers = useMemo(() => code.split('\n').map((_, i) => i + 1), [code]);
    const highlightedCode = useMemo(() => highlightHTML(code), [code]);

    return (
        <div className='min-h-screen bg-black text-white flex flex-col font-sans'>
            <main className='flex-1 min-h-screen flex flex-col'>
                
                <header className='h-16 border-b border-white/10 flex items-center px-6 bg-[#0a0a0a] sticky top-0 z-50 relative'>
                    <div className='flex items-center gap-4 z-10'>
                        <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                            <ArrowLeft className='w-5 h-5' />
                        </a>
                        <h2 className='font-bold text-lg tracking-tight'>Create New Post</h2>
                    </div>

                    <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                        <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                            <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'>
                                <Code2 className='w-4 h-4' />
                                <span>Text</span>
                            </button>
                            <a href='/create/block' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'>
                                <Box className='w-4 h-4' />
                                <span>Block</span>
                            </a>
                        </div>
                    </div>

                    <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                        <div className='text-xs text-gray-500'>
                            {user ? 'Autosaved' : 'Guest Mode'}
                        </div>
                    </div>
                </header>

                <div className='flex-1 flex overflow-hidden'>
                    <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#1e1e1e]'>
                        <div className='flex-1 relative overflow-hidden flex'>
                            <div className='w-12 bg-[#1e1e1e] border-r border-white/5 flex flex-col items-end pt-4 pr-3 text-gray-600 font-mono text-sm select-none leading-relaxed z-10'>
                                {lineNumbers.map(num => (<div key={num} className='h-6'>{num}</div>))}
                            </div>
                            <div className='flex-1 relative overflow-auto custom-scrollbar'>
                                <div className='absolute top-0 right-4 bg-[#2d2d2d] text-[10px] text-gray-400 px-3 py-1 rounded-b-md z-30 font-mono border-x border-b border-white/5 pointer-events-none'>HTML / CSS</div>
                                <div className='relative min-h-full font-mono text-sm' style={{ minWidth: '100%' }}>
                                    <pre aria-hidden="true" className='absolute inset-0 m-0 p-4 pt-4 pointer-events-none whitespace-pre-wrap break-all z-0' style={{ lineHeight: '1.5rem', fontFamily: 'Menlo, Monaco, Consolas, monospace' }}>
                                        {highlightedCode}<br />
                                    </pre>
                                    <textarea
                                        className='absolute inset-0 w-full h-full bg-transparent text-transparent p-4 pt-4 resize-none focus:outline-none z-10 overflow-hidden'
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        spellCheck={false}
                                        style={{ lineHeight: '1.5rem', caretColor: 'white', fontFamily: 'Menlo, Monaco, Consolas, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='h-32 border-t border-white/10 p-4 bg-[#161616] z-20'>
                            <textarea className='w-full h-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none leading-relaxed' placeholder='Write a caption...' />
                        </div>
                    </div>

                    <div className='w-1/2 bg-[#050505] flex flex-col'>
                        <div className='flex-1 flex items-center justify-center relative overflow-hidden bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] p-8'>
                            {previewUrl ? (
                                <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className='relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-white'>
                                    <div className='h-8 bg-[#f1f1f1] flex items-center px-3 gap-1.5 border-b border-gray-300'>
                                        <div className='w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]'></div>
                                        <div className='w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]'></div>
                                        <div className='w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]'></div>
                                        <div className='ml-2 h-5 flex-1 bg-white border border-gray-200 rounded text-[10px] flex items-center px-2 text-gray-400 font-sans truncate'>localhost:3000/preview</div>
                                    </div>
                                    <iframe src={previewUrl} className='w-full h-[calc(100%-2rem)] bg-white' sandbox="allow-scripts" title="Preview" />
                                </motion.div>
                            ) : (
                                <div className='text-center text-gray-600 select-none'>
                                    <div className='w-24 h-24 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'><ImageIcon className='w-10 h-10 opacity-30' /></div>
                                    <p className='text-sm font-medium text-gray-500'>Run code to generate preview</p>
                                </div>
                            )}
                        </div>

                        <div className='h-20 border-t border-white/10 flex items-center justify-between px-8 bg-[#111] z-20'>
                            <button onClick={runCode} disabled={isRunning} className='flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 transform duration-100'>
                                {isRunning ? <Loader2 className='w-4 h-4 animate-spin' /> : <Play className='w-4 h-4 fill-current' />}
                                <span>Run Code</span>
                            </button>

                            <button
                                onClick={handlePost}
                                disabled={!previewUrl || isSaving}
                                className='flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 transform duration-100'
                            >
                                {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                <span>{isSaving ? 'Posting...' : 'Post Creation'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}