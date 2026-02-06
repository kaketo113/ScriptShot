'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Play, Save, Code2, Loader2, Monitor } from 'lucide-react';

export default function CreatePage() {
    const { user } = useAuth();
    // デフォルトのコード（日本語テスト用）
    const [code, setCode] = useState(`<div class="container">
  <h1>Hello World!</h1>
  <p>Let's START!!</p>
</div>

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

    // コードが変わるたびにプレビューを更新
    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                    <meta charset="UTF-8"> <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        /* プレビュー内の基本リセット */
                        body { margin: 0; padding: 0; }
                    </style>
                </head>
                <body>
                    ${code}
                </body>
                </html>
            `);
        }, 500); // 0.5秒のデバウンス（入力のたびにチラつかないように）

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
            window.location.href = '/';
        } catch (error) {
            console.error("Error saving post:", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 flex flex-col h-screen'>
                {/* ヘッダー */}
                <header className='h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0'>
                    <div className='flex items-center gap-2 text-gray-400'>
                        <Code2 size={18} />
                        <span className='text-sm font-mono'>Create New Snippet</span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                            <button className='flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all bg-blue-600 text-white font-bold shadow-lg'><Code2 className='w-3 h-3' /><span>Text</span></button>
                            <a href='/create/block' className='flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Monitor className='w-3 h-3' /><span>Block</span></a>
                        </div>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className='flex items-center gap-2 px-4 py-1.5 bg-white text-black hover:bg-gray-200 rounded-md text-xs font-bold transition-colors disabled:opacity-50'
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </header>

                {/* メインエリア（2カラム） */}
                <div className='flex-1 flex overflow-hidden'>
                    
                    {/* 左：コードエディタ */}
                    <div className='w-1/2 flex flex-col border-r border-white/10 bg-[#0a0a0a] relative group'>
                        <div className='absolute top-3 right-4 z-10 text-[10px] font-bold text-gray-600 tracking-widest pointer-events-none group-hover:text-gray-400 transition-colors'>SOURCE CODE</div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className='flex-1 w-full h-full bg-transparent text-gray-300 font-mono text-sm p-6 focus:outline-none resize-none custom-scrollbar leading-relaxed'
                            placeholder="Here goes your HTML & CSS..."
                            spellCheck={false}
                        />
                    </div>

                    {/* 右：ライブプレビュー */}
                    <div className='w-1/2 flex flex-col bg-[#111] relative'>
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
                            <iframe
                                srcDoc={srcDoc}
                                title="preview"
                                className='w-full h-full border-none bg-white'
                                sandbox="allow-scripts"
                            />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}