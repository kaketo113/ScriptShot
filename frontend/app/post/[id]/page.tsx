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
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  )
}