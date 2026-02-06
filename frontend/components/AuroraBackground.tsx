'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AuroraBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
            {/* 1. ベースの深い青色（ここが重要：真っ黒にしない） */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#000000] to-[#000000]" />

            {/* 2. 強烈な光の柱（シアン） */}
            <motion.div 
                animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute -top-[300px] left-[20%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"
            />

            {/* 3. 漂う光の霧（紫） */}
            <motion.div 
                animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"
            />

            {/* 4. 底から湧き上がる光（青） */}
            <div className="absolute bottom-[-200px] left-0 right-0 h-[400px] bg-blue-900/20 blur-[100px]" />

            {/* 5. グリッドパターン（濃くして視認性を上げる） */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            
            {/* 6. ノイズ（質感をプラス） */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};