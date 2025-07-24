"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, updateDoc, Timestamp} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteDoc, doc } from "firebase/firestore";

export default function MyPage() {
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const baseQuery = query(
          collection(db, "characters"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(baseQuery);

        const withFix: any[] = [];

        // updatedAtが無いデータに現在時刻を追加して保存
        for (const d of snap.docs) {
          const data = d.data();
          if (!data.updatedAt) {
            await updateDoc(doc(db, "characters", d.id), {
              updatedAt: Timestamp.now(),
            });
            data.updatedAt = Timestamp.now(); // 画面にも反映させる
          }
          withFix.push({ id: d.id, ...data });
        }

        // 更新順に並び替え（降順）
        withFix.sort(
          (a, b) =>
            b.updatedAt?.seconds - a.updatedAt?.seconds
        );

        setSheets(withFix);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <p className="p-4">読み込み中...</p>;

  if (!user) {
    return (
      <main className="p-8 text-center">
        <p className="text-xl text-gray-600">ログインが必要です。</p>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">
          ホームに戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl font-bold">マイキャラクター一覧</h1>
      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        ホームへ戻る
      </button>
    </div>

      {sheets.length === 0 ? (
        <p className="text-gray-600">まだキャラクターが登録されていません。</p>
      ) : (
        <ul className="space-y-4">
        {sheets.map((sheet) => (
            <li key={sheet.id} className="p-4 bg-white shadow rounded flex justify-between items-center">
            <span className="font-semibold">
                {sheet.name || "名前未設定"}　
                {sheet.form?.fate && sheet.form?.origin && (
                  <span className="text-gray-600 text-sm">{sheet.form.fate}の{sheet.form.origin}</span>
                )}
              </span>
            <div className="flex gap-2">
                <button
                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                onClick={() => router.push(`/character/${sheet.id}`)}
                >
                閲覧
                </button>

                <button
                className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                onClick={() => router.push(`/create?id=${sheet.id}`)}
                >
                編集
                </button>

                <button
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={async () => {
                    const confirmed = window.confirm("本当にこのキャラクターを削除しますか？");
                    if (confirmed) {
                    try {
                        await deleteDoc(doc(db, "characters", sheet.id));
                        setSheets((prev) => prev.filter((s) => s.id !== sheet.id));
                        alert("キャラクターを削除しました。");
                    } catch (err) {
                        console.error("削除エラー:", err);
                        alert("削除に失敗しました。");
                    }
                    }
                }}
                >
                削除
                </button>
            </div>
            </li>
        ))}
        </ul>

      )}
    </main>
  );
}
