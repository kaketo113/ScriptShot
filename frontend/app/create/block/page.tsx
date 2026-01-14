'use client';

import React from 'react';
import { BlocklyWorkspace } from 'react-blockly'; 
import { Sidebar } from '@/components/Sidebar';

export default function CreateBlockPage() {
    const initalbox = {
        kind: 'categoryToolbox',
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
            {
                kind:'category',
                name: 'ループ',
                colour: '#5CA65C',
                contents: [
                    {kind: 'block', type: 'controls_repeat_ext'},//繰り返し
                    {kind: 'block', type: 'controls_whileUntil'},//～の間
                ],
            },
        ],
    };

    return (
        <div className='mini-h-screen bg-black text-white flex'>
            <Sidebar />

            <main className='flex-1 md:ml-64 min-h-screen p-4 flex flex-col h-screen'>
                <h1 className='text-xl font-bold mb-4 mt-2'>Block Coding (Step 1: 表示テスト)</h1>

                <div className='flex-1 border border-gray-700 rounded-lg overflow-hidden bg-white relative min-h-[500px]'>
                    <BlocklyWorkspace
                        className='w-full h-full absolute inset-0'
                        toolboxConfiguration={initalbox}//定義したオブジェクトを渡す
                        workspaceConfiguration={{
                            grid: {
                                spacing: 20,
                                length: 3,
                                colour: '#ccc',
                                snap: true,
                            },
                            //表示崩れ防止
                            move: {
                                scrollbars: true,
                                drag: true,
                                wheel: true,
                            },
                        }}
                        onWorkspaceChange={(worksoace) => {
                            console.log('ブロックが動きました');
                        }}
                    />
                </div>

            </main>
        </div>
    );
}