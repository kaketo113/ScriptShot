'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    User 
} from 'firebase/auth';
// lib/firebaseの場所に合わせてパスを調整してください（現在はルート直下を想定）
import { auth, googleProvider } from '../lib/firebase'; 

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => {},
    logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // アプリ起動時に「ログインしてるか？」を監視
    useEffect(() => {
        console.log("AuthContext: Start monitoring auth state...");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("AuthContext: User state changed!", currentUser?.email); // ログ追加
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Googleログイン実行
    const login = async () => {
        try {
            console.log("AuthContext: Starting login popup...");
            await signInWithPopup(auth, googleProvider);
            console.log("AuthContext: Popup closed, login processing...");
        } catch (error) {
            console.error("Login failed:", error);
            alert("ログインに失敗しました。");
        }
    };

    // ログアウト実行
    const logout = async () => {
        try {
            await signOut(auth);
            console.log("AuthContext: Logged out");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};