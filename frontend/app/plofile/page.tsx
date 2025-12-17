'use client'

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Share2, MapPin, Link as LinkIcon, Calendar, Heart, Star, Clock } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

// ダミー

const SKILL_DATA = [
  { subject: 'Next.js', A: 120, fullMark: 150 },
  { subject: 'React', A: 98, fullMark: 150 },
  { subject: 'TypeScript', A: 86, fullMark: 150 },
  { subject: 'Python', A: 99, fullMark: 150 },
  { subject: 'Flask', A: 85, fullMark: 150 },
  { subject: 'CSS/Tailwind', A: 65, fullMark: 150 },
];

export default function ProfilePage() {
    const [activeHighlightTab, setActiveHighlightTab] = useState<'recent' | 'favorite'>('recent');

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />

            <main className="flex-1 md:ml-64 min-h-screen">

                {/* 背景 */}
                <div className="h-48 bg-gradient-to-r from-blue-900/40 to-purple-900/40 w-full relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns.png')] opacity-20"></div>
                </div>

                <div className="max-w-6xl mx-auto px-6 pb-20 -mt-20 relative z-10">


                    <div className="flex flex-col md:flex-row items-end md:items-center gap-6 mb-8">
                        {/* アイコン */}
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            className="w-32 h-32 rounded-full border-4 border-black bg-gray-800 overflow-hidden relative shadow-2xl"
                        >
                            <img src="https://zukan.pokemon.co.jp/zukan-api/up/images/index/48cd90ca9aef38ad6384fc5e148696ef.png" alt="user" className="w-full h-full object-cover" />
                        </motion.div>

                        {/* 名前 */}
                        <div className="flex-1 mb-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-bold">User_tama</h1>
                                    <p className="text-gray-400">@tama_dev</p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-4 py-2 border border-white/20 rounded-lg font-medium hover:bg-white/10 transition-colors text-sm">
                                        編集
                                    </button>
                                    <button className="p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                </div>
            </main>
        </div>
    )
}