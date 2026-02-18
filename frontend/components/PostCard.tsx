'use client';

import React from 'react';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

interface PostCardProps {
    post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
    const date = post.createdAt?.toDate 
        ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja })
        : 'たった今';

    const displayCode = post.code || post.codeSnippet || '';
    const isText = post.type === 'text';

    const cardStyle = isText
        ? 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-blue-100/50'
        : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50';

    const badgeStyle = isText
        ? 'bg-blue-50 text-blue-600 border-blue-100'
        : 'bg-emerald-50 text-emerald-600 border-emerald-100';

    const iconColor = isText
        ? 'text-blue-500 bg-blue-50'
        : 'text-emerald-500 bg-emerald-50';

    const footerBgClass = isText
        ? 'bg-blue-100' // テキストモードは薄い青
        : 'bg-emerald-100'; // ブロックモードは薄い緑

    return (
        <a href={`/post/${post.id}`} className={`group relative block h-[380px] rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardStyle}`}>
            
            {/* 上半分 (プレビューエリア) */}
            <div className="h-1/2 bg-gray-50 relative overflow-hidden border-b border-gray-100">
                {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={post.thumbnail} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="relative w-full h-full bg-white">
                        <iframe
                            srcDoc={displayCode}
                            title="preview"
                            className="w-[200%] h-[200%] transform scale-50 origin-top-left border-none pointer-events-none select-none"
                            sandbox="allow-scripts"
                            scrolling="no"
                            tabIndex={-1}
                        />
                        <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                )}

                {/* モードバッジ */}
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${badgeStyle}`}>
                    {isText ? <Code2 size={12} /> : <Layers size={12} />}
                    <span>{isText ? 'テキストモード' : 'ブロックモード'}</span>
                </div>
            </div>

            {/* 下半分 (情報エリア) */}
            <div className={`h-1/2 p-5 flex flex-col justify-between ${footerBgClass}`}>
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        {/* ユーザーアイコン */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={post.userAvatar} 
                            alt={post.userName} 
                            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{post.userName}</span>
                            <span className="text-[10px] text-gray-400">{date}</span>
                        </div>
                    </div>

                    {/* Caption */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px] leading-relaxed">
                        {post.caption || <span className="text-gray-300 italic text-xs">No description</span>}
                    </p>
                </div>

                {/* フッター */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50">
                    <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-1.5 text-xs group-hover:text-pink-500 transition-colors">
                            <Heart size={16} />
                            <span className="font-medium">{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs group-hover:text-blue-500 transition-colors">
                            <MessageCircle size={16} />
                            <span className="font-medium">{post.comments || 0}</span>
                        </div>
                    </div>
                    
                    <div className={`p-2 rounded-full transition-all duration-300 transform group-hover:translate-x-1 ${iconColor}`}>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </a>
    );
};