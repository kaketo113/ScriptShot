'use client';

import React from 'react';
import { BlocklyWorkspace } from 'react-blockly'; 
import { Sidebar } from '@/components/Sidebar';

export default function CreateBlockPage() {
    const initalbox = {
        kind: 'createBlock',
        contents: [
            {
                kind:'category',
                name: '基本',
                colour: '#5C81A6',
                contents: [
                    {kind: 'block', type: 'controls_if'},//もし～なら
                    {kind: 'block', type: 'logic_compare'},//比較
                    {kind: 'block', type: 'math_number'},//数値
                    {kind: 'block', type: 'text'},//テキスト
                    {kind: 'block', type: 'text_print'},//表示
                ],
            },
        ],
    };