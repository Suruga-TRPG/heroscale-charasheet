"use client";
import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
// ✅ import を lib 側に統一（必要なら）
import { functions } from "@/firebase";

type Quota = { supporter: boolean; used: number; limit: number; remaining: number };

// ✅ 追加: variant でサイズを切替
type Props = {
  characterId: string;
  newName?: string;
  variant?: "compact" | "sidebar"; // default: compact（=マイページ）
};

export default function DuplicateButton({
  characterId,
  newName,
  variant = "compact", // ✅ 追加: デフォルトは小さめ
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let gone = false;
    (async () => {
      try {
        const call = httpsCallable(functions, "getDuplicateQuota");
        const res: any = await call({ characterId });
        if (!gone) setQuota(res.data as Quota);
      } catch {
        if (!gone) setQuota(null);
      }
    })();
    return () => {
      gone = true;
    };
  }, [characterId]);

  const onDuplicate = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const call = httpsCallable(functions, "duplicateCharacter");
      const res: any = await call({ characterId, newName });
      const { remaining, limit } = res.data as { remaining: number; limit: number };

      if (limit === -1) setMsg("複製しました");
      else setMsg(`複製しました（残り ${remaining}/${limit}）`);

      const q: any = await httpsCallable(functions, "getDuplicateQuota")({ characterId });
      setQuota(q.data as Quota);
    } catch (e: any) {
      const m = e?.message || "";
      if (m.includes("resource-exhausted") || m.includes("limit 2 reached")) {
        setMsg("このシートはこれ以上複製できません（上限2回）");
      } else if (m.includes("unauthenticated")) {
        setMsg("ログインしてください");
      } else {
        setMsg("複製に失敗しました");
      }
    } finally {
      setLoading(false);
    }
  };

  const badge: string =
    quota === null ? "…" : quota.limit === -1 ? "∞" : `${quota.remaining}/${quota.limit}`;

  const disabled: boolean =
    loading ||
    (quota !== null && quota.limit !== -1 && typeof quota.remaining === "number" && quota.remaining <= 0);

  // ✅ 追加: サイジングを切替
  const sizeClass = variant === "sidebar" ? "w-full px-4 py-2" : "px-3 py-1.5";

  return (
    <div className={`relative inline-block ${variant === "sidebar" ? "w-full" : ""}`}>
      <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-sm font-bold px-1 rounded shadow">
        {badge}
      </span>

      <button
        onClick={onDuplicate}
        disabled={disabled}
        className={`${sizeClass} rounded text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50`}
        title="このキャラシートを複製"
      >
        複製
      </button>

      {msg && <p className="text-xs mt-1 text-gray-700">{msg}</p>}
    </div>
  );
}
