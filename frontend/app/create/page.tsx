'use client';

import React, { useState } from 'react';
import { Play, Image as ImageIcon, Loader2, Code2, Box, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { h1 } from 'framer-motion/client';

export default function CreatePage() {
    const router = useRouter();
    const [code, setCode] = useState(`<!-- ここにコードを入力 -->
        <h1>Hello, ScriptShot!</h1>
        <style>
            h1 { color: blue; }
        </style>`);
        
        ``);