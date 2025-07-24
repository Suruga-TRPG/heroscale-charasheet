// components/MemoItem.tsx
import React, { useState } from "react";

export default function MemoItem({ memo }: { memo: { title: string; content: string } }) {
  const [isOpen, setIsOpen] = useState(false); // 初期状態を閉じた状態に

  return (
    <li className="border rounded p-3 bg-gray-50">
      <div className="flex justify-between items-center mb-1">
        <span className="font-bold text-base">{memo.title || "（無題）"}</span>
        <button
          className="text-gray-600 hover:text-black text-lg font-bold"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "∨" : "<"}
        </button>
      </div>
      {isOpen && (
        <p className="whitespace-pre-line text-sm text-gray-700">
          {memo.content || "（未記入）"}
        </p>
      )}
    </li>
  );
}
