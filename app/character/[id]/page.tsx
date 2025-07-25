'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

import { copyTokenToClipboard } from "@/utils/tokenGenerator";
import CharacterDisplayHeader from "@/components/CharacterDisplayHeader";
import CharacterDisplayBody from "@/components/CharacterDisplayBody";

export default function CharacterPage() {
  const router = useRouter();
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

  // 駒出力関数（シンプルに）
  const handleGenerateTokenAndCopy = () => {
    if (!character) {
      alert("キャラクターデータが読み込まれていません");
      return;
    }

    // ユーティリティ関数を使用
    copyTokenToClipboard(character);
  };

  if (loading) return <p className="p-4">読み込み中...</p>;

return (
  <div className="p-4">
          {/* タイトル */}
      <h1 className="text-4xl font-bold text-center border-b pb-2 mb-4">キャラクターシート</h1>

    {character ? (
      <>
        {/* 上段：画像＋プロフィール */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
          {/* 左：画像 */}
          {character.imageUrl && (
            <div className="w-full md:w-1/3 flex justify-center">
              <img
                src={character.imageUrl}
                alt="キャラクター画像"
                className="max-h-80 rounded shadow"
              />
            </div>
          )}

          {/* 右：基本プロフィール */}
          <div className="flex-1">
            <CharacterDisplayHeader character={character} />
          </div>
        </div>

        {/* 下段：ステータス～メモ */}
        <CharacterDisplayBody character={character} />
      </>
) : (
      <p className="text-red-600">キャラクターが見つかりませんでした。</p>
    )}

          <div className="flex gap-4 mt-6 justify-center">
        <button
          onClick={() => router.push(`/create?id=${id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          編集ページに戻る
        </button>

        <button
          onClick={handleGenerateTokenAndCopy}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          CCFOLIA駒出力
        </button>

        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              alert("URLをクリップボードにコピーしました！");
            } catch (err) {
              alert("コピーに失敗しました");
            }
          }}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
        >
          共有リンクをコピー
        </button>
      </div>

  </div>
);


}