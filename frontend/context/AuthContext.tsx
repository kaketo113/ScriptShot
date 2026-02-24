'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut as firebaseSignOut, 
    onAuthStateChanged, 
    User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

// 1. 型定義
interface AuthContextType {
    user: User | null;
    loading: boolean; // 認証状態の確認中かどうか
    login: () => Promise<void>;
    logout: () => Promise<void>;
}

// 2. Contextの作成
// 初期値を undefined にしてProvider外での誤使用を検知できるようにする
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Providerコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // 初期値は true 

    useEffect(() => {
        // Firebaseの認証状態の監視
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false); // 状態の確認が完了したら loading を false に
        });

        // クリーンアップ関数
        return () => unsubscribe();
    }, []);

    const login = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("ログインに失敗しました:", error);
            throw error; // 呼び出し元でエラーを扱えるように再スロー
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("ログアウトに失敗しました:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. カスタムフック
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    // Providerの外でフックが使われたら即座にエラーを出す
    if (context === undefined) {
        throw new Error('useAuthは、必ずAuthProviderの子コンポーネント内で使用してください');
    }
    
    return context;
};