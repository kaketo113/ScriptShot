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
                    
                </div>
            </main>
        </div>
    )
}