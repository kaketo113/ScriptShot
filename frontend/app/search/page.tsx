'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { PostCard } from '../../components/PostCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';

export default function SearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 初回ロード
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setPosts(data);
                setFilteredPosts(data);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 検索処理
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPosts(posts);
            return;
        }
        
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = posts.filter(post => {
            const codeMatch = post.code?.toLowerCase().includes(lowerTerm);
            const userMatch = post.userName?.toLowerCase().includes(lowerTerm);
            const blockMatch = post.blocks?.some((b: any) => 
                b.content.toLowerCase().includes(lowerTerm)
            );
            return codeMatch || userMatch || blockMatch;
        });
        
        setFilteredPosts(filtered);
    }, [searchTerm, posts]);

    return (
        // ★修正: 白背景のテーマに変更
        <div className='flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 h-full relative'>

                {/* 背景装飾 (薄いグラデーション) */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50 opacity-80 pointer-events-none"></div>
                
                {/* コンテンツエリア */}
                <div className="relative z-10 w-full h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                    
                    {/* 検索バーエリア */}
                    <div className="max-w-3xl mx-auto mb-12 mt-4">
                        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
                            投稿を探す
                        </h1>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <SearchIcon size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="コード、ユーザー、キーワードで検索..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-6 text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all shadow-lg shadow-gray-200/50"
                            />
                        </div>
                    </div>

                    {/* 結果表示エリア */}
                    <div className="max-w-6xl mx-auto pb-20">
                        {loading ? (
                            <div className="flex justify-center py-20 text-blue-600">
                                <Loader2 className="animate-spin w-8 h-8" />
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {filteredPosts.map(post => (
                                    <div key={post.id}>
                                        <PostCard post={post} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                <p className="text-xl font-bold text-gray-400 mb-2">"{searchTerm}" に一致する投稿はありません</p>
                                <p className="text-sm opacity-80">別のキーワードで検索してみてください。</p>
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}