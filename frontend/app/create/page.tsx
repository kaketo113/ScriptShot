'use client';

import React, { useState, useEffect } from 'react';
// Sidebarのインポートは削除
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Code2, Loader2, Box, ArrowLeft } from 'lucide-react'; // ArrowLeftを追加
import { useRouter } from 'next/navigation';

// --- エディタ用ライブラリ ---
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default function CreatePage() {
    const { user, markAsPosted } = useAuth();
    const router = useRouter();
    
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
    
    const [srcDoc, setSrcDoc] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>body { margin: 0; padding: 0; }</style>
                </head>
                <body>
                    ${code}
                </body>
                </html>
            `);
        }, 500);
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
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            markAsPosted();
            router.push('/')
        } catch (error) {
            console.error("Error saving post:", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        // サイドバー用のレイアウトをやめ、ブロックモードと同じ全画面構成に変更
        <div className='h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden relative'>
            
            {/* Header: ブロックモードと高さを合わせる (h-16) */}
            <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                {/* 左側: 戻るボタン + タイトル */}
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </a>
                    <div className='flex items-center gap-2'>
                        <h2 className='font-bold text-lg tracking-tight'>Create New Snippet</h2>
                    </div>
                </div>

                {/* 中央: モード切り替えスイッチ (絶対配置で中央寄せ) */}
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'><Code2 className='w-4 h-4' /><span>Text</span></button>
                        <a href='/create/block' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Box className='w-4 h-4' /><span>Block</span></a>
                    </div>
                </div>

                {/* 右側: ステータス表示 */}
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
                    {/* プレビューヘッダー */}
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
                    
                    {/* プレビュー本体 */}
                    <div className='flex-1 relative bg-[url("https://grainy-gradients.vercel.app/noise.svg")] opacity-100'>
                        <iframe
                            srcDoc={srcDoc}
                            title="preview"
                            className='w-full h-full border-none bg-white'
                            sandbox="allow-scripts"
                        />
                    </div>

                    {/* 保存ボタンエリア (ブロックモードに合わせて下に配置) */}
                    <div className='h-20 border-t border-white/10 flex items-center justify-end px-8 bg-[#111] shrink-0'>
                         <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className='flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-md hover:bg-blue-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20 active:scale-95 transform duration-100'
                        >
                            {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                            <span>{isSaving ? 'Saving...' : 'Text Post'}</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}