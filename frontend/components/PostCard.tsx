'use client';

import React from 'react';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface PostCardProps {
    post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
    // 日付のフォーマット（エラー回避のため）
    const date = post.createdAt?.toDate 
        ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja })
        : 'たった今';

    // ★修正ポイント：表示するコードが存在しない場合の対策
    // post.code がなければ post.codeSnippet を使い、それもなければ空文字にする
    const displayCode = post.code || post.codeSnippet || '';

    return (
        <a href={`/post/${post.id}`} className="group relative block h-[320px] bg-[#111] rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10">
            
            {/* 上半分：プレビューエリア */}
            <div className="h-1/2 bg-[#0a0a0a] relative overflow-hidden border-b border-white/5 group-hover:bg-[#0f0f0f] transition-colors">
                
                {/* サムネイルがある場合は画像を表示 (ブロックモード用) */}
                {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={post.thumbnail} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    // サムネイルがない場合はコードを表示 (テキストモード用)
                    <div className="p-4 relative h-full">
                        <div className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono flex items-center gap-1">
                            {post.type === 'block' ? <Layers size={10} /> : <Code2 size={10} />}
                            {post.type === 'block' ? 'BLOCK PREVIEW' : 'CODE PREVIEW'}
                        </div>
                        {/* ★ここで安全な displayCode を使う */}
                        <pre className="text-[10px] font-mono text-gray-400 leading-relaxed opacity-70 mt-4 overflow-hidden h-full break-all whitespace-pre-wrap">
                            {displayCode.slice(0, 300)}...
                        </pre>
                        {/* グラデーションで消す演出 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent pointer-events-none" />
                    </div>
                )}
            </div>

            {/* 下半分：情報エリア */}
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

                {/* アクションボタン（いいね、コメント） */}
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