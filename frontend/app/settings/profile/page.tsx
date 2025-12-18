'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Camera, Save, User, Link as LinkIcon, AlignLeft 
} from 'lucide-react';
import Link from 'next/link';

export default function EditProfilePage() {
    // ダミー
    const [formData, setFormData] = useState({
        name: 'mizoguchi_kaketo',
        username: 'kaketo_dev',
        bio: 'HAL名古屋 IT学科 1年生。\nコードを書くことと、UIデザインが好きです。\nScriptShotの開発者。目指せ金賞！🥇',
        website: 'https://github.com/kaketo113'
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // ダミーの保存処理
        setTimeout(() => {
            setIsSaving(false);
            alert('Profile saved!');
        }, 1000);
    };

    return (
        <div className='min-h-screen bg-black text-white flex'>
            <Sidebar />

            <main className='flex-1 md:ml-64 min-h-screen'>
                <div className='max-w-2xl mx-auto p-6 pb-20'>

                    {/* ヘッダー */}
                    <header className='flex items-center gap-4 mb-8'>
                        <Link href="/settings" className='p-2 hover:bg-white/10 rounded-full transition-colors'>
                            <ArrowLeft className='w-5 h-5' />
                        </Link>
                        <h1 className='text-2xl font-bold'>Edit Profile</h1>
                    </header>

                    <form onSubmit={handleSave} className='space-y-8'>
                        <div>
                            <div>
                                <div>
                                    <img />
                                </div>


                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}