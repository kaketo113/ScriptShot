'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Play, Image as ImageIcon, Loader2, Code2, Box, ArrowLeft, Save } from 'lucide-react';
import { db } from '../../lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { toJpeg } from 'html-to-image'; 

import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; 
import 'prismjs/themes/prism-tomorrow.css';

export default function CreatePage() {
    const [code, setCode] = useState(`<div class="container">\n    <h1>Hello, ScriptShot!</h1>\n    <p>Code generated preview.</p>\n</div>\n\n<style>\n    body { \n        font-family: sans-serif;\n        display: flex; \n        justify-content: center; \n        align-items: center; \n        height: 100vh; \n        margin: 0;\n        background: #f0f0f0;\n    }\n    .container {\n        text-align: center;\n        padding: 2rem;\n        background: white;\n        border-radius: 1rem;\n        box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n    }\n    h1 { color: #3b82f6; }\n</style>`);

    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false); 
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState(""); 
    const { user } = useAuth();
    
    const captureRef = useRef<HTMLDivElement>(null);

    const highlightedCode = useMemo(() => {
        return Prism.highlight(code, Prism.languages.markup, 'markup');
    }, [code]);

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
        }, 400);
    }, [code, previewUrl]);

    // サムネイル生成関数
    const generateThumbnail = async () => {
        if (!captureRef.current) return null;
        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const dataUrl = await toJpeg(captureRef.current, {
                quality: 0.8,
                width: 800,
                height: 600,
                cacheBust: true,
                backgroundColor: '#ffffff',
                style: {
                    background: 'white',
                }
            });
            return dataUrl;
        } catch (err) {
            console.error('Thumbnail generation failed:', err);
            return null;
        }
    };

    const handlePost = async () => {
        if (!code) return;
        setIsSaving(true);
        try {
            const thumbnailBase64 = await generateThumbnail();

            await addDoc(collection(db, "posts"), {
                userId: user?.uid || "guest_user", 
                userName: user?.displayName || "Guest User",
                userAvatar: user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
                type: 'text',
                code: code,
                caption: caption,
                thumbnail: thumbnailBase64 || null, 
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });

            alert("投稿しました！");
            window.location.href = '/'; 
        } catch (error) {
            console.error("Post Error: ", error);
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    const lineNumbers = useMemo(() => code.split('\n').map((_, i) => i + 1), [code]);

    // 【重要】撮影用にコードを書き換えるロジック
    // CSSの中にある "body {" を ".snapshot-root {" に置換する
    // これにより、iframeがないdivの中でも bodyスタイルが適用されるようになる
    const snapshotCode = useMemo(() => {
        // 正規表現で "body {" や "body{" を探し、クラス指定に置換
        return code.replace(/body\s*\{/g, '.snapshot-root {');
    }, [code]);

    return (
        <div className='h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden relative'>
            
            <header className='h-16 border-b border-white/10 flex items-center px-6 bg-[#0a0a0a] shrink-0 z-50 relative'>
                <div className='flex items-center gap-4 z-10'>
                    <a href='/' className='text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full'><ArrowLeft className='w-5 h-5' /></a>
                    <h2 className='font-bold text-lg tracking-tight'>Create New Post</h2>
                </div>
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0'>
                    <div className='flex bg-[#161616] p-1 rounded-lg border border-white/5'>
                        <button className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg font-medium'><Code2 className='w-4 h-4' /><span>Text</span></button>
                        <a href='/create/block' className='flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5 font-medium'><Box className='w-4 h-4' /><span>Block</span></a>
                    </div>
                </div>
                <div className='ml-auto w-40 flex justify-end items-center gap-3 z-10'>
                    <div className='text-xs text-gray-500'>{user ? 'Autosaved' : 'Guest Mode'}</div>
                </div>
            </header>

            <div className='flex-1 flex overflow-hidden'>
                {/* Editor Area */}
                <div className='w-1/2 border-r border-white/10 flex flex-col bg-[#1e1e1e] overflow-hidden'>
                    <div className='flex-1 relative flex overflow-y-auto custom-scrollbar'>
                        <div className='w-12 bg-[#1e1e1e] border-r border-white/5 flex flex-col items-end pt-4 pr-3 text-gray-600 font-mono text-sm select-none leading-relaxed shrink-0'>
                            {lineNumbers.map(num => (<div key={num} className='h-6'>{num}</div>))}
                        </div>
                        <div className='flex-1 relative font-mono text-sm p-4 pt-4'>
                            <div className='absolute top-0 right-4 bg-[#2d2d2d] text-[10px] text-gray-400 px-3 py-1 rounded-b-md z-30 font-mono border-x border-b border-white/5'>HTML / CSS</div>
                            <div className="relative w-full h-full">
                                <pre 
                                    aria-hidden="true" 
                                    className='m-0 whitespace-pre-wrap break-all pointer-events-none absolute inset-0'
                                    style={{ lineHeight: '1.5rem', fontFamily: 'Menlo, Monaco, Consolas, monospace' }}
                                    dangerouslySetInnerHTML={{ __html: highlightedCode + '\n' }}
                                />
                                <textarea 
                                    className='absolute inset-0 w-full h-full bg-transparent text-transparent p-0 resize-none focus:outline-none z-10 caret-white whitespace-pre-wrap break-all' 
                                    value={code} 
                                    onChange={(e) => setCode(e.target.value)} 
                                    spellCheck={false} 
                                    style={{ lineHeight: '1.5rem', fontFamily: 'Menlo, Monaco, Consolas, monospace' }} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className='h-32 border-t border-white/10 p-4 bg-[#161616] shrink-0'>
                        <textarea 
                            className='w-full h-full bg-transparent text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none leading-relaxed' 
                            placeholder='Write a caption...' 
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>
                </div>

                {/* Preview Area */}
                <div className='w-1/2 bg-[#050505] flex flex-col overflow-hidden'>
                    <div className='flex-1 flex items-center justify-center relative bg-[radial-gradient(#1a1a1a_1px,transparent_1px)] [background-size:16px_16px] p-8 overflow-hidden'>
                        {previewUrl ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                className='relative w-full h-full max-h-[600px] rounded-lg overflow-hidden border border-white/10 shadow-2xl bg-white flex flex-col'
                            >
                                <div className='h-8 bg-[#f1f1f1] flex items-center px-3 gap-1.5 border-b border-gray-300 shrink-0'>
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]'></div>
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]'></div>
                                    <div className='w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]'></div>
                                    <div className='ml-2 h-5 flex-1 bg-white border border-gray-200 rounded text-[10px] flex items-center px-2 text-gray-400 font-sans truncate'>localhost:3000/preview</div>
                                </div>
                                <iframe src={previewUrl} className='flex-1 w-full bg-white border-none' sandbox="allow-scripts" title="Preview" />
                            </motion.div>
                        ) : (
                            <div className='text-center text-gray-600 select-none'>
                                <div className='w-24 h-24 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]'><ImageIcon className='w-10 h-10 opacity-30' /></div>
                                <p className='text-sm font-medium text-gray-500'>Run code to generate preview</p>
                            </div>
                        )}
                    </div>

                    <div className='h-20 border-t border-white/10 flex items-center justify-between px-8 bg-[#111] shrink-0'>
                        <button onClick={runCode} disabled={isRunning} className='flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95 transform duration-100'>{isRunning ? <Loader2 className='w-4 h-4 animate-spin' /> : <Play className='w-4 h-4 fill-current' />}<span>Run Code</span></button>
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

            {/* 撮影用スタジオ
               置換済みのコード (snapshotCode) を使い、
               wrapper に "snapshot-root" クラスを与えることで、
               擬似的に body に対するスタイルを適用させる。
            */}
            <div style={{ position: 'fixed', left: '-9999px', top: 0, width: 0, height: 0, overflow: 'hidden' }}>
                <div 
                    ref={captureRef}
                    className="snapshot-root" // ここに body の代わりとなるクラスを付与
                    style={{
                        width: '800px',
                        height: '600px',
                        background: '#ffffff',
                        position: 'relative' // relativeを追加して安定させる
                    }}
                >
                    {/* 置換後のコードを展開 */}
                    <div 
                        dangerouslySetInnerHTML={{ __html: snapshotCode }} 
                        style={{ width: '100%', height: '100%' }}
                    />
                </div>
            </div>

        </div>
    );
}