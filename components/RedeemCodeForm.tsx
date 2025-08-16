"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

// 隠しコマンド（管理者だけ /admin/fanbox-code へジャンプ）
const ADMIN_CMD = "HEROSCALE-ADMIN-ONLY"; 
// 正規の特典コード形式（HEROSCALE-AUG2025-XXXXXX）
const PATTERN = /^HEROSCALE-[A-Z]{3}[0-9]{4}-[A-Z0-9]{6}$/;

export default function RedeemCodeForm() {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

    // 隠しコマンドの処理
    const tryAdminJump = async (text: string) => {
    if (text !== ADMIN_CMD) return false;
    const u = auth.currentUser;
    if (!u) { setMsg("管理権限が必要です（まずログインしてください）"); return true; }
    const token = await u.getIdTokenResult();
    if (token.claims?.admin === true) router.push("/admin/fanbox-code");
    else setMsg("管理権限がありません");
    return true;
    };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = code.trim().toUpperCase();

    // 1) まず隠しコマンド判定
    if (await tryAdminJump(input)) return;

    // 2) 入力形式チェック（早期にユーザーへ案内）
    if (!PATTERN.test(input)) {
      setMsg("コードの形式が違います（例: HEROSCALE-AUG2025-XXXXXX）");
      return;
    }

    // 3) 検証（Cloud Functions を呼ぶ）
    setLoading(true); setMsg(null);
    try {
      const call = httpsCallable(functions, "redeemFanboxCode");
      const res: any = await call({ code: input });
      const expire = new Date(res.data.expiresAtISO).toLocaleDateString();
      setMsg(`特典を付与しました（期限: ${expire}）`);
      setCode("");
    } catch (err: any) {
      setMsg(err.message || "認証に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <label className="text-sm">特典コード</label>
      <input
        value={code}
        onChange={(e)=>setCode(e.target.value)}
        placeholder="HEROSCALE-XXXXXXX-XXXXXX"
        className="border rounded-lg p-3"
        required
      />
      <button disabled={loading} className="rounded-lg p-3 border">
        {loading ? "確認中..." : "適用"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
