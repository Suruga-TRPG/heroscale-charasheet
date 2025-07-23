"use client";

import { useEffect, useState } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";

export default function LoginPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("ログインに失敗しました");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("ログアウトに失敗しました");
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">ログインページ</h1>

      {user ? (
        <div>
          <p className="mb-2">ログイン中: {user.displayName}</p>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            ログアウト
          </button>
        </div>
      ) : (
        <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded">
          Googleでログイン
        </button>
      )}
    </main>
  );
}
