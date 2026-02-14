'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={`relative flex flex-col h-[100vh] items-center justify-center bg-[#F9FAFB] text-gray-900 transition-bg overflow-hidden ${className || ''}`}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`
            absolute -inset-[10px] opacity-100
            will-change-transform
            filter blur-[60px]
          `}
        >
          {/* 背景のグラデーションアニメーション (白背景用パステルカラー) */}
          <motion.div
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ 
                opacity: [0.3, 0.5, 0.3], 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-300/40 rounded-full mix-blend-multiply"
          />
          <motion.div
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ 
                opacity: [0.3, 0.5, 0.3], 
                scale: [1, 1.3, 1],
                x: [0, 50, -50, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-300/40 rounded-full mix-blend-multiply"
          />
          <motion.div
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ 
                opacity: [0.3, 0.5, 0.3], 
                scale: [1, 1.1, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-300/30 rounded-full mix-blend-multiply"
          />
        </div>
      </div>
      
      {/* コンテンツ表示エリア */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};