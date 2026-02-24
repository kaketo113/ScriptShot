'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// 1. 型定義とテーマ設定
interface PostCardProps {
    post: any;
}

const THEME_STYLES = {
    text: {
        card: 'border-blue-100 hover:border-blue-300 hover:shadow-blue-100/50',
        badge: 'bg-blue-50 text-blue-600 border-blue-100',
        icon: 'text-blue-500 bg-blue-50',
        footerBg: 'bg-blue-100',
        label: 'テキストモード',
        IconComponent: Code2
    },
    block: {
        card: 'border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        icon: 'text-emerald-500 bg-emerald-50',
        footerBg: 'bg-emerald-100',
        label: 'ブロックモード',
        IconComponent: Layers
    }
};

// 2. カスタムフック (いいねロジック)
const useLike = (postId: string, initialLikes: number, userId: string | undefined) => {
    const [likeCount, setLikeCount] = useState<number>(initialLikes || 0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    useEffect(() => {
        if (!userId || !postId) return;
        const checkLikeStatus = async () => {
            try {
                const likeSnap = await getDoc(doc(db, 'posts', postId, 'likes', userId));
                setIsLiked(likeSnap.exists());
            } catch (error) {
                console.error("いいね状態の取得に失敗:", error);
            }
        };
        checkLikeStatus();
    }, [userId, postId]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            alert('いいねするにはログインが必要です');
            return;
        }
        if (isProcessing) return;

        const previousIsLiked = isLiked;
        const previousCount = likeCount;
        
        setIsLiked(!previousIsLiked);
        setLikeCount(previousIsLiked ? previousCount - 1 : previousCount + 1);
        setIsProcessing(true);

        try {
            const postRef = doc(db, 'posts', postId);
            const likeRef = doc(db, 'posts', postId, 'likes', userId);

            if (previousIsLiked) {
                await deleteDoc(likeRef);
                await updateDoc(postRef, { likes: increment(-1) });
            } else {
                await setDoc(likeRef, { createdAt: new Date() });
                await updateDoc(postRef, { likes: increment(1) });
            }
        } catch (error) {
            console.error('いいねの更新に失敗しました:', error);
            setIsLiked(previousIsLiked);
            setLikeCount(previousCount);
        } finally {
            setIsProcessing(false);
        }
    };

    return { likeCount, isLiked, isProcessing, toggleLike };
};

// 3. メインコンポーネント
export const PostCard = ({ post }: PostCardProps) => {
    const { user } = useAuth();
    const { likeCount, isLiked, isProcessing, toggleLike } = useLike(post.id, post.likes, user?.uid);

    const date = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja }) : 'たった今';
    const displayCode = post.code || post.codeSnippet || '';
    const isText = post.type === 'text';
    const theme = isText ? THEME_STYLES.text : THEME_STYLES.block;
    const BadgeIcon = theme.IconComponent;

    return (
        <div className={`group relative block h-[380px] bg-white rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.card}`}>
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0" aria-label={`${post.userName}の投稿を見る`} />

            {/* --- 上半分 (プレビューエリア) --- */}
            <div className="h-1/2 bg-gray-50 relative overflow-hidden border-b border-gray-100 pointer-events-none">
                {post.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={post.thumbnail} 
                        alt="Preview" 
                        className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                    />
                ) : isText ? (
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
                ) : (
                    <div className="w-full h-full bg-emerald-50/50 flex flex-col items-center justify-center text-emerald-300">
                        <Layers size={48} className="mb-2 opacity-50 drop-shadow-sm" />
                        <span className="text-xs font-bold tracking-widest uppercase opacity-70">Block Mode</span>
                        <p className='text-xs font-bold tracking-widest opacity-80'>セキュリティルール上、画面にサムネが表示されません</p>
                    </div>
                )}

                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${theme.badge}`}>
                    <BadgeIcon size={12} />
                    <span>{theme.label}</span>
                </div>
            </div>

            {/* --- 下半分 (情報エリア) --- */}
            <div className={`h-1/2 p-5 flex flex-col justify-between ${theme.footerBg} relative z-10 pointer-events-none`}>
                <div>
                    <div className="flex items-center gap-3 mb-3 pointer-events-auto relative z-20">
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
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px] leading-relaxed">
                        {post.caption || <span className="text-gray-300 italic text-xs">No description</span>}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50 pointer-events-auto relative z-20">
                    <div className="flex items-center gap-4 text-gray-400">
                        <button 
                            onClick={toggleLike}
                            disabled={isProcessing}
                            className={`flex items-center gap-1.5 text-xs transition-colors p-1.5 -ml-1.5 rounded-lg ${
                                isLiked 
                                ? 'text-pink-600 bg-pink-50 border border-pink-100' 
                                : 'hover:text-pink-500 hover:bg-white/60 border border-transparent'
                            }`}
                        >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "scale-110 transition-transform" : "transition-transform"} />
                            <span className="font-medium">{likeCount}</span>
                        </button>
                        <div className="flex items-center gap-1.5 text-xs group-hover:text-blue-500 transition-colors p-1.5 rounded-lg">
                            <MessageCircle size={16} />
                            <span className="font-medium">{post.comments || 0}</span>
                        </div>
                    </div>
                    
                    <div className={`p-2 rounded-full transition-all duration-300 transform group-hover:translate-x-1 ${theme.icon}`}>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};