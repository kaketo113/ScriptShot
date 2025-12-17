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

}