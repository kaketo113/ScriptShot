import React from 'react';
import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

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
        {/* この AuthProvider が無いと、ログインしても画面は変わらない */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}