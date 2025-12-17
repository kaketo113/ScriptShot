'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { 
  ArrowLeft, Heart, MessageCircle, Share2, 
  MoreHorizontal, Sparkles, Bot, User, Send 
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const POST_DATA = {
  id: 1,
  user: {
    name: 'mizoguchi_kanto',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanto',
  },
  image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop',
  caption: 'Next.jsとFramer Motionでログイン画面のアニメーションを作ってみた！発光表現がいい感じ。',
  tags: ['Nextjs', 'TailwindCSS', 'FramerMotion'],
  likes: 128,
  comments: 5,
  time: '2h ago',
  //ダミーコード   
  code: `<span class="text-pink-400">export default</span> <span class="text-blue-400">function</span> <span class="text-yellow-300">LoginPage</span>() {
  <span class="text-pink-400">return</span> (
    &lt;<span class="text-green-400">motion.div</span>
      <span class="text-purple-400">initial</span>={{ <span class="text-orange-300">opacity</span>: 0 }}
      <span class="text-purple-400">animate</span>={{ <span class="text-orange-300">opacity</span>: 1 }}
    &gt;
      &lt;<span class="text-green-400">h1</span>&gt;Welcome&lt;/<span class="text-green-400">h1</span>&gt;
    &lt;/<span class="text-green-400">motion.div</span>&gt;
  );
}`
};

const AI_REVIEWS = [
  {
    type: 'suggestion',
    title: 'アクセシビリティの改善提案',
    content: '`motion.div` に `role="main"` を追加すると、スクリーンリーダー利用者にとってより親切な構造になります。',
    codeSuggestion: '<motion.div role="main" ...>'
  },
  {
    type: 'performance',
    title: 'レンダリング最適化',
    content: 'アニメーション要素が多いため、`layout` プロパティの使用を検討してください。GPU負荷を軽減できる可能性があります。',
  }
];

const USER_COMMENTS = [
  { id: 1, user: 'tanaka_dev', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', text: '発光のブラー具合が絶妙ですね！参考にします。' },
  { id: 2, user: 'suzuki_ui', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', text: 'コードも見やすくて助かります。' },
];

export default function PostDetailPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'comments'>('ai');
  const [isCodeOpen, setIsCodeOpen] = useState(true);

  return (
    <div className='min-h-screen bg-black text-white flex'>
        <Sidebar />

        <main className='flex-1 md:ml-64 min-h-screen relative'>

            {/* ヘッダー：戻るボタン */}
            <header className='sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 px-6 h-16 flex items-center gap-4'>
              <Link href="/" className='p-2 hover:bg-white' />
            </header>

            <div className='flex flex-col lg:flex-row h-[calc(100vh-64px)]'>

                {/* コンテンツ */}
                <div className='flex-1 overflow-y-auto custom-scrollbar border-r border-white/10'>

                    {/* 実行結果 */}
                    <div className='w-full aspect-video bg-[#111] relative group'>
                        <img src={POST_DATA.image} alt="Post Image" className='w-full h-full object-cover' />
                        <div className='absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-momo text-blue-400 border border-blue-500/30'>
                            Executed via ScriptShot
                        </div>
                    </div>

                    {/* 投稿情報 */}
                    <div className='p-4 border-b border-white/10'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-3'>
                                <img src={POST_DATA.user.avatar} className='w-10 h-10 rounded-full bg-gray-700' />
                                <div>
                                    <h3 className='font-bold text-sm'>{POST_DATA.user.name}</h3>
                                    <p className='text-xs text-gray-500'>{POST_DATA.time}</p>
                                </div>
                            </div>
                            <button className='text-gray-500 hover:text-white'>
                                <MoreHorizontal className='w-5 h-5' />
                            </button>
                        </div>
                        <p className='text-gray-200 mb-4 leading-relaxed'>{POST_DATA.caption}</p>
                        <div className='flex gap-2 mb-6'>
                            {POST_DATA.tags.map((tag) => (
                                <span key={tag} className='text-sm text-blue-400 bg-blue-900/10 px-2 py-1 rounded hover:bg-blue-900/20 cursor-pointer'>#{tag}</span>
                            ))}
                        </div>

                        {/* アクションボタン */}
                        <div className='flex gap-6'>
                            <button className='flex items-center gap-2 text-pink-500'><Heart className='w-6 h-6 fill-current' /> {POST_DATA.likes}</button>
                            <button className='flex items-center gap-2 text-gray-400 hover:text-white'><MessageCircle className='w-6 h-6' /> {POST_DATA.comments}</button>
                            <button className='flex items-center gap-2 text-gray-400 hover:text-white ml-auto'><Share2 className='w-6 h-6' /></button>
                        </div>
                    </div>

                    {/* ソースコード表示エリア */}
                    <div className='p-6'>
                        <button
                            onClick={() => setIsCodeOpen(!isCodeOpen)}
                            className='flex items-center justify-between w-full mb-4 text-sm font-bold text-gray-400 hover:text-white transition-colors'
                        >
                            <span>SOURCE CODE</span>
                            <span className='text-xs bg-[#222] px-2 py-1 rounded'>TypeScript</span>
                        </button>

                        {isCodeOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className='bg-[#111] rounded-xl border border-white/5 p-4 font-mono text-sm overflow-x-auto'
                            >
                                <pre className='text-gray-300' dangerouslySetInnerHTML={{ __html: POST_DATA.code }} />
                            </motion.div>
                        )}
                    </div>
                </div>
                
                {/* AIレビュー ＆ コメント */}
                <div className="w-full lg:w-[400px] bg-[#0c0c0c] flex flex-col">
            
                    {/* タブ */}
                    <div className="flex border-b border-white/10">
                    <button 
                        onClick={() => setActiveTab('ai')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'ai' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/5' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <Bot className="w-4 h-4" /> AI Review
                    </button>
                    <button 
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'comments' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Comments <span className="bg-[#222] text-xs px-1.5 rounded-full">{POST_DATA.comments}</span>
                    </button>
                    </div>

                    {/* タブコンテンツ */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'ai' ? (
                        <motion.div 
                            key="ai"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {/* AIレビューカード */}
                            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-sm">
                                <Sparkles className="w-4 h-4" />
                                ScriptShot AI Analysis
                            </div>
                            <p className="text-sm text-gray-300 mb-4">
                                全体的に素晴らしいコードです！以下のポイントを改善すると、さらにパフォーマンスが向上します。
                            </p>
                            
                            {AI_REVIEWS.map((review, i) => (
                                <div key={i} className="bg-[#0a0a0a]/50 rounded-lg p-3 mb-2 border border-white/5">
                                <h4 className="text-xs font-bold text-cyan-200 mb-1 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                                    {review.title}
                                </h4>
                                <p className="text-xs text-gray-400 leading-relaxed">{review.content}</p>
                                {review.codeSuggestion && (
                                    <div className="mt-2 bg-black rounded p-2 text-[10px] font-mono text-green-300 border border-white/5">
                                    {review.codeSuggestion}
                                    </div>
                                )}
                                </div>
                            ))}
                            </div>
                        </motion.div>
                        ) : (
                        <motion.div 
                            key="comments"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            {USER_COMMENTS.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.avatar} className="w-8 h-8 rounded-full bg-gray-700" />
                                <div className="flex-1">
                                <div className="bg-[#1a1a1a] rounded-lg p-3 rounded-tl-none">
                                    <span className="text-xs font-bold text-gray-400 block mb-1">{comment.user}</span>
                                    <p className="text-sm text-gray-200">{comment.text}</p>
                                </div>
                                <div className="flex gap-3 mt-1 ml-1">
                                    <button className="text-xs text-gray-500 hover:text-white">Reply</button>
                                    <button className="text-xs text-gray-500 hover:text-white">Like</button>
                                </div>
                                </div>
                            </div>
                            ))}
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </div>

                    {/* コメント入力欄 */}
                    <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
                    <div className="relative">
                        <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="w-full bg-[#161616] border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:bg-blue-500/10 rounded-full transition-colors">
                        <Send className="w-4 h-4" />
                        </button>
                    </div>
                    </div>

                </div>
            </div>

        </main>
    </div>
    );
}