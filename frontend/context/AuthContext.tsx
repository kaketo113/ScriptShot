'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

// ★ここが修正ポイント！型定義に新しい項目を追加します
interface AuthContextType {
    user: User | null;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    hasPosted: boolean;       // 追加
    markAsPosted: () => void; // 追加
}

// 初期値にもダミー関数を入れておく（エラー回避のため）
const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => {},
    logout: async () => {},
    hasPosted: false,
    markAsPosted: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [hasPosted, setHasPosted] = useState(false);

    useEffect(() => {
        // マウント時にセッションストレージを確認
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('scriptshot_has_posted');
            if (stored === 'true') {
                setHasPosted(true);
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // ログインし直した時はリセット（バナーを表示する）
        setHasPosted(false);
        sessionStorage.removeItem('scriptshot_has_posted');
    };

    const logout = async () => {
        await firebaseSignOut(auth);
        // ログアウト時もリセット
        setHasPosted(false);
        sessionStorage.removeItem('scriptshot_has_posted');
    };

    const markAsPosted = () => {
        setHasPosted(true);
        sessionStorage.setItem('scriptshot_has_posted', 'true');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, hasPosted, markAsPosted }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);