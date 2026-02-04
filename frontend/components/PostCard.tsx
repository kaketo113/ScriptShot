import React from 'react';
import { Heart, MessageCircle, Share2, Code2 } from 'lucide-react'; // アイコン追加

// Firestoreのデータ構造に合わせた型定義
// (本来は types/post.ts などに切り出すのが綺麗ですが、今はここで定義します)
export type PostData = {
  id: string;
  userName: string;
  userAvatar: string;
  code: string;
  thumbnail?: string | null; // Base64画像
  caption?: string;
  likes: number;
  comments: number;
};

type PostCardProps = {
  post: PostData;
};

export function PostCard({ post }: PostCardProps) {
  return (
    // ダークモード仕様のデザインに変更
    <article className="border border-white/10 rounded-xl bg-[#1e1e1e] overflow-hidden hover:border-white/20 transition-colors">
      
      {/* 1. ヘッダー: 投稿者情報 */}
      <div className="p-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          {/* アバター画像 */}
          <img
            src={post.userAvatar}
            alt={post.userName}
            className="w-8 h-8 rounded-full bg-gray-700 object-cover"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-200">{post.userName}</span>
            <span className="text-[10px] text-gray-500">Just now</span>
          </div>
        </div>
        {/* 言語タグ（仮） */}
        <div className="px-2 py-1 rounded bg-[#111] border border-white/10 text-[10px] text-orange-400 font-mono flex items-center gap-1">
          <Code2 size={10} />
          <span>HTML</span>
        </div>
      </div>

      {/* 2. メインコンテンツ: テキストと画像の2カラムレイアウト */}
      <div className="flex flex-col md:flex-row h-auto md:h-64">
        
        {/* 左側: コードプレビュー（少しだけ見せる） */}
        <div className="w-full md:w-1/2 bg-[#111] p-4 overflow-hidden border-b md:border-b-0 md:border-r border-white/5 relative group">
          <div className="absolute top-2 left-3 text-[10px] text-gray-500 font-mono">CODE PREVIEW</div>
          <pre className="text-[10px] font-mono text-gray-400 leading-relaxed opacity-70 mt-4">
            {post.code.slice(0, 300)}...
          </pre>
          {/* グラデーションで消す演出 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 右側: 生成された画像（ここが主役！） */}
        <div className="w-full md:w-1/2 bg-[#000] relative flex items-center justify-center p-4">
          <div className="absolute top-2 right-3 text-[10px] text-gray-500 font-mono z-10 bg-black/50 px-2 rounded">PREVIEW</div>
          
          {post.thumbnail ? (
            <div className="relative w-full h-full flex items-center justify-center">
               {/* 単純なimgタグを使用（Base64の表示に確実） */}
              <img
                src={post.thumbnail}
                alt="Preview"
                className="max-w-full max-h-full rounded shadow-2xl border border-white/10 object-contain"
              />
            </div>
          ) : (
            <div className="text-gray-600 text-xs">No Preview</div>
          )}
        </div>
      </div>

      {/* 3. フッター: アクションボタン */}
      <div className="p-3 border-t border-white/5 flex items-center gap-6 text-gray-400">
        <button className="flex items-center gap-2 hover:text-pink-500 transition-colors group">
          <Heart className="w-5 h-5 group-hover:fill-pink-500/20" />
          <span className="text-xs font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-medium">{post.comments}</span>
        </button>
        <div className="ml-auto">
          <button className="hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* キャプションがあれば表示 */}
      {post.caption && (
         <div className="px-4 pb-4 pt-0 text-sm text-gray-300">
            <span className="font-bold mr-2 text-white">{post.userName}</span>
            {post.caption}
         </div>
      )}

    </article>
  );
}