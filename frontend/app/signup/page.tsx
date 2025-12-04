'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("新規登録処理を実行します...");
    // TODO: バックエンドAPI (/register) への接続
  };

  return (
    <div className='min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-4 relative overflow-hidden'>

        {/* 背景 */}
        <div className='absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none' />
        <div className='absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none' />

        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='w-full max-w-md bg-[#161616] border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10'
        >
            {/* ヘッダー */}
            <div className='text-center mb-8'>
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className='inline-flex items-center gap-2 mb-2'
                >
                    <Sparkles className='w-5 h-5 text-cyan-400' />
                    <span className='text-sm font-bold text-cyan-400 tracking-wider uppercase'>Join the Community</span>
                </motion.div>
                <h1 className='text-3xl font-bold mb-2'>アカウントを作成</h1>
                <p className='text-gray-400 text-sm'>エンジニアとしての旅を始めましょう。</p>
            </div>

            {/* 登録フォーム */}
            <form onSubmit={handleSignup} className='space-y-5'>

                {/* ユーザー名 */}
                <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Username</label>
                    <div className='relative group'>
                        <User className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors' />
                        <input
                            type='text'
                            placeholder='username'
                            className='w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                            required
                        />
                    </div>
                </div>

                {/* Email */}
                <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Email</label>
                    <div className='relative group'>
                        <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors' />
                        <input
                            type='email'
                            placeholder='Email@example.com'
                            className='w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                            required
                        />
                    </div>
                </div>

                {/* パスワード */}
                <div className='space-y-1.5'>
                    <label className='text-xs font-medium text-gray-400 uppercase tracking-wider'>Password</label>
                    <div className='relative group'>
                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors' />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder='・・・・・・・・・'
                            className='w-full bg-[#0f0f0f] border border-white/10 rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all'
                            required
                        />
                        <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors'
                        >
                            {showPassword ? <EyeOff className='w-5 h-5' /> : <EyeOff className='w-5 h-5' />}
                        </button>
                    </div>
                </div>

                {/* 利用規約 */}
                    <div className='flex items-start gap-3 py-2'>
                        <div className='flex h-5 items-center'>
                            <input
                                id='terms'
                                type='checkbox'
                                className='h-4 w-4 rounded border-gray-600 bg-[#0f0f0f] text-cyan-500 focus:ring-cyan-500 focus:ring-offset-gray-900'
                                required
                            />
                        </div>
                        <label htmlFor='terms' className='text-xs text-gray-400 leading-tight'>
                            <a href='#' className='text-cyan-400 hover:underline'>利用規約</a>と<a href='#' className='text-cyan-400 hover:underline'>プライバシーポリシー</a>に同意します。
                        </label>
                    </div>

                    {/* 登録ボタン */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 transition-all'
                        type='submit'
                    >
                        <span>ScriptShotを始める</span>
                        <ArrowRight className='w-4 h-4' />
                    </motion.button>

                </form>

                {/* ログイン画面へのリンク */}
                <div className='mt-8 text-center text-sm text-gray-500'>
                    すでにアカウントをお持ちですか？{' '}
                    <Link href='/login' className='text-white hover:underline decoration-cyan-500 underline-offset-4'>
                        ログインはこちら
                    </Link>
                </div>

        </motion.div>
    </div>
  );
}