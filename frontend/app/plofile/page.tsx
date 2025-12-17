'use client'

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Share2, MapPin, Link as LinkIcon, Calendar, Heart, Star, Clock } from 'lucide-react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer 
} from 'recharts';
