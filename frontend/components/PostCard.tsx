'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { doc, writeBatch, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
    post: any;
}

// デザイン設定：モードに応じた配色を管理
const THEME_STYLES = {
    text: {
        card: 'border-blue-100 hover:border-blue-300 hover:shadow-blue-100/50',
        badge: 'bg-blue-50 text-blue-600 border-blue-100',
        icon: 'text-blue-500 bg-blue-50',
        footerBg: 'bg-blue-50', 
        label: 'テキストモード',
        IconComponent: Code2
    },
    block: {
        card: 'border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: 'text-emerald-500 bg-emerald-50',
        footerBg: 'bg-emerald-50', 
        label: 'ブロックモード',
        IconComponent: Layers
    }
};

export const PostCard = ({ post }: PostCardProps) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // 1. 自分のいいね状態をリアルタイムで同期
    useEffect(() => {
        if (!user?.uid || !post.id) return;
        const unsub = onSnapshot(doc(db, 'posts', post.id, 'likes', user.uid), (docSnap) => {
            setIsLiked(docSnap.exists());
        });
        return () => unsub();
    }, [user?.uid, post.id]);

    // 2. いいね処理（多重書き込みと不整合防止ガード付き）
    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user?.uid) { alert('いいねするにはログインが必要です'); return; }
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            const batch = writeBatch(db);
            const postRef = doc(db, 'posts', post.id);
            const postLikeRef = doc(db, 'posts', post.id, 'likes', user.uid);
            const userLikedPostRef = doc(db, 'users', user.uid, 'likedPosts', post.id);

            if (isLiked) {
                const currentTotalLikes = post.likes || 0;
                batch.delete(postLikeRef);
                batch.delete(userLikedPostRef);
                batch.update(postRef, { likes: currentTotalLikes > 0 ? increment(-1) : 0 });
            } else {
                const now = new Date();
                batch.set(postLikeRef, { createdAt: now });
                batch.set(userLikedPostRef, { createdAt: now, postId: post.id });
                batch.update(postRef, { likes: increment(1) });
            }
            await batch.commit();
        } catch (error) {
            console.error('いいね更新エラー:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 表示ロジック ---
    const isText = post.type === 'text';
    const theme = isText ? THEME_STYLES.text : THEME_STYLES.block;
    const BadgeIcon = theme.IconComponent;
    const date = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja }) : 'たった今';
    const currentLikes = post.likes || 0;
    const displayCode = post.code || post.codeSnippet || '';

    return (
        <div className={`group relative block h-[380px] bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.card}`}>
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0" />

            {/* 上半分：プレビューエリア */}
            <div className="h-1/2 bg-gray-50 relative overflow-hidden border-b border-gray-100 pointer-events-none">
                {post.thumbnail ? (
                    /* キャプチャ画像がある場合 */
                    <img src={post.thumbnail} alt="" className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500" />
                ) : isText ? (
                    /* テキストモード：iframeでHTMLを縮小レンダリング */
                    <div className="relative w-full h-full bg-white">
                        <iframe
                            srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:20px;overflow:hidden;zoom:0.5;font-family:sans-serif;}</style></head><body>${displayCode}</body></html>`}
                            title="preview"
                            className="absolute top-0 left-0 w-[200%] h-[200%] transform scale-50 origin-top-left border-none pointer-events-none select-none"
                            sandbox="allow-scripts"
                            scrolling="no"
                        />
                        <div className="absolute inset-0 z-10 bg-transparent" />
                    </div>
                ) : (
                    /* 画像なしブロックモード：アイコン表示 */
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <BadgeIcon size={48} className="mb-2 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Block Mode</span>
                        <p className='text-[10px] font-bold uppercase tracking-wider'>セキュリティルールに従いサムネが表示されません</p>
                    </div>
                )}
                
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${theme.badge} z-20`}>
                    <BadgeIcon size={12} />
                    <span>{theme.label}</span>
                </div>
            </div>

            {/* 下半分：情報エリア */}
            <div className={`h-1/2 p-5 flex flex-col justify-between relative z-10 pointer-events-none ${theme.footerBg}`}>
                <div>
                    <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                        <img 
                            src={post.userAvatar} 
                            alt="" 
                            className="w-8 h-8 rounded-full border border-gray-100 shadow-sm object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'; }}
                        />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{post.userName}</span>
                            <span className="text-[10px] text-gray-400">{date}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{post.caption || "No description"}</p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 pointer-events-auto">
                    <div className="flex items-center gap-4 text-gray-400">
                        <button 
                            onClick={toggleLike}
                            disabled={isProcessing}
                            className={`flex items-center gap-1.5 text-xs transition-all p-1.5 rounded-lg ${
                                isLiked 
                                ? 'text-pink-600 bg-pink-50 border border-pink-100' 
                                : 'hover:text-pink-500 hover:bg-white/60 border border-transparent'
                            }`}
                        >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110" : ""} />
                            <span className="font-bold">{currentLikes}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs">
                            <MessageCircle size={16} />
                            <span className="font-bold">{post.comments || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};