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
        <div>
            <Sidebar />

            <main>
                <div>
                    <header>
                        <Link href="/settings">
                            <ArrowLeft />
                        </Link>
                        <h1>Edit Profile</h1>
                    </header>
                </div>
            </main>
        </div>
    )
}