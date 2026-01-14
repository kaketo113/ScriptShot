'use client';

import React, { useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly'; 
import { Sidebar } from '@/components/Sidebar';
import { Play, ArrowLeft, ImportIcon } from 'lucide-react';
import Link from 'next/link';

import Blockly from 'blockly';
import {  javascriptGenerator } from 'blockly/javascript';
import 'blockly/msg/ja';//日本語化

export default function CreateBlockPage() {
    const [generatedCode, setGeneratedCode] = useState('');//生成されたコードを保存するステート

    //Blocklyのツールボックス定義
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

    //ブロックが動かされたら「コードを生成」してStateに保存
    const onWorkspaceChange = (workspace: any) => {
        const code = javascriptGenerator.workspaceToCode(workspace);
        setGeneratedCode(code);
    };

    //生成されたコードを実行する関数
    const runCode = () => {
        if (!generatedCode) {
            alert('コードが生成されていません。');
            return;
        }

        try {
            const runUserCode = new Function(generatedCode);    //function:新しい関数オブジェクトを作成
            runUserCode();
        } catch (error) {   //catch:エラーが発生した場合の処理
            alert('コードの実行中にエラーが発生しました: ' + error);
        }
    };

    return (
        <div className='mini-h-screen bg-black text-white flex'>
            <Sidebar />

            <main className='flex-1 md:ml-64 min-h-screen p-4 flex flex-col h-screen'>

                {/* header */}
                <header className='h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a]'>
                    <div className='flex items-center gap-4'>
                        <Link href='/create' className='text-gray-400 hover:text-white'>
                            <ArrowLeft className='w-5 h-5' />
                        </Link>
                    </div>
                </header>

                {/* 実行ボタン */}
                <button
                    onClick={runCode}
                    className='flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors'
                >
                    <Play className='w-5 h-5' />
                    コードを実行
                </button>
                
                {/* Blocklyエディタ */}
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