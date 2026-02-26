'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Code2, Layers, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { db } from '../lib/firebase';
import { doc, getDoc, writeBatch, increment, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
    post: any;
}

export const PostCard = ({ post }: PostCardProps) => {
    const { user } = useAuth();
    
    // カード内部で「いいね数」を useState で持たない
    // 親から渡される post.likes を直接使う。
    
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // 自分のいいね状態だけを監視
    useEffect(() => {
        if (!user?.uid || !post.id) return;
        
        // リアルタイムで「自分がいいねしているか」を監視する
        const unsub = onSnapshot(doc(db, 'posts', post.id, 'likes', user.uid), (doc) => {
            setIsLiked(doc.exists());
        });
        return () => unsub();
    }, [user?.uid, post.id]);

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user?.uid) {
            alert('いいねするにはログインが必要です');
            return;
        }
        if (isProcessing) return;

        setIsProcessing(true);
        // ここで state を直接変えず、Firebase の更新結果を待つ

        try {
            const batch = writeBatch(db);
            const postRef = doc(db, 'posts', post.id);
            const postLikeRef = doc(db, 'posts', post.id, 'likes', user.uid);
            const userLikedPostRef = doc(db, 'users', user.uid, 'likedPosts', post.id);

            // 現在の「Firebase上の最新の状態」に基づいて判定
            if (isLiked) {
                // 解除処理：ただし、現在のいいね数が0ならそれ以上引かないガードを念のため入れる
                const currentTotalLikes = post.likes || 0;
                batch.delete(postLikeRef);
                batch.delete(userLikedPostRef);
                batch.update(postRef, { 
                    likes: currentTotalLikes > 0 ? increment(-1) : 0 
                });
            } else {
                // いいね処理
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

    // 表示ロジック
    const isText = post.type === 'text';
    const date = post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true, locale: ja }) : 'たった今';
    const currentLikes = post.likes || 0;

    return (
        <div className="group relative block h-[380px] bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Link href={`/post/${post.id}`} className="absolute inset-0 z-0" />

            {/* サムネイルエリア */}
            <div className="h-1/2 bg-gray-50 relative overflow-hidden border-b border-gray-100 pointer-events-none">
                {post.thumbnail ? (
                    <img src={post.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                        {isText ? <Code2 size={48} /> : <Layers size={48} />}
                    </div>
                )}
            </div>

            {/* コンテンツエリア */}
            <div className="h-1/2 p-5 flex flex-col justify-between relative z-10 pointer-events-none">
                <div>
                    <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                        <img src={post.userAvatar} className="w-8 h-8 rounded-full border shadow-sm" alt="" />
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">{post.userName}</span>
                            <span className="text-[10px] text-gray-400">{date}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                </div>

                {/* アクションエリア */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 pointer-events-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleLike}
                            disabled={isProcessing}
                            className={`flex items-center gap-1.5 text-xs transition-all p-1.5 rounded-lg ${
                                isLiked 
                                ? 'text-pink-600 bg-pink-50 border border-pink-100' 
                                : 'text-gray-400 hover:text-pink-500 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                            <span className="font-bold">{currentLikes}</span>
                        </button>
                    </div>
                    <div className="text-gray-300"><ArrowRight size={16} /></div>
                </div>
            </div>
        </div>
    );
};