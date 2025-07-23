'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default function CharacterPage() {
  const router = useRouter(); // ✅ Hookはここで使う
  const { id } = useParams();
  const [character, setCharacter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCharacter = async () => {
      if (!id) return;

      const docRef = doc(db, "characters", String(id));
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setCharacter(docSnap.data());
      } else {
        setCharacter(null);
      }

      setLoading(false);
    };

    fetchCharacter();
  }, [id]);

  if (loading) return <p className="p-4">読み込み中...</p>;

  if (!character) {
    return <p className="p-4 text-red-600">キャラクターが見つかりませんでした。</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">キャラクターシート（閲覧専用）</h1>

      {/* 基本情報 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="p-2 border rounded">
            <p className="text-sm text-gray-500">PC名</p>
            <p className="font-bold">{character.form?.name || "（未記入）"}</p>
        </div>
        <div className="p-2 border rounded">
            <p className="text-sm text-gray-500">性別</p>
            <p className="font-bold">{character.form?.gender || "（未記入）"}</p>
        </div>
        <div className="p-2 border rounded">
            <p className="text-sm text-gray-500">年齢</p>
            <p className="font-bold">{character.form?.age || "（未記入）"}</p>
        </div>
        </div>

      <div className="grid gap-2">
        <p><strong>出自:</strong> {character.form?.origin || "（未選択）"}</p>
        <p><strong>運命:</strong> {character.form?.fate || "（未選択）"}</p>
        <p><strong>仮称:</strong> {character.selectedCodename || "（未選択）"}</p>
        <p></p>
        <p><strong>経験点:</strong> {character.form?.exp ?? "未設定"}</p>
        <p>
          <strong>経験点残量:</strong>{" "}
          <span className={character.remainingExp < 0 ? "text-red-600 font-bold" : "font-bold"}>
            {character.remainingExp ?? "―"}
          </span>
          {character.remainingExp < 0 && (
            <span className="text-red-500 text-sm ml-2">⚠️ 経験点が不足しています</span>
          )}
        </p>
        <p></p>
        <p><strong>職種:</strong> {character.selectedJob || "（未選択）"}</p>
        <p><strong>武器:</strong> {character.selectedWeapon || "（未選択）"}</p>
        <p><strong>装飾:</strong> {character.selectedAccessory || "（未選択）"}</p>
        <p></p>
        <p><strong>火力:</strong> {character.totalStats?.power ?? "―"}（成長: {character.growth?.power ?? 0}）</p>
        <p><strong>射程:</strong> {character.totalStats?.range ?? "―"}（成長: {character.growth?.range ?? 0}）</p>
        <p><strong>範囲:</strong> {character.totalStats?.area ?? "―"}（成長: {character.growth?.area ?? 0}）</p>
        <p><strong>機動:</strong> {character.totalStats?.mobility ?? "―"}（成長: {character.growth?.mobility ?? 0}）</p>
        <p><strong>耐久:</strong> {character.totalStats?.durability ?? "―"}（成長: {character.growth?.durability ?? 0}）</p>
        <p><strong>反応:</strong> {character.totalStats?.reaction ?? "―"}（成長: {character.growth?.reaction ?? 0}）</p>
        <p></p>
        <p><strong>調査スキル:</strong> {character.selectedSurveySkills?.join("、") || "なし"}</p>
        <p><strong>戦闘スキル:</strong> {character.selectedBattleSkills?.join("、") || "なし"}</p>
        <p><strong>上位スキル:</strong> {character.selectedUpperSkills?.join("、") || "なし"}</p>
        <p><strong>アイテム:</strong> {character.selectedItems?.join("、") || "なし"}</p>
        <p></p>
        {character.form?.memos && character.form.memos.length > 0 ? (
        <div>
            <strong>メモ:</strong>
            <ul className="list-disc pl-5 mt-1 space-y-2">
            {character.form.memos.map((memo: { title: string; content: string }, idx: number) => (
                <li key={idx}>
                <p className="font-bold">{memo.title || "（無題）"}</p>
                <p className="whitespace-pre-line">{memo.content || "（未記入）"}</p>
                </li>
            ))}
            </ul>
        </div>
        ) : (
        <p><strong>メモ:</strong>（未記入）</p>
        )}
      </div>

      {/* ボタン */}
      <div className="flex gap-4 mt-6">
        {/* 編集ページに戻るボタン（ID付き） */}
        <button
          onClick={() => router.push(`/create?id=${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          編集ページに戻る
        </button>

        {/* 共有リンクコピー用ボタン */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              alert("URLをクリップボードにコピーしました！");
            } catch (err) {
              alert("コピーに失敗しました");
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          共有リンクをコピー
        </button>
      </div>
    </div>
  );
}
