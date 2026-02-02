'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    signInWithPopup, 
    signOut, 
    User 
} from 'firebase/auth';
// パス: app/context から見て ../lib/firebase
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

// ★重要: エラーの原因はこの行がない（またはexportされていない）ことです
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: 認証状態の監視を開始します...");
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("AuthContext: 認証状態が変化しました:", currentUser ? "ログイン済み" : "未ログイン", currentUser?.uid);
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            console.log("AuthContext: Googleログインを開始します...");
            const result = await signInWithPopup(auth, googleProvider);
            console.log("AuthContext: ログイン成功！", result.user.uid);
        } catch (error: any) {
            console.error("AuthContext: ログイン失敗", error);
            console.error("Error Code:", error.code);
            console.error("Error Message:", error.message);
            alert(`ログインに失敗しました。\nエラー: ${error.message}`);
        }
    };

    const logout = async () => {
        try {
            console.log("AuthContext: ログアウト処理を開始します...");
            await signOut(auth);
            console.log("AuthContext: ログアウトしました");
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