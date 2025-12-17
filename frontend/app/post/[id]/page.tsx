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

            </div>
        </main>
    </div>
  )
}