"use client";
import { useEffect, useState } from "react";
import { auth } from "@/firebase";
import { redirect } from "next/navigation";
import AdminCodeGenerator from "@/components/AdminCodeGenerator";
import AdminDupReset from "@/components/AdminDupReset";

export default function AdminFanboxCodePage() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = auth.onIdTokenChanged(async (u) => {
      if (!u) {
        setOk(false);
        return;
      }
      const token = await u.getIdTokenResult(true);
      setOk(token.claims?.admin === true);
    });
    return unsub;
  }, []);

  if (ok === null) return <p>認証確認中...</p>; // ← ローディング表示に変更してもOK
  if (!ok) redirect("/"); // 権限なしはトップへ

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <AdminCodeGenerator />
      <AdminDupReset /> {/* ★ここで複製回数リセットを追加 */}
    </main>
  );
}
