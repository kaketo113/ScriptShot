'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
    post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
    const { user } = useAuth();
    
    // いいね機能の状態管理（propsの値を初期値とする）
    const [likeCount, setLikeCount] = useState<number>(post.likes || 0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const date = post.createdAt?.toDate 
        ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja })
        : 'たった今';

    const displayCode = post.code || post.codeSnippet || '';
    const isText = post.type === 'text';

    // コンポーネントマウント時に「自分がいいね済みか」をFirestoreから取得
    useEffect(() => {
        if (!user || !post.id) return;
        
        const checkLikeStatus = async () => {
            try {
                const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);
                const likeSnap = await getDoc(likeRef);
                if (likeSnap.exists()) {
                    setIsLiked(true);
                }
            } catch (error) {
                console.error("いいね状態の取得に失敗:", error);
            }
        };
        checkLikeStatus();
    }, [user, post.id]);

    // いいねボタンのクリック処理
    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.preventDefault();  // Linkコンポーネントの画面遷移を防ぐ
        e.stopPropagation(); // イベントのバブリング（親要素への伝播）を防ぐ

        if (!user) {
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
            const postRef = doc(db, 'posts', post.id);
            const likeRef = doc(db, 'posts', post.id, 'likes', user.uid);

            if (previousIsLiked) {
                // いいね取り消し
                await deleteDoc(likeRef);
                await updateDoc(postRef, { likes: increment(-1) });
            } else {
                // いいね追加
                await setDoc(likeRef, { createdAt: new Date() });
                await updateDoc(postRef, { likes: increment(1) });
            }
        } catch (error) {
            console.error('いいねの更新に失敗しました:', error);
            // 失敗したら元の状態に戻す（ロールバック）
            setIsLiked(previousIsLiked);
            setLikeCount(previousCount);
        } finally {
            setIsProcessing(false);
        }
    };

    const cardStyle = isText
        ? 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-blue-100/50'
        : 'bg-white border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100/50';

    const badgeStyle = isText
        ? 'bg-blue-50 text-blue-600 border-blue-100'
        : 'bg-emerald-50 text-emerald-600 border-emerald-100';

    const iconColor = isText
        ? 'text-blue-500 bg-blue-50'
        : 'text-emerald-500 bg-emerald-50';

    const footerBgClass = isText ? 'bg-blue-100' : 'bg-emerald-100';

    return (
        // 親要素は <a> ではなく <div>。ホバーアニメーションなどはここに設定
        <div className={`group relative block h-[380px] rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardStyle}`}>
            
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0" aria-label={`${post.userName}の投稿を見る`} />

            {/* 上半分 (プレビューエリア) */}
            <div className="h-1/2 bg-gray-50 relative overflow-hidden border-b border-gray-100 pointer-events-none">
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

                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border shadow-sm ${badgeStyle}`}>
                    {isText ? <Code2 size={12} /> : <Layers size={12} />}
                    <span>{isText ? 'テキストモード' : 'ブロックモード'}</span>
                </div>
            </div>

            {/* 下半分 (情報エリア) */}
            <div className={`h-1/2 p-5 flex flex-col justify-between ${footerBgClass} relative z-10 pointer-events-none`}>
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

                {/* フッター */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/50 pointer-events-auto relative z-20">
                    <div className="flex items-center gap-4 text-gray-400">
                        
                        {/* いいねボタン */}
                        <button 
                            onClick={handleLikeToggle}
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
                    
                    <div className={`p-2 rounded-full transition-all duration-300 transform group-hover:translate-x-1 ${iconColor}`}>
                        <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};