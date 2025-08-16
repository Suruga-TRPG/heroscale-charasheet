"use client";
import { useMemo, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";

/* ---- ユーティリティ（このファイルだけで完結） ---- */
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const genRand = (n=6)=> Array.from({length:n},()=>CHARS[Math.floor(Math.random()*CHARS.length)]).join("");
const monthToken = (d=new Date()) => `${MONTHS[d.getMonth()]}${d.getFullYear()}`;
const genCode = (d=new Date()) => `HEROSCALE-${monthToken(d)}-${genRand(6)}`;

/** JSTの当月末 23:59:59.999 を Date で作り、そのまま ISO（=UTC表記）に変換して保存 */
const endOfMonthISO = (now = new Date()): string => {
  const y = now.getFullYear();
  const m = now.getMonth();
  const jstEnd = new Date(y, m + 1, 0, 23, 59, 59, 999); // JST前提で末日23:59
  return jstEnd.toISOString(); // UTC表記に変換されるが意味は「JSTの23:59」
};

/** ISO(UTC) を JST で "YYYY/MM/DD HH:mm" に整形して表示 */
const formatISOtoJST = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
/* -------------------------------------------- */

export default function AdminCodeGenerator(){
  const [code, setCode] = useState(genCode());

  // 生成タイミングの now を固定（再描画でズレないように）
  const now = useMemo(() => new Date(), []);
  const expiresAtISO = useMemo(() => endOfMonthISO(now), [now]);
  const expiresJSTLabel = useMemo(() => formatISOtoJST(expiresAtISO), [expiresAtISO]);

  const onSave = async ()=> {
    await setDoc(doc(db, "fanboxCodes", "current"), {
      code,                         // 今月の有効コード
      monthToken: monthToken(now),  // 例: AUG2025
      createdAt: serverTimestamp(),
      expiresAtISO,                 // JST月末23:59をISO(UTC)で保存
      active: true
    });
    alert("Firestore に保存しました。FANBOX支援者限定記事に貼ってください。");
  };

  const onDisable = async ()=> {
    await setDoc(doc(db, "fanboxCodes", "current"), { active: false }, { merge: true });
    alert("現在のコードを無効化しました");
  };

  // FANBOX貼り付け用テキスト
  const pasteText = useMemo(
    () => `特典コード：${code}\n有効期限：${expiresJSTLabel}（JST）`,
    [code, expiresJSTLabel]
  );

  return (
    <div className="max-w-xl mx-auto p-6 border rounded-2xl mt-8 space-y-3">
      <h2 className="text-xl font-semibold">特典コード（今月）</h2>
      <p className="opacity-80">このコードを支援者限定記事に掲載してください。</p>

      <div className="rounded-lg bg-gray-50 p-3">
        <div className="text-sm text-gray-600">コード</div>
        <code className="block text-lg">{code}</code>
        <div className="mt-2 text-sm text-gray-600">有効期限（JST）</div>
        <div className="font-medium">{expiresJSTLabel}（JST）</div>
      </div>

      <div className="flex gap-2">
        <button onClick={()=>setCode(genCode())} className="border px-3 py-2 rounded-lg">再生成</button>
        <button onClick={()=>navigator.clipboard.writeText(code)} className="border px-3 py-2 rounded-lg">コードをコピー</button>
        <button onClick={onSave} className="border px-3 py-2 rounded-lg">Firestoreへ保存</button>
        <button onClick={onDisable} className="border px-3 py-2 rounded-lg">緊急停止</button>
      </div>

      <div className="rounded-lg bg-gray-50 p-3">
        <div className="text-sm text-gray-600 mb-1">FANBOX貼り付け用</div>
        <pre className="whitespace-pre-wrap text-sm">{pasteText}</pre>
        <div className="mt-2">
          <button
            onClick={() => navigator.clipboard.writeText(pasteText)}
            className="border px-3 py-2 rounded-lg"
          >
            テキストをコピー
          </button>
        </div>
      </div>

      <p className="text-sm opacity-80">
        ※ 保存した瞬間から当月末まで有効（JST）。翌月は自動的に無効になります。
      </p>
    </div>
  );
}
