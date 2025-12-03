'use client';

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

                {/* ログインフォーム */}
                <form onSubmit={handleSubmit} className='space-y-6'>

                    {/* メールアドレス */}
                    <div className='space-y-2'>
                        <label className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</label>
                        <div className='relative group'>
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="email"
                                placeholder='hello@example.com'
                                className='w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all'
                            />
                        </div>
                    </div>

                    {/* パスワード */}
                    <div className='space-y-2'>
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                        <Link href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            パスワードを忘れた場合
                        </Link>
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••"
                            className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* ログインボタン */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                    <span>ログイン</span>
                    <ArrowRight className="w-4 h-4" />
                </motion.button>

            </form>

            {/* 新規会員登録 */}
            <div className='mt-8 text-center text-sm text-gray-500'>
                アカウントをお持ちでないですか？{' '}
                <Link href="/signup" className='text-white hover:underline decoration-blue-500 underline-offset4'>
                    新規登録を作成
                </Link>
            </div>

        </motion.div>
    </div>
);
}