'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { motion } from 'framer-motion';
import { 
  User, Lock, Moon, LogOut, ChevronRight, Bell, Shield, EyeOff 
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [zenMode, setZenMode] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);

    // トグルスイッチ
    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <button
            onClick={onChange}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}
        >
            <motion.div
                className="w-4 h-4 bg-white rounded-full shadow-md"
                animate={{ x: checked ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        </button>
    );

    return (
        <div className="min-h-screen bg-black text-white flex">
            <Sidebar />

            <main className="flex-1 md:ml-64 min-h-screen">
                <div className="max-w-2xl mx-auto p-6 pb-20">

                    <h1 className="text-2xl font-bold mb-8">Settings</h1>

                    <div className="space-y-8">

                        {/* アカウント設定 */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Account</h2>
                            <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">

                                <Link href="/settings/profile" className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group">
                                    <div className="flex items-center gap-4">
                                        <div className='p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:text-blue-300'>
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className='font-medium'>Edit Profile</div>
                                            <div className='text-xs text-gray-500'>Change your avatar, bio, and links</div>
                                        </div>
                                    </div>
                                    <ChevronRight className='w-5 h-5 text-gray-600' />
                                </Link>

                                <button className='w-full flwx items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group text-left'>
                                    <div className="flex items-center gap-4">
                                        <div className='p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300'>
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className='font-medium'>Password & Security</div>
                                            <div className='text-xs text-gray-500'>Update password and 2FA</div>
                                        </div>
                                    </div>
                                    <ChevronRight className='w-5 h-5 text-gray-600' />
                                </button>

                                <button className='w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group text-left'>
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400 group-hover:text-green-300">
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">Notifications</div>
                                            <div className="text-xs text-gray-500">Manage email and push notifications</div>
                                        </div>
                                    </div>
                                    <Toggle checked={emailNotif} onChange={() => setEmailNotif(!emailNotif)} />
                                </button>

                            </div>
                        </section>

                        {/* 表示設定セクション */}
                        <section>
                            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Appearance</h2>
                            <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                
                                <div className="flex items-center justify-between p-4 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                            <Moon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Dark Mode</div>
                                        <div className="text-xs text-gray-500">Always on for pro developers</div>
                                    </div>
                                </div>
                            <span className="text-xs font-bold bg-[#333] text-gray-300 px-2 py-1 rounded">ON</span>
                        </div>

                        {/* Zen Mode */}
                        <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                    <EyeOff className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-medium">Zen Mode</div>
                                    <div className="text-xs text-gray-500">Hide like counts and followers to focus on code</div>
                                </div>
                            </div>
                            <Toggle checked={zenMode} onChange={() => setZenMode(!zenMode)} />
                        </div>

                    </div>
                </section>

                {/* その他セクション */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Other</h2>
                    <div className="bg-[#161616] border border-white/5 rounded-xl overflow-hidden">
                
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group text-left">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400 group-hover:text-white">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Privacy Policy</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>

                        <button className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 transition-colors group text-left">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-red-500">Log out</div>
                                <div className="text-xs text-gray-500 group-hover:text-red-400/70">Sign out of your account</div>
                            </div>
                        </button>

                    </div>
                </section>

                {/* バージョン情報 */}
                <div className="text-center pt-8 text-xs text-gray-600">
                    <p>ScriptShot v1.0.0 (Beta)</p>
                    <p className="mt-1">Built with Next.js & Python</p>
                </div>

          </div>
        </div>
      </main>
    </div>
    )
}