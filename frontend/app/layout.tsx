import React from 'react';
import "./globals.css"; 
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}