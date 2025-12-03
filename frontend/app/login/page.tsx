import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [ showPassword, setShowPassword ] = useState(false);

    // 送信用ダミー処理
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("ログインボタン押（バックエンド未実装）")
        // 将来的にAPI呼び出し等をここに実装
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden">

            {/* 背景 */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            {/* メイン */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut"}}
                className='w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10'
            >
                {/* ロゴ */}
                <div className='text-center mb-8'>
                    <motion.h1
                        className='text-4xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        ScriptShot
                    </motion.h1>
                    <p className='text-gray-400 text-sm'>コードが「作品」になる場所へようこそ。</p>
                </div>

                
            </motion.div>