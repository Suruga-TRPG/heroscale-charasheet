"use client";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, functions } from "@/firebase";
import { httpsCallable } from "firebase/functions";

type CharInfo = { id: string; name: string; userId: string; rootId: string };
type Counter = { used: number; limit: number; remaining: number; exists: boolean };

export default function AdminDupReset() {
  const [charIdInput, setCharIdInput] = useState("");
  const [info, setInfo] = useState<CharInfo | null>(null);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchCounter = async (uid: string, rootId: string) => {
    const call = httpsCallable(functions, "adminGetDupCounter");
    const res: any = await call({ uid, rootId });
    const { used, limit, remaining, exists } = res.data as any;
    setCounter({ used, limit, remaining, exists });
  };

  const fetchInfo = async () => {
    setMsg(null); setInfo(null); setCounter(null);
    const id = charIdInput.trim();
    if (!id) { setMsg("キャラクターIDを入力してください"); return; }

    setLoading(true);
    try {
      const ref = doc(db, "characters", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) { setMsg("該当キャラクターが見つかりません"); return; }

      const data = snap.data() as any;
      const name = data?.name ?? "(名称未設定)";
      const userId = data?.userId ?? "";
      const rootId = data?.rootId ?? id; // 旧データは自分のIDをroot扱い

      const ci = { id, name, userId, rootId };
      setInfo(ci);

      // ★ ここでカウンタも取得
      await fetchCounter(userId, rootId);
    } catch (e: any) {
      setMsg(e?.message ?? "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const resetCounter = async () => {
    if (!info) return;
    setMsg(null); setLoading(true);
    try {
      const call = httpsCallable(functions, "adminResetDupCounter");
      await call({ uid: info.userId, rootId: info.rootId });
      setMsg("複製回数をリセットしました");

      // ★ リセット後のカウンタを再取得して表示を更新
      await fetchCounter(info.userId, info.rootId);
    } catch (e: any) {
      setMsg(e?.message ?? "リセットに失敗しました（管理者権限を確認してください）");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border rounded-2xl">
      <h3 className="font-semibold mb-2">複製回数リセット（管理者）</h3>
      <p className="text-sm opacity-80 mb-3">
        キャラクターIDを入力 → 情報取得 → rootId と所有ユーザー／現在のカウンタを確認 → リセット実行。
      </p>

      <div className="flex gap-2 mb-3">
        <input
          className="border rounded p-2 flex-1"
          placeholder="キャラクターID（/character/xxxxx の xxxxx）"
          value={charIdInput}
          onChange={(e) => setCharIdInput(e.target.value)}
        />
        <button
          onClick={fetchInfo}
          className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
          disabled={loading}
        >
          情報取得
        </button>
      </div>

      {info && (
        <div className="mb-3 text-sm space-y-1">
          <div>キャラ名：<span className="font-medium">{info.name}</span></div>
          <div>所有UID：<code className="bg-gray-100 px-1 rounded">{info.userId}</code></div>
          <div>rootId：<code className="bg-gray-100 px-1 rounded">{info.rootId}</code></div>
          {counter && (
            <div className="mt-2">
              <div>カウンタ：{counter.limit === -1 ? "∞（支援者）" : `${counter.used}/${counter.limit}`}（残り {counter.limit === -1 ? "∞" : counter.remaining}）</div>
              <div className="text-xs text-gray-500">
                {counter.exists ? "※ カウンタDocあり" : "※ カウンタDoc未作成（未複製または0扱い）"}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={resetCounter}
        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        disabled={!info || loading}
      >
        このキャラの複製回数をリセット
      </button>

      {msg && <p className="text-sm mt-3">{msg}</p>}
    </div>
  );
}
