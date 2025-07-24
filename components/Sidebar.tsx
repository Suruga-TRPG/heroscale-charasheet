import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  onSave: () => void;
  onExport: () => void;
  onAddMemo: () => void;
  user: any;
};

export default function Sidebar({ onSave, onExport, onAddMemo, user }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 開閉ボタン */}
      <button
        className="absolute top-4 left-2 z-50 bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "← 閉じる" : "→ 開く"}
      </button>

      {/* サイドバー */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 p-4 bg-gray-100 flex flex-col gap-4 transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <p></p>
        <p></p>
        <p></p>
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-gray-500 text-white rounded">
          ホームに戻る
        </button>

        <button
          onClick={() => router.push("/mypage")}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          マイページへ
        </button>

        <button
          className="bg-green-500 text-white px-3 py-2 rounded"
          onClick={onAddMemo}
        >
          メモを追加
        </button>

        <button
          onClick={onSave}
          className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700"
        >
          キャラクターを保存する
        </button>

        <button
          onClick={onExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
        >
          CCFOLIA駒出力
        </button>

        <p className="text-center text-sm text-gray-600 mb-4">
          ログイン中: {user?.displayName || user?.email || "ゲストユーザー"}
        </p>
      </aside>
    </>
  );
}
