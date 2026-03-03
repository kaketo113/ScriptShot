'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { PostCard } from '../../components/PostCard';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { MapPin, Calendar, Settings, Loader2, Github, Link as LinkIcon, Briefcase, X, Save } from 'lucide-react';

// カスタムフック

// 1. プロフィール情報を取得するフック（新規追加）
const useUserProfile = (userId: string | undefined) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile(docSnap.data());
                }
            } catch (error) {
                console.error("プロフィール取得エラー:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    return { profile, setProfile, loading };
};

// 2. 自分の投稿を取得
const useUserPosts = (userId: string | undefined) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUserPosts = async () => {
            if (!userId) { setLoading(false); return; }
            try {
                const q = query(collection(db, "posts"), where("userId", "==", userId), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) { console.error("投稿取得エラー:", error); } 
            finally { setLoading(false); }
        };
        fetchUserPosts();
    }, [userId]);
    return { posts, loading };
};

// 3. いいねした投稿を取得
const useLikedPosts = (userId: string | undefined) => {
    const [likedPosts, setLikedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchLikedPosts = async () => {
            if (!userId) { setLoading(false); return; }
            try {
                const likesQuery = query(collection(db, 'users', userId, 'likedPosts'), orderBy('createdAt', 'desc'));
                const likesSnap = await getDocs(likesQuery);
                if (likesSnap.empty) { setLikedPosts([]); setLoading(false); return; }
                
                const postPromises = likesSnap.docs.map(async (likeDoc) => {
                    const postRef = doc(db, 'posts', likeDoc.data().postId);
                    const postSnap = await getDoc(postRef);
                    return postSnap.exists() ? { id: postSnap.id, ...postSnap.data() } : null;
                });
                const fetchedPosts = (await Promise.all(postPromises)).filter(post => post !== null);
                setLikedPosts(fetchedPosts);
            } catch (error) { console.error("いいね取得エラー:", error); } 
            finally { setLoading(false); }
        };
        fetchLikedPosts();
    }, [userId]);
    return { likedPosts, loading };
};


// UIコンポーネント

const UnauthenticatedView = () => (
    <div className='flex min-h-screen bg-[#F9FAFB] text-gray-900 font-sans'>
        <Sidebar />
        <main className='flex-1 md:ml-64 flex items-center justify-center'>
            <p className="text-gray-500">プロフィールを表示するにはサインインしてください。</p>
        </main>
    </div>
);

// メインページコンポーネント
export default function ProfilePage() {
    const { user } = useAuth();
    const { posts, loading: postsLoading } = useUserPosts(user?.uid);
    const { likedPosts, loading: likesLoading } = useLikedPosts(user?.uid);
    const { profile, setProfile, loading: profileLoading } = useUserProfile(user?.uid);
    
    const [activeTab, setActiveTab] = useState<'myPosts' | 'likedPosts'>('myPosts');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ bio: '', location: '', role: '', github: '', website: '' });
    const [isSaving, setIsSaving] = useState(false);

    if (!user && !postsLoading && !likesLoading) return <UnauthenticatedView />;

    const displayPosts = activeTab === 'myPosts' ? posts : likedPosts;
    const isLoading = activeTab === 'myPosts' ? postsLoading : likesLoading;
    const emptyMessage = activeTab === 'myPosts' ? "まだ投稿がありません。" : "まだいいねした投稿がありません。";

    // 編集モーダルを開く処理
    const openEditModal = () => {
        setEditData({
            bio: profile?.bio || '',
            location: profile?.location || '',
            role: profile?.role || '',
            github: profile?.github || '',
            website: profile?.website || ''
        });
        setIsEditing(true);
    };

    // 保存処理
    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            // merge: true をつけることで、既存のlikedPostsなどを消さずに更新できる
            await setDoc(userRef, {
                ...editData,
                updatedAt: new Date()
            }, { merge: true });
            
            setProfile(editData); // 画面の表示を即座に更新
            setIsEditing(false);
        } catch (error) {
            console.error("プロフィール保存エラー:", error);
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='flex h-screen bg-[#F9FAFB] text-gray-900 font-sans overflow-hidden relative'>
            <Sidebar />
            <main className='flex-1 md:ml-64 h-full relative pt-16 md:pt-0'>
                <div className="relative z-10 w-full h-full overflow-y-auto custom-scrollbar">
                    {/* ヘッダー背景 */}
                    <div className="h-48 w-full bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-b border-gray-200 relative">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                    </div>

                    <div className="max-w-5xl mx-auto px-6 pb-20">
                        {/* プロフィール情報エリア */}
                        <div className="relative -mt-16 mb-8 flex flex-col md:flex-row items-end md:items-center gap-6">
                            <div className="relative group shrink-0">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-200"></div>
                                <img 
                                    src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest"} 
                                    alt="Profile" 
                                    className="relative w-32 h-32 rounded-full border-4 border-white bg-white object-cover shadow-md"
                                />
                            </div>
                            <div className="flex-1 mb-2 text-center md:text-left">
                                <h1 className="text-3xl font-bold text-gray-900">{user?.displayName || "Guest User"}</h1>
                                <p className="text-gray-500 font-mono text-sm mt-1">@{user?.email?.split('@')[0] || "guest"}</p>
                            </div>
                            <button 
                                onClick={openEditModal}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-bold text-gray-700 shadow-sm mb-4 md:mb-0"
                            >
                                <Settings size={16} />
                                <span>プロフィール編集</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="md:col-span-2 space-y-5">
                                {/* 自己紹介文 */}
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {profile?.bio || "自己紹介がまだ設定されていません。"}
                                </p>
                                
                                {/* メタ情報タグ */}
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {profile?.role && (
                                        <div className="flex items-center gap-1.5"><Briefcase size={16} className="text-blue-500" /><span>{profile.role}</span></div>
                                    )}
                                    {profile?.location && (
                                        <div className="flex items-center gap-1.5"><MapPin size={16} className="text-red-400" /><span>{profile.location}</span></div>
                                    )}
                                    <div className="flex items-center gap-1.5"><Calendar size={16} className="text-gray-400" /><span>2025年11月から利用中</span></div>
                                </div>

                                {/* リンク */}
                                {(profile?.github || profile?.website) && (
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {profile?.github && (
                                            <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors">
                                                <Github size={14} /> GitHub
                                            </a>
                                        )}
                                        {profile?.website && (
                                            <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                                                <LinkIcon size={14} /> Website
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* スタッツ */}
                            <div className="bg-white border border-gray-100 rounded-3xl p-6 flex justify-around items-center shadow-sm h-fit">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-gray-900">{posts.length}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">投稿</div>
                                </div>
                                <div className="w-px h-10 bg-gray-100"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-gray-900">{likedPosts.length}</div>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">いいね</div>
                                </div>
                            </div>
                        </div>

                        {/* タブ切り替えUI */}
                        <div className="flex gap-6 border-b border-gray-200 mb-8 mt-4">
                            <button onClick={() => setActiveTab('myPosts')} className={`pb-3 font-bold text-base transition-colors ${activeTab === 'myPosts' ? 'border-b-[3px] border-blue-600 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>あなたの投稿</button>
                            <button onClick={() => setActiveTab('likedPosts')} className={`pb-3 font-bold text-base transition-colors ${activeTab === 'likedPosts' ? 'border-b-[3px] border-pink-500 text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>いいねした投稿</button>
                        </div>

                        {/* 投稿一覧エリア */}
                        {isLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
                        ) : displayPosts.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {displayPosts.map(post => <div key={post.id}><PostCard post={post} /></div>)}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed shadow-sm">
                                <p className="text-gray-500">{emptyMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* 編集モーダル */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                            <h2 className="text-lg font-bold text-gray-900">プロフィール編集</h2>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">自己紹介</label>
                                <textarea 
                                    value={editData.bio} onChange={e => setEditData({...editData, bio: e.target.value})}
                                    placeholder="自分について、好きな技術や趣味などを書いてみましょう。"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none h-24 text-sm"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">肩書き / 役割</label>
                                    <div className="relative">
                                        <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={editData.role} onChange={e => setEditData({...editData, role: e.target.value})} placeholder="例: 学生, デザイナー" className="w-full py-2.5 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">居住地</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} placeholder="例: 名古屋, 日本" className="w-full py-2.5 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">GitHub URL</label>
                                <div className="relative">
                                    <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="url" value={editData.github} onChange={e => setEditData({...editData, github: e.target.value})} placeholder="https://github.com/yourname" className="w-full py-2.5 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Webサイト / ポートフォリオ</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="url" value={editData.website} onChange={e => setEditData({...editData, website: e.target.value})} placeholder="https://..." className="w-full py-2.5 pl-10 pr-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">キャンセル</button>
                            <button onClick={handleSaveProfile} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50">
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                <span>保存する</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}