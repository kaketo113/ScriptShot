'use client'

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Share2, MapPin, Link as LinkIcon, Calendar, Heart, Star, Clock } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';

// ダミー

const SKILL_DATA = [
  { subject: 'Next.js', A: 120, fullMark: 150 },
  { subject: 'React', A: 98, fullMark: 150 },
  { subject: 'TypeScript', A: 86, fullMark: 150 },
  { subject: 'Python', A: 99, fullMark: 150 },
  { subject: 'Flask', A: 85, fullMark: 150 },
  { subject: 'CSS/Tailwind', A: 65, fullMark: 150 },
];

