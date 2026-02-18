'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Code2, Loader2, Monitor, ArrowLeft, AlignLeft, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default function CreatePage() {
    const { user } = useAuth();
    const router = useRouter();
    
    // 初期値
    const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo</title>
</head>
<body>
    <div class="card">
        <h1>Hello World!</h1>
        <p>コードを書いて、リアルタイムに確認しよう。</p>
        <button>Click Me</button>
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
    .card {
        text-align: center;
        padding: 3rem;
        background: white;
        border-radius: 1.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    h1 { color: #2563eb; margin-bottom: 1rem; }
    p { color: #666; margin-bottom: 2rem; }
    button {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 999px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.1s;
    }
    button:active { transform: scale(0.95); }
</style>`);
    
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // 離脱確認モーダルの状態管理
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPath, setPendingPath] = useState<string>('/');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
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
                caption: caption,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });
            
            setIsDirty(false);
            router.push('/');
        } catch (error) {
            console.error("Error saving post:", error);
            alert("投稿に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    // 画面遷移時のチェック関数
    const handleNavigation = (path: string) => {
        if (isDirty) {
            setPendingPath(path);
            setShowConfirmModal(true);
        } else {
            router.push(path);
        }
    };

    // モーダルで「移動する」を選んだ時
    const confirmNavigation = () => {
        setShowConfirmModal(false);
        router.push(pendingPath);
    };

    return (
        <div className='h-screen w-full bg-[#F9FAFB] text-gray-900 flex flex-col font-sans overflow-hidden'>
            
            {/* Header */}
            <header className='h-16 px-6 flex items-center justify-between bg-white/80 backdrop-blur-sm z-50 shrink-0 border-b border-gray-100'>
                <div className='flex items-center gap-4'>
                    <button onClick={() => handleNavigation('/')} className='text-gray-500 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full'>
                        <ArrowLeft className='w-5 h-5' />
                    </button>
                    <div className='flex items-center gap-2'>
                        <Code2 size={20} className='text-blue-600'/>
                        <h2 className='font-bold text-lg tracking-tight'>コードエディタ</h2>
                    </div>
                </div>

                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all bg-white text-blue-600 shadow-sm font-bold border border-gray-100'><Code2 className='w-4 h-4' /><span>コード</span></button>
                        <button 
                            onClick={() => handleNavigation('/create/block')}
                            className='flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm transition-all text-gray-500 hover:text-gray-900 hover:bg-white/50 font-medium'
                        >
                            <Monitor className='w-4 h-4' /><span>ブロック</span>
                        </button>
                    </div>
                </div>
                
                <div className='flex items-center gap-3'>
                    <div className='text-xs text-gray-400 font-medium'>{user ? '自動保存なし' : 'ゲストモード'}</div>
                </div>
            </header>

            {/* Main Content */}
            <div className='flex-1 flex overflow-hidden p-4 md:p-6 gap-4 md:gap-6'>
                
                {/* 左：コードエディタ */}
                <div className='w-1/2 flex flex-col bg-[#1e1e1e] rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden relative group transition-all hover:shadow-2xl'>
                    <div className='absolute top-4 right-6 z-10 text-[10px] font-bold text-gray-500 tracking-widest pointer-events-none bg-[#1e1e1e]/80 backdrop-blur px-2 py-1 rounded-full border border-white/5'>
                        HTML & CSS
                    </div>
                    
                    <div className="flex-1 overflow-auto custom-scrollbar font-mono text-sm pt-2">
                        <Editor
                            value={code}
                            onValueChange={newCode => {
                                setCode(newCode);
                                setIsDirty(true);
                            }}
                            highlight={code => Prism.highlight(code, Prism.languages.markup, 'html')}
                            padding={24}
                            textareaClassName="focus:outline-none"
                            style={{
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                fontSize: 14,
                                backgroundColor: 'transparent',
                                minHeight: '100%',
                                color: '#f8f8f2',
                            }}
                        />
                    </div>
                </div>

                {/* 右：ライブプレビュー & 保存 */}
                <div className='w-1/2 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl'>
                    <div className='h-12 border-b border-gray-100 flex items-center px-6 justify-between bg-white'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest'>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            プレビュー
                        </div>
                        <div className='text-[10px] text-gray-400 font-mono'>1920 x 1080</div>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 relative">
                        {previewUrl && (
                            <iframe
                                src={previewUrl}
                                title="preview"
                                className="w-full h-full border-none"
                            />
                        )}
                    </div>

                    <div className='border-t border-gray-100 bg-white p-5 flex flex-col gap-4 shrink-0'>
                        <div className="relative">
                            <div className="absolute top-3 left-3 text-gray-400">
                                <AlignLeft size={16} />
                            </div>
                            <textarea
                                value={caption}
                                onChange={(e) => {
                                    setCaption(e.target.value);
                                    setIsDirty(true); // キャプション変更時もフラグを立てる
                                }}
                                placeholder="作品の説明を入力してください..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 resize-none h-16 custom-scrollbar transition-all focus:bg-white focus:shadow-sm"
                            />
                        </div>

                        <div className="flex justify-end">
                             <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className='flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 active:scale-95 hover:shadow-blue-500/40'
                            >
                                {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                <span>{isSaving ? '保存中...' : '投稿する'}</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* 離脱確認モーダル */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform scale-100 transition-all">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">このページを離れますか？</h3>
                            <p className="text-sm text-gray-500">
                                作成内容は破棄されます。<br />本当によろしいですか？
                            </p>
                            <div className="flex gap-3 w-full mt-4">
                                <button 
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    キャンセル
                                </button>
                                <button 
                                    onClick={confirmNavigation}
                                    className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30"
                                >
                                    破棄して移動
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}