'use client';

import React from 'react';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface PostCardProps {
    post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
    // 日付のフォーマット
    const date = post.createdAt?.toDate 
        ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja })
        : 'たった今';

    // 表示するコード（テキストモードなら code, ブロックモードなら codeSnippet）
    const displayCode = post.code || post.codeSnippet || '';

    return (
        <a href={`/post/${post.id}`} className="group relative block h-[320px] bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
            
            {/* 上半分：プレビューエリア */}
            <div className="h-1/2 bg-[#0a0a0a] relative overflow-hidden border-b border-white/5 group-hover:bg-[#0f0f0f] transition-colors">
                
                {post.thumbnail ? (
                    // ★パターンA: サムネイル画像がある場合 (主にブロックモード)
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={post.thumbnail} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    // ★パターンB: サムネイルがない場合 (テキストモードなど)
                    // ここを <pre> から <iframe> に変更して実行画面を表示！
                    <div className="relative w-full h-full bg-white">
                        <iframe
                            srcDoc={displayCode}
                            title="preview"
                            // 2倍の大きさで作って0.5倍に縮小することで、デスクトップ表示っぽく見せる
                            className="w-[200%] h-[200%] transform scale-50 origin-top-left border-none pointer-events-none select-none"
                            sandbox="allow-scripts" // スクリプト実行を許可（デザイン崩れ防止）
                            scrolling="no"
                            tabIndex={-1}
                        />
                        {/* クリックをiframeに奪われないように透明なカバーをかける */}
                        <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                )}
            </div>

            {/* 下半分：情報エリア (変更なし) */}
            <div className="h-1/2 p-5 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        {/* ユーザーアイコン */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={post.userAvatar} 
                            alt={post.userName} 
                            className="w-6 h-6 rounded-full border border-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }}
                        />
                        <span className="text-xs text-gray-400 truncate max-w-[120px]">{post.userName}</span>
                        <span className="text-[10px] text-gray-600">• {date}</span>
                    </div>

                    {/* 投稿の種類バッジ */}
                    <div className="flex gap-2 mb-2">
                        {post.type === 'block' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <Layers size={10} /> Block
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                <Code2 size={10} /> Text
                            </span>
                        )}
                    </div>
                </div>

                {/* アクションボタン */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-gray-500">
                        <div className="flex items-center gap-1.5 text-xs group-hover:text-pink-500 transition-colors">
                            <Heart size={14} />
                            <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs group-hover:text-blue-400 transition-colors">
                            <MessageCircle size={14} />
                            <span>{post.comments || 0}</span>
                        </div>
                    </div>
                    
                    <div className="p-2 rounded-full bg-white/5 text-gray-400 group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight size={14} />
                    </div>
                </div>
            </div>
        </a>
    );
};