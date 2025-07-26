export default function CharacterDisplayHeader({ character }: { character: any }) {
  return (
    <div>

      {/* プロフィール情報：3列グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-lg">
        <div><strong>名前：</strong>{character.form?.name || "（未記入）"}</div>
        <div><strong>年齢：</strong>{character.form?.age || "（未記入）"}</div>
        <div><strong>性別：</strong>{character.form?.gender || "（未記入）"}</div>
        <div><strong>出自：</strong>{character.form?.origin || "（未記入）"}</div>
        <div className="text-lg">
          <span className="font-bold">運命：</span>
          <span>{character.form?.fate || "（未記入）"}</span>
          {character.form?.fateboost > 0 && (
            <sub className="text-xs font-bold text-gray-500 ml-2">(強化:{character.form.fateboost})</sub>
          )}
        </div>
        <div><strong>仮称：</strong>{character.selectedCodename || "（未記入）"}</div>
        <div><strong>職種：</strong>{character.selectedJob || "（未選択）"}</div>
        <div><strong>武器：</strong>{character.selectedWeapon || "（未選択）"}</div>
        <div><strong>装飾：</strong>{character.selectedAccessory || "（未選択）"}</div>
        <div className={character.remainingExp < 0 ? "text-red-600" : ""}>
          <strong>経験点：</strong>{character.remainingExp ?? "―"} / {character.form?.exp ?? "―"}
        </div>
      </div>
    </div>
  );
}
