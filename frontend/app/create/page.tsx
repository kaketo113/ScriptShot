'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Save, Code2, Loader2, Monitor, ArrowLeft, AlignLeft, HelpCircle, AlertTriangle, Maximize } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toJpeg } from 'html-to-image';

import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/themes/prism-tomorrow.css';

export default function CreatePage() {
    const { user } = useAuth();
    const router = useRouter();
    
    const [code, setCode] = useState(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Demo</title>
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>Hello World!</h1>
            <p>コードを書いて、リアルタイムで確認しよう。</p>
            <button class="action-btn">Click Me</button>
        </div>
    </div>
</body>
<style>
    .container { 
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
    
    .action-btn {
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.8rem 2rem;
        border-radius: 999px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.1s;
    }
    .action-btn:active { transform: scale(0.95); }
</style>`);
    
    const [previewUrl, setPreviewUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingPath, setPendingPath] = useState<string>('/');

    const captureRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
        }, 500);

        return () => clearTimeout(timeout);
    }, [code]);

    // 🌟 画質とピクセル比を下げてファイルサイズを極小化する
    const generateThumbnail = async () => {
        if (!captureRef.current) return null;
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const dataUrl = await toJpeg(captureRef.current, { 
                quality: 0.4,       // 画質を40%に落とす
                pixelRatio: 1,      // Retina等で画像が巨大化するのを防ぐ
                backgroundColor: '#ffffff',
                cacheBust: true,
                skipFonts: true,
            });
            return dataUrl;
        } catch (err) { 
            console.error("Thumbnail generation failed:", err);
            return null; 
        }
    };

    const handleSave = async () => {
        if (!code.trim()) return;
        setIsSaving(true);
        try {
            // 圧縮されたBase64文字列（軽量）を取得
            const thumbnailBase64 = await generateThumbnail();

            // 🌟 直接Firestoreに保存する
            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user",
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'text',
                code: code,
                caption: caption,
                thumbnail: thumbnailBase64, // 圧縮した文字列を保存
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

    const handleNavigation = (path: string) => {
        if (isDirty) {
            setPendingPath(path);
            setShowConfirmModal(true);
        } else {
            router.push(path);
        }
    };

    const confirmNavigation = () => {
        setShowConfirmModal(false);
        router.push(pendingPath);
    };

    const toggleFullScreen = () => {
        if (iframeRef.current) {
            if (!document.fullscreenElement) {
                iframeRef.current.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className='h-screen w-full bg-[#F9FAFB] text-gray-900 flex flex-col font-sans overflow-hidden'>
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

            <div className='flex-1 flex overflow-hidden p-4 md:p-6 gap-4 md:gap-6'>
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

                <div className='w-1/2 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden transition-all hover:shadow-2xl'>
                    <div className='h-12 border-b border-gray-100 flex items-center px-6 justify-between bg-white'>
                        <div className='flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest'>
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            プレビュー
                        </div>
                        <button 
                            onClick={toggleFullScreen}
                            className='flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50'
                            title="全画面表示"
                        >
                            <Maximize size={12} />
                            <span>全画面</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 bg-gray-50 relative">
                        {previewUrl && (
                            <iframe
                                ref={iframeRef}
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
                                    setIsDirty(true);
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

            {/* サムネ撮影用（画面外） */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
                <div 
                    ref={captureRef} 
                    style={{ width: '800px', height: '600px', background: '#ffffff', overflow: 'hidden' }}
                >
                    <div dangerouslySetInnerHTML={{ __html: code }} className="w-full h-full" />
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