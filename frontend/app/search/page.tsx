'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { AuroraBackground } from '../../components/AuroraBackground';
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
        <div className='flex h-screen bg-black text-white font-sans overflow-hidden'>
            <Sidebar />

            <main className='flex-1 md:ml-64 h-full relative'>

                <AuroraBackground className="w-full h-full">
                    
                    {/* コンテンツエリア */}
                    <div className="relative z-10 w-full h-full p-8 md:p-12 overflow-y-auto custom-scrollbar">
                        
                        {/* 検索バーエリア */}
                        <div className="max-w-3xl mx-auto mb-12 mt-4">
                            <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                Explore Snippets
                            </h1>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                                    <SearchIcon size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search code, users, or keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-black/50 backdrop-blur-md transition-all shadow-xl"
                                />
                            </div>
                        </div>

                        {/* 結果表示エリア */}
                        <div className="max-w-6xl mx-auto pb-20">
                            {loading ? (
                                <div className="flex justify-center py-20 text-blue-500">
                                    <Loader2 className="animate-spin w-8 h-8" />
                                </div>
                            ) : filteredPosts.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                    {filteredPosts.map(post => (
                                        <div key={post.id} className="backdrop-blur-sm">
                                            <PostCard post={post} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-400">
                                    <p className="text-xl">No results found for "{searchTerm}"</p>
                                    <p className="text-sm mt-2 opacity-60">Try searching for something else.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </AuroraBackground>
            </main>
        </div>
    );
}