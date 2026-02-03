import React from 'react';
// AuthContextのパスを相対パスで指定 (app/layout.tsx から見て ./context/AuthContext)
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "ScriptShot",
  description: "Share your code snippets visually.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-black text-white">
        {/* AuthProviderでアプリ全体を包み、認証機能を利用可能にする */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}