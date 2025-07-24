'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import CharacterDisplay from "@/components/CharacterDisplay";

export default function CharacterPage() {
  const router = useRouter(); // ✅ 関数内に記述！
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

  return (
    <div className="p-4">
      {character ? (
        <CharacterDisplay character={character} />
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
