'use client';

import React, { useState } from 'react';
import { BlocklyWorkspace } from 'react-blockly'; 
import { Play, Image as  ImageIcon, Loader2,Code2, Box, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {  javascriptGenerator } from 'blockly/javascript';
import 'blockly/msg/ja';//日本語化

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
        {
            kind:'category',
            name: '変数',
            colour: '#5C5CA6',
            contents: [
                {kind: 'block', type: 'variables_get'},//変数の取得
                {kind: 'block', type: 'variables_set'},//変数の設定
            ],
        },
    ],
};

export default function CreateBlockPage() {
    const [generatedCode, setGeneratedCode] = useState('');//生成されたコードを保存するステート
    const router = useRouter();

    const handleSwitchToText = () => {
        router.push('/create');
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
        <div className='min-h-screen bg-black text-white flex flex-col'>

            <main className='flex-1 min-h-screen flex flex-col h-screen'>

                {/* header */}
                <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black">

                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="font-bold text-lg">Create New Post</h2>
                    </div>


                    <div className="flex bg-[#161616] p-1 rounded-lg border border-white/5">
                        <button 
                            onClick={handleSwitchToText}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all text-gray-400 hover:text-white hover:bg-white/5`}
                        >
                        <Code2 className="w-4 h-4" /> Text
                        </button>
                        <button 
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm transition-all bg-blue-600 text-white shadow-lg`}
                        >
                        <Box className="w-4 h-4" /> Block
                        </button>
                    </div>

                    <div className="w-40 flex justify-end">
                        {/* TODO:下書き保存ボタン */}
                    </div>
                </header>

                {/* 実行ボタン */}
                <button
                    onClick={runCode}
                    className='flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors'
                >
                    <Play className='w-5 h-5' />
                    Run Code
                </button>

                <div className='flex-1 flex overflow-hidden p-4 gap-4'>
                
                    {/* Blocklyエディタ */}
                    <div className='flex-1 border border-gray-700 rounded-lg overflow-hidden bg-white relative min-h-[500px]'>
                        <BlocklyWorkspace
                            className='w-full h-full absolute inset-0'
                            toolboxConfiguration={initalbox}//定義したオブジェクトを渡す
                            initialXml='<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
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
                                renderer: 'geras',
                            }}
                            onWorkspaceChange={onWorkspaceChange}
                        />
                    </div>

                    <div className='w-80 bg-[#111] border border-white/10 p-4 flex flex-col rounded-lg'>
                        <h3 className='text-sm font-bold text-gray-500 mb-2 uppercase'>Real-time Code</h3>
                        <pre className='flex-1 bg-black p-4 rounded-lg text-green-400 font-mono text-xs overflow-auto border border-white/5'>
                            {generatedCode}
                        </pre>
                    </div>

                </div>
            </main>
        </div>
    );
}