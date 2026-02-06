'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Search as SearchIcon, Hash, User, ChevronDown, ChevronUp, Loader2, Image as ImageIcon, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuroraBackground } from '../../components/AuroraBackground';
// Firebase関連をインポート
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';

// --- Types ---
// ホーム画面と同じ型定義
interface PostData {
    id: string;
    userName: string;
    userAvatar: string;
    caption?: string; // 検索対象にする
    code?: string;
    thumbnail?: string; 
    type: string;
}

// --- Mock Data (タグなどは一旦ダミーのまま) ---
const TRENDING_TAGS = [
    { name: 'Python', count: '12.5k' }, { name: 'React', count: '8.2k' },
    { name: 'Three.js', count: '5.1k' }, { name: 'DataScience', count: '3.4k' },
    { name: 'GameDev', count: '2.9k' }, { name: 'MachineLearning', count: '2.1k' },
];

const SUGGESTED_USERS = [
    { name: 'tanaka_dev', bio: 'Python & AI Engineer.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: 'suzuki_ui', bio: 'Frontend Lover ❤️', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { name: 'sato_algo', bio: 'Competitive Programming', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' }
];

// --- Components ---

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-[#161616]/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden transition-all hover:border-white/20">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            >
                <div className="flex items-center gap-2 text-lg font-bold">
                    <Icon className="w-5 h-5 text-cyan-400" />
                    {title}
                </div>
                <div className="p-1 rounded-full bg-white/5 text-gray-400">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="p-4 pt-0 border-t border-white/5">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Tag = ({ name, count }: { name: string, count: string }) => (
    <button className="flex items-center gap-2 px-4 py-2 bg-[#222]/50 hover:bg-cyan-500/20 rounded-lg border border-white/5 hover:border-cyan-500/30 transition-all group">
        <Hash size={14} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
        <span className="font-medium group-hover:text-white">{name}</span>
        <span className="text-xs text-gray-500 group-hover:text-cyan-300/70">{count} posts</span>
    </button>
);

const UserCard = ({ user }: { user: typeof SUGGESTED_USERS[0] }) => (
    <div className="flex items-center justify-between p-4 bg-[#222]/50 rounded-xl border border-white/5 hover:border-white/20 transition-all">
        <div className="flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
            <div>
                <div className="font-bold text-sm">{user.name}</div>
                <div className="text-xs text-gray-400">{user.bio}</div>
            </div>
        </div>
        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-full transition-colors shadow-lg shadow-blue-900/20">
            Follow
        </button>
    </div>
);

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(true);

    // ★ Firestoreから実際の投稿を取得
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 最新の50件を取得
                const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
                const querySnapshot = await getDocs(q);
                const fetchedPosts: PostData[] = [];
                
                querySnapshot.forEach((doc) => {
                    fetchedPosts.push({ id: doc.id, ...doc.data() } as PostData);
                });
                
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching exploring posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // ★ 検索機能：ユーザー名かキャプションに一致するものをフィルタリング
    const filteredPosts = posts.filter(post => {
        const query = searchQuery.toLowerCase();
        const userName = post.userName?.toLowerCase() || '';
        const caption = post.caption?.toLowerCase() || '';
        // コードの中身も含めて検索したい場合はここに追加
        return userName.includes(query) || caption.includes(query);
    });

    return (
        <div className='flex min-h-screen font-sans overflow-hidden bg-transparent text-white selection:bg-cyan-500/30'>
            <Sidebar />
            
            <main className='flex-1 md:ml-64 relative overflow-y-auto custom-scrollbar h-screen'>
                <AuroraBackground />

                <div className='relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12'>
                    
                    {/* Search Input */}
                    <div className="relative mb-12">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search code, captions, or users..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#161616]/60 backdrop-blur-xl border border-white/10 focus:border-cyan-500/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-2xl"
                        />
                    </div>

                    {/* Collapsible Sections */}
                    <div className="space-y-4 mb-12">
                        <CollapsibleSection title="Trending Tags" icon={Hash} defaultOpen={true}>
                            <div className="flex flex-wrap gap-3">
                                {TRENDING_TAGS.map(tag => <Tag key={tag.name} {...tag} />)}
                            </div>
                        </CollapsibleSection>

                        <CollapsibleSection title="Suggested for you" icon={User}>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {SUGGESTED_USERS.map(user => <UserCard key={user.name} user={user} />)}
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* Explore Grid (Real Data) */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">Explore</span>
                        </h2>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredPosts.map((post, i) => (
                                    <motion.div 
                                        key={post.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        onClick={() => window.location.href = `/post/${post.id}`} // 詳細へ遷移
                                        className="aspect-[4/3] bg-[#161616]/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/30 cursor-pointer relative group"
                                    >
                                        {/* サムネイルがある場合は表示、なければプレースホルダー */}
                                        {post.thumbnail ? (
                                            <img src={post.thumbnail} alt={post.userName} className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                        
                                        {/* ホバー時のオーバーレイ情報 */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img src={post.userAvatar} alt="" className="w-5 h-5 rounded-full" />
                                                <span className="text-xs font-bold truncate">{post.userName}</span>
                                            </div>
                                            {post.caption && (
                                                <p className="text-xs text-gray-300 line-clamp-1">{post.caption}</p>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-500">
                                No results found for "{searchQuery}"
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}