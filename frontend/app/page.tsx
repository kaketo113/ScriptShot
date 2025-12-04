'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Search, PlusSquare, Bell, User, LogOut, 
  Heart, MessageCircle, Share2, MoreHorizontal, Code2 
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Dummy Data
const MOCK_POSTS = [
  {
    id: 1,
    user: {
      name: 'mizoguchi kaketo',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kanto', 
    },
    content: 'ダミーデータ',
    tags: ['Nextjs', 'TailwindCSS', 'FramerMotion'],
    image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=1000&auto=format&fit=crop',
    likes: 120,
    comments: 15,
    time: '2h ago',
    codeSnippet: `motion.div 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }}`
  },
  {
    id: 2,
    user: {
      name: 'tanaka_dev',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    },
    content: 'PythonのPandasでデータ分析。グラフ描画の結果です。 #Python #DataScience',
    tags: ['Python', 'Pandas', 'Matplotlib'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    likes: 85,
    comments: 4,
    time: '5h ago',
    codeSnippet: `import pandas as pd
df = pd.read_csv('data.csv')
df.plot()`
  },
];

