// components/CharacterDisplay.tsx
import React from "react";
import MemoItem from "@/components/MemoItem";

export default function CharacterDisplay({ character }: { character: any }) {
  return (
    <div className="max-w-5xl mx-auto bg-white shadow p-6 rounded-md space-y-6">
      {/* タイトル */}
      <h1 className="text-4xl font-bold text-center border-b pb-2">キャラクターシート</h1>

      {/* 上段：基本情報 */}
      <section className="grid grid-cols-3 gap-4 text-sm">
        <p></p>
        <div className="text-2xl"><strong>名前</strong>：{character.form?.name || "（未記入）"}</div>
        <p></p>
        <div className="text-xl"><strong>性別</strong>：{character.form?.gender || "（未記入）"}</div>
        <div className="text-xl"><strong>年齢</strong>：{character.form?.age || "（未記入）"}</div>
        <div className={character.remainingExp < 0 ? "text-red-600" : "text-xl"}>
        経験点：{character.remainingExp ?? "―"} / {character.form?.exp ?? "―"}
        </div>
        <div className="text-xl"><strong>出自</strong>：{character.form?.origin || "（未記入）"}</div>
        <div className="text-xl"><strong>運命</strong>：{character.form?.fate || "（未記入）"}</div>
        <div className="text-xl"><strong>仮称</strong>：{character.selectedCodename || "（未記入）"}</div>
        <div className="text-xl"><strong>職種</strong>：{character.selectedJob || "（未記入）"}</div>
        <div className="text-xl"><strong>武器</strong>：{character.selectedWeapon || "（未記入）"}</div>
        <div className="text-xl"><strong>装飾</strong>：{character.selectedAccessory || "（未記入）"}</div>


      </section>

      {/* 中段：能力値 */}
        <section className="bg-white text-black py-4 px-2">
        <h2 className="font-bold mb-2">ステータス</h2>
        <div className="grid grid-cols-6 gap-4 text-center">
            {[
            { label: "火力", value: character.totalStats?.power ?? "―", growth: character.growth?.power ?? 0 },
            { label: "射程", value: character.totalStats?.range ?? "―", growth: character.growth?.range ?? 0 },
            { label: "範囲", value: character.totalStats?.area ?? "―", growth: character.growth?.area ?? 0 },
            { label: "機動", value: character.totalStats?.mobility ?? "―", growth: character.growth?.mobility ?? 0 },
            { label: "耐久", value: character.totalStats?.durability ?? "―", growth: character.growth?.durability ?? 0 },
            { label: "反応", value: character.totalStats?.reaction ?? "―", growth: character.growth?.reaction ?? 0 },
            ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-extrabold">
                {stat.value}
                <sub className="text-xs text-gray-500 ml-1">(成長:{stat.growth})</sub>
                </p>
            </div>
            ))}
        </div>
        </section>


      {/* スキル・アイテム */}
        <section className="py-6 px-2">
        <h2 className="text-lg font-bold mb-4">スキル・アイテム</h2>

        {/* 初期スキル */}
        <div className="mb-4 text-base">
            <p><strong>初期スキル：</strong>{character.form?.initSkill || "なし"}</p>
        </div>

        {/* 戦闘スキル & 調査スキル */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-base">
            <p><strong>戦闘スキル：</strong>{character.selectedBattleSkills?.join("、") || "なし"}</p>
            <p><strong>調査スキル：</strong>{character.selectedSurveySkills?.join("、") || "なし"}</p>
        </div>

        {/* 上位スキル & アイテム */}
        <div className="grid grid-cols-2 gap-4 text-base">
            <p><strong>上位スキル：</strong>{character.selectedUpperSkills?.join("、") || "なし"}</p>
            <p><strong>アイテム：</strong>{character.selectedItems?.join("、") || "なし"}</p>
        </div>
        </section>


        {/* メモ欄 */}
        <section className="border-t pt-4 text-sm">
        <h2 className="font-bold mb-4">メモ</h2>

        {character.form?.memos?.length > 0 ? (
            <ul className="space-y-4">
            {character.form.memos.map((memo: any, idx: number) => (
                <MemoItem key={idx} memo={memo} />
            ))}
            </ul>
        ) : (
            <p>（未記入）</p>
        )}
        </section>
    </div>
  );
}
