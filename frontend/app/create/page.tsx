'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Code2, Loader2, Monitor, ArrowLeft, AlignLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default function CreatePage() {
    const { user, markAsPosted } = useAuth();
    const router = useRouter();
    
    // 初期値
    const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>test1</title>
</head>
<body>
    <div class="container">
        <h1>Hello World!</h1>
        <p>Let's Start Coding</p>
    </div>
</body>
<style>
    body { 
        font-family: sans-serif;
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100vh; 
        margin: 0;
        background: #f0f0f0;
    }
    .container {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 1rem;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 { color: #3b82f6; }
</style>`);
    
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        }, 500); // 0.5秒後に反映（連打対策）

        return () => clearTimeout(timeout);
    }, [code]);

    const handleSave = async () => {
        if (!code.trim()) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'text',
                code: code,
                caption: caption,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            
            markAsPosted();
            router.push('/');
        } catch (error) {
            console.error("Error saving post:", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden relative'>
            
            {/* Header */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <div className='flex items-center gap-2'>
                        <h2 className='font-bold text-lg tracking-tight'>Create New Post</h2>
                    </div>
                </div>

                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'><Code2 className='w-4 h-4' /><span>Text</span></button>
                        <a href='/create/block' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Monitor className='w-4 h-4' /><span>Block</span></a>
                    </div>
                </div>
                
                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>{user ? 'Autosaved' : 'Guest Mode'}</div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                
                {/* 左：コードエディタ */}
                <div className='w-1/2 flex flex-col border-r border-white/10 bg-[#1e1e1e] relative group overflow-hidden'>
                    <div className='absolute top-3 right-4 z-10 text-[10px] font-bold text-gray-500 tracking-widest pointer-events-none'>HTML & CSS</div>
                    
                    <div className="flex-1 overflow-auto custom-scrollbar font-mono text-sm">
                        <Editor
                            value={code}
                            onValueChange={code => setCode(code)}
                            highlight={code => Prism.highlight(code, Prism.languages.markup, 'html')}
                            padding={24}
                            textareaClassName="focus:outline-none"
                            style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                fontSize: 14,
                                backgroundColor: 'transparent',
                                minHeight: '100%',
                            }}
                        />
                    </div>
                </div>

                {/* 右：ライブプレビュー & 保存ボタンエリア */}
                <div className='w-1/2 flex flex-col bg-[#050505]'>
                    <div className='h-10 border-b border-white/5 flex items-center px-4 justify-between bg-[#161616]'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-green-500 uppercase tracking-widest'>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Preview
                        </div>
                        <div className='text-[10px] text-gray-600 font-mono'>1920 x 1080</div>
                    </div>
                    
                    <div className='flex-1 relative bg-[url("https://grainy-gradients.vercel.app/noise.svg")] opacity-100'>
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                title="preview"
                                className="w-full h-full border-none bg-white"
                            />
                        )}
                    </div>

                    <div className='border-t border-white/10 bg-[#111] p-4 flex flex-col gap-3 shrink-0'>
                        <div className="relative">
                            <div className="absolute top-3 left-3 text-gray-500">
                                <AlignLeft size={16} />
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Add a caption to your snippet..."
                                className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 resize-none h-20 custom-scrollbar"
                            />
                        </div>

                        <div className="flex justify-end">
                             <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className='flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 transform duration-100'
                            >
                                {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                <span>{isSaving ? 'Saving...' : 'text Post'}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}