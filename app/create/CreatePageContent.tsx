'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/Sidebar";
import { copyTokenToClipboard } from "@/utils/tokenGenerator";
import { uploadImageFile } from "@/lib/uploadImage";
import { convertToRasterizedWatermarkedImage } from "@/lib/imageProcessor";

// 定数の分離
const BONUS_CONSTANTS = {
  JOB_BONUSES: {
    "戦士":   { power: 1, range: 0, area: 0, mobility: 0, durability: 500, reaction: 1 },
    "聖職":   { power: 1, range: 1, area: 1, mobility: 0, durability: 0,   reaction: 0 },
    "猟師":   { power: 0, range: 1, area: 0, mobility: 1, durability: 0,   reaction: 0 },
    "罪人":   { power: 0, range: 0, area: 0, mobility: 0, durability: 1000,reaction: 1 },
    "家政":   { power: 1, range: 0, area: 1, mobility: 0, durability: 1000,reaction: 0 },
    "工匠":   { power: 0, range: 0, area: 1, mobility: 0, durability: 500, reaction: 1 },
    "芸家":   { power: 2, range: 1, area: 0, mobility: 0, durability: 0,   reaction: 0 },
    "放浪":   { power: 0, range: 0, area: 0, mobility: 1, durability: 1000,reaction: 1 },
    "学徒":   { power: 0, range: 1, area: 1, mobility: 0, durability: 500, reaction: 0 }
  } as const,

  WEAPON_BONUSES: {
    "引裂く物":   { power: 1, range: 1, area: 0, mobility: 0, durability: 0,    reaction: 0 },
    "突刺す物":   { power: 1, range: 0, area: 0, mobility: 0, durability: 0,    reaction: 1 },
    "薙払う物":   { power: 0, range: 0, area: 1, mobility: 1, durability: 0,    reaction: 0 },
    "圧潰す物":   { power: 1, range: 0, area: 2, mobility: 0, durability: 0,    reaction: 0 },
    "叩割る物":   { power: 2, range: 0, area: 0, mobility: 0, durability: 500,  reaction: 0 },
    "打倒す物":   { power: 1, range: 0, area: 0, mobility: 1, durability: 0,    reaction: 0 },
    "刻込む物":   { power: 1, range: 0, area: 0, mobility: 0, durability: 1000, reaction: 0 },
    "射抜く物":   { power: 0, range: 1, area: 1, mobility: 0, durability: 0,    reaction: 0 },
    "撥退る物":   { power: 0, range: 0, area: 1, mobility: 0, durability: 1000, reaction: 0 }
  } as const,

  ACCESSORY_BONUSES: {
    "奇跡の靴":     { power: 0, range: 0, area: 0, mobility: 1, durability: 500, reaction: 0 },
    "伝説の指輪":   { power: 0, range: 0, area: 0, mobility: 0, durability: 1500, reaction: 0 },
    "類稀な外套":   { power: 0, range: 0, area: 1, mobility: 0, durability: 1000, reaction: 0 },
    "至高の帯":     { power: 0, range: 0, area: 0, mobility: 0, durability: 500, reaction: 1 },
    "魔導の書":     { power: 0, range: 1, area: 0, mobility: 0, durability: 500, reaction: 0 },
    "超常の仮面":   { power: 0, range: 0, area: 1, mobility: 1, durability: 0, reaction: 0 },
    "幻の櫛":       { power: 1, range: 0, area: 0, mobility: 0, durability: 0, reaction: 1 },
    "格別な首輪":   { power: 1, range: 0, area: 0, mobility: 1, durability: 0, reaction: 0 },
    "秘密の刺青":   { power: 0, range: 0, area: 1, mobility: 0, durability: 0, reaction: 1 }
  } as const
};

const SKILL_OPTIONS = {
  battleSkills: [
    "怨念", "解除", "加速", "庇う", "構え", "鬼気", "逆境", "吸収", "急所", "結界",
    "強奪", "残像", "死角", "指揮", "式神", "自信", "下準備", "地均し", "集中", "執念",
    "衝撃", "尻上り", "心眼", "神器", "捨て身", "全力", "相殺", "蘇生", "溜める", "弾幕",
    "遅延", "挑発", "治療", "使い魔", "伝授", "毒電波", "突進", "配下", "憑依", "不意打ち",
    "暴発", "真似", "守る", "見切り", "目潰し", "連撃"
  ] as const,
  searchSkills: [
    "暗号", "暗殺", "回想", "観察", "護衛", "散策", "地獄耳", "冗談",
    "仲介", "転移", "道化", "突発", "複製", "平行線", "目星", "猛進",
    "物知り", "誘導"
  ] as const,
  advancedSkills: [
    "圧倒", "解明", "絆", "気まぐれ", "幻覚", "幸福", "号令", "最強", "自在",
    "侵蝕", "真の姿", "増幅", "大団円", "脳筋", "波動", "不可視", "卜占", "魅了", "輪廻"
  ] as const
};

const OPTIONS = {
  fateOptions: {
    "超越": ["肉体", "科学", "激情"],
    "加護": ["選択", "安寧", "逆転"],
    "契約": ["享受", "収奪", "燃焼", "奉納"],
    "呪い": ["歪曲", "崩壊", "破滅"],
    "異物": ["模造", "混血", "彼方"],
    "報い": ["堕落", "忘却", "封印"],
    "同化": ["怪物", "秘宝", "概念"],
  } as Record<string, readonly string[]>,
  aliasOptions: {
    "超越": ["調停者", "観察者", "拒絶者", "教導者"],
    "加護": ["蒐集者", "模倣者", "守護者", "隷属者"],
    "契約": ["破壊者", "策謀者", "先駆者", "支配者"],
    "呪い": ["予言者", "運航者", "探索者", "欺瞞者"],
    "異物": ["放浪者", "復讐者", "征服者", "発見者"],
    "報い": ["侵略者", "審判者", "不死者", "覚醒者"],
    "同化": ["貯蔵者", "挑戦者", "巡礼者", "簒奪者"],
  } as Record<string, readonly string[]>,
  itemOptions: ["宣誓", "後悔", "理想", "大罪", "幸運"] as const
};

// 成長キー（型安全性のため）
const GROWTH_KEYS = ["power", "range", "area", "mobility", "durability", "reaction"] as const;

// 初期スキルオプション（戦闘+調査）
const INIT_SKILL_OPTIONS = [...SKILL_OPTIONS.battleSkills, ...SKILL_OPTIONS.searchSkills];

// スキルコスト計算関数を追加
const calculateSkillCost = ({
  initSkill,
  battleSkills,
  searchSkills,
  upperSkills,
}: {
  initSkill: string;
  battleSkills: string[];
  searchSkills: string[];
  upperSkills: string[];
}): number => {
  // すべてのスキルを統合
  const allSelectedSkills = [...battleSkills, ...searchSkills, ...upperSkills];

  // スキルごとの選択回数をカウント
  const skillCounts: Record<string, number> = {};

  // 初期スキルを1回目としてカウント（ただしコストは0）
  if (initSkill && initSkill.trim() !== "") {
    skillCounts[initSkill] = 1;
  }

  // 選択されたスキルを追加でカウント
  for (const skill of allSelectedSkills) {
    if (!skill || skill.trim() === "") continue;
    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
  }

  let totalCost = 0;

  // 各スキルのコストを計算
  for (const [skillName, totalCount] of Object.entries(skillCounts)) {
    // スキルの種別を判定
    const battleSkillsArray = SKILL_OPTIONS.battleSkills as readonly string[];
    const searchSkillsArray = SKILL_OPTIONS.searchSkills as readonly string[];
    const upperSkillsArray = SKILL_OPTIONS.advancedSkills as readonly string[];

    const isBattle = battleSkillsArray.includes(skillName);
    const isSearch = searchSkillsArray.includes(skillName);
    const isUpper = upperSkillsArray.includes(skillName);

    const baseCost = isBattle ? 5 : isSearch ? 3 : isUpper ? 30 : 0;

    // 初期スキルと同じ場合の処理
    if (initSkill === skillName) {
      // 初期スキルは1回目なのでコスト0
      // 2回目以降のみコストを計算
      for (let i = 2; i <= totalCount; i++) {
        totalCost += i * baseCost;
      }
    } else {
      // 初期スキルではない場合は1回目からコストを計算
      for (let i = 1; i <= totalCount; i++) {
        totalCost += i * baseCost;
      }
    }
  }

  return totalCost;
};

export default function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("id");
  
  // UI状態
  const [isAgreed, setIsAgreed] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // フォーム状態
  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    exp: 0,
    fateboost: 0,
    origin: "",
    alias: "",
    fate: "",
    initSkill: "",
    power: 1,
    range: 1,
    area: 1,
    mobility: 1,
    durability: 1,
    reaction: 1,
    memos: [{ title: "メモ1", content: "" }]
  });

  const [growth, setGrowth] = useState({
    power: 0,
    range: 0,
    area: 0,
    mobility: 0,
    durability: 0,
    reaction: 0
  });

  // 選択状態
  const [selectedJob, setSelectedJob] = useState<keyof typeof BONUS_CONSTANTS.JOB_BONUSES | "未選択">("未選択");
  const [selectedWeapon, setSelectedWeapon] = useState<keyof typeof BONUS_CONSTANTS.WEAPON_BONUSES | "未選択">("未選択");
  const [selectedAccessory, setSelectedAccessory] = useState<keyof typeof BONUS_CONSTANTS.ACCESSORY_BONUSES | "未選択">("未選択");
  
  // スキル管理の統一
  const [skillArrays, setSkillArrays] = useState({
    battle: [""],
    search: [""],
    advanced: [""],
    items: [""]
  });

  // 選択されたスキル（計算用）
  const selectedSkills = useMemo(() => ({
    battle: skillArrays.battle.filter(s => s !== ""),
    search: skillArrays.search.filter(s => s !== ""),
    advanced: skillArrays.advanced.filter(s => s !== ""),
    items: skillArrays.items.filter(s => s !== "")
  }), [skillArrays]);

  // ボーナス計算の共通化
  const getBonusForSelection = (
    selection: string, 
    bonusMap: Record<string, { power: number; range: number; area: number; mobility: number; durability: number; reaction: number }>
  ) => {
    return selection !== "未選択" ? bonusMap[selection] : {
      power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
    };
  };

  // 合計ステータス計算
  const totalStats = useMemo(() => {
    const jobBonus = getBonusForSelection(selectedJob, BONUS_CONSTANTS.JOB_BONUSES);
    const weaponBonus = getBonusForSelection(selectedWeapon, BONUS_CONSTANTS.WEAPON_BONUSES);
    const accessoryBonus = getBonusForSelection(selectedAccessory, BONUS_CONSTANTS.ACCESSORY_BONUSES);

    return {
      power: form.power + growth.power * 2 + jobBonus.power + weaponBonus.power + accessoryBonus.power,
      range: form.range + growth.range * 1 + jobBonus.range + weaponBonus.range + accessoryBonus.range,
      area: form.area + growth.area * 2 + jobBonus.area + weaponBonus.area + accessoryBonus.area,
      mobility: form.mobility + growth.mobility * 1 + jobBonus.mobility + weaponBonus.mobility + accessoryBonus.mobility,
      durability: form.durability + growth.durability * 1000 + jobBonus.durability + weaponBonus.durability + accessoryBonus.durability,
      reaction: form.reaction + growth.reaction * 1 + jobBonus.reaction + weaponBonus.reaction + accessoryBonus.reaction,
    };
  }, [form, growth, selectedJob, selectedWeapon, selectedAccessory]);

  // 経験点残量計算（修正版）
  const remainingExp = useMemo(() => {
    const growthTotal = GROWTH_KEYS.reduce((sum, key) => sum + growth[key], 0);
    const codenameCost = form.alias ? 5 : 0;
    const fateBoostCost = (form.fateboost || 0) * 5;

    // 新しいスキルコスト計算を使用
    const skillCost = calculateSkillCost({
      initSkill: form.initSkill,
      battleSkills: selectedSkills.battle,
      searchSkills: selectedSkills.search,
      upperSkills: selectedSkills.advanced,
    });

    const cost = growthTotal * 5 +
      selectedSkills.items.length * 1 +
      codenameCost +
      fateBoostCost +
      skillCost;

    return form.exp - cost;
  }, [form.exp, form.initSkill, form.fateboost, form.alias, growth, selectedSkills]);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // スキル配列の変更ハンドラー（共通化）
  const handleSkillArrayChange = (
    type: 'battle' | 'search' | 'advanced' | 'items',
    index: number,
    value: string
  ) => {
    setSkillArrays(prev => {
      const newArray = [...prev[type]];
      newArray[index] = value;
      
      // 空でない値が入力され、かつ最後の要素の場合、新しい空要素を追加
      if (value !== "" && index === prev[type].length - 1) {
        newArray.push("");
      }
      
      return { ...prev, [type]: newArray };
    });
  };

  // フォーム変更ハンドラー
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleGrowthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseInt(value) || 0;
    setGrowth(prev => ({ ...prev, [name as keyof typeof growth]: val }));
  };

  // 画像アップロード処理
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      alert("ログインが必要です");
      return;
    }

    if (!isAgreed) {
      alert("アップロードするには著作権同意チェックが必要です。");
      return;
    }

    setUploading(true);
    try {
      const processedBlob = await convertToRasterizedWatermarkedImage(file);
      const processedFile = new File([processedBlob], file.name, { type: "image/png" });
      const watermarkedUrl = await uploadImageFile(processedFile, auth.currentUser.uid, file.name);
      setImageUrl(watermarkedUrl);
    } catch (error) {
      console.error("アップロード失敗", error);
      alert("アップロードに失敗しました");
    }
    setUploading(false);
  };

  // キャラクターシートの保存
  const saveCharacterSheet = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("ログインしていません。保存できません。");
      return;
    }

    const characterData = {
      name: form.name || "",
      form,
      growth,
      selectedJob,
      selectedWeapon,
      selectedAccessory,
      selectedCodename: form.alias || "未選択",
      selectedSurveySkills: selectedSkills.search,
      selectedBattleSkills: selectedSkills.battle,
      selectedUpperSkills: selectedSkills.advanced,
      selectedItems: selectedSkills.items,
      totalStats,
      remainingExp,
      userId: user.uid,
      imageUrl: imageUrl,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    };

    try {
      if (characterId) {
        await setDoc(doc(db, "characters", characterId), characterData, { merge: true });
        router.push(`/character/${characterId}`);
      } else {
        const docRef = await addDoc(collection(db, "characters"), {
          ...characterData,
          createdAt: Timestamp.now(),
        });
        router.push(`/character/${docRef.id}`);
      }
    } catch (error) {
      console.error("キャラシートの保存に失敗:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    }
  };

  // トークン生成とコピー
  const handleGenerateTokenAndCopy = () => {
    const characterData = {
      form: {
        name: form.name,
        fate: form.fate,
        alias: form.alias,
        initSkill: form.initSkill,
      },
      totalStats,
      selectedBattleSkills: selectedSkills.battle,
      selectedSurveySkills: selectedSkills.search,
      selectedUpperSkills: selectedSkills.advanced,
    };
    copyTokenToClipboard(characterData);
  };

  // キャラクター読み込み
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId) return;

      const docRef = doc(db, "characters", characterId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();

        setForm(data.form);
        setGrowth(data.growth);
        setSelectedJob(data.selectedJob || "未選択");
        setSelectedWeapon(data.selectedWeapon || "未選択");
        setSelectedAccessory(data.selectedAccessory || "未選択");
        
        // スキル配列の復元
        setSkillArrays({
          battle: (data.selectedBattleSkills || []).concat([""]),
          search: (data.selectedSurveySkills || []).concat([""]),
          advanced: (data.selectedUpperSkills || []).concat([""]),
          items: (data.selectedItems || []).concat([""])
        });
        
        setImageUrl(data.imageUrl || "");
      }
    };

    fetchCharacter();
  }, [characterId]);

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Sidebar
        user={user}
        onSave={saveCharacterSheet}
        onExport={handleGenerateTokenAndCopy}
        onAddMemo={() => {
          const title = prompt("新しいメモのタイトルを入力してください");
          if (title) {
            setForm({
              ...form,
              memos: [...form.memos, { title, content: "" }],
            });
          }
        }}
      />
      
      <main className="flex-1 flex justify-center min-h-screen p-6 overflow-auto bg-white">
        <div className="w-full max-w-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">英雄の尺度　キャラクターシート</h1>

          <div className="space-y-4">
            {/* 基本情報 */}
            <div className="grid grid-cols-3 gap-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="PC名" className="w-full p-2 border rounded" />
              <input name="gender" value={form.gender} onChange={handleChange} placeholder="性別" className="w-full p-2 border rounded" />
              <input name="age" value={form.age} onChange={handleChange} placeholder="年齢" className="w-full p-2 border rounded" />
            </div>

            {/* 画像アップロード */}
            <div className="w-full">
              <label className="block border-black mb-2 font-semibold">キャラクター画像</label>
              <div className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <span className="text-sm text-gray-800">
                    私は著作権を侵害していない画像のみをアップロードします
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-block border border-black px-4 py-2 rounded cursor-pointer bg-gray-100 hover:bg-gray-200">
                  ファイルを選択
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              {uploading && <p className="text-sm text-gray-500 mt-2">アップロード中...</p>}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="ウォーターマーク付き画像"
                  className="mt-4 max-h-64 rounded shadow"
                />
              )}
            </div>

            {/* 経験点 */}
            <label className="block mb-2 font-bold">経験点</label>
            <input
              type="number"
              className="border rounded px-2 py-1 mb-2"
              value={form.exp}
              onChange={(e) => setForm({ ...form, exp: parseInt(e.target.value || "0") })}
            />
            
            <div className="mb-6">
              <p className={`font-bold text-xl ${remainingExp < 0 ? "text-red-600" : "text-black"}`}>
                経験点残量: <span className="text-2xl">{remainingExp}</span>
              </p>
              {remainingExp < 0 && (
                <p className="text-sm text-red-500 mt-1">⚠️ 経験点が不足しています！スキルや成長を見直してください。</p>
              )}
            </div>

            {/* 運命強化 */}
            <label className="block mb-2 font-bold">運命強化</label>
            <input
              type="number"
              min={0} 
              className="border rounded px-2 py-1 mb-2"
              value={form.fateboost}
              onChange={(e) => setForm({ ...form, fateboost: parseInt(e.target.value || "0") })}
            />

            {/* 出自・運命・仮称 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">出自</label>
                <select name="origin" value={form.origin} onChange={handleChange} className="w-full border px-3 py-2 rounded">
                  <option value="">選択してください</option>
                  {Object.keys(OPTIONS.fateOptions).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">運命</label>
                <select name="fate" value={form.fate} onChange={handleChange} className="w-full border px-3 py-2 rounded" disabled={!form.origin}>
                  <option value="">選択してください</option>
                  {form.origin && OPTIONS.fateOptions[form.origin]?.map((fate) => (
                    <option key={fate} value={fate}>{fate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">仮称</label>
                <select name="alias" value={form.alias} onChange={handleChange} className="w-full border px-3 py-2 rounded" disabled={!form.origin}>
                  <option value="">選択してください</option>
                  {form.origin && OPTIONS.aliasOptions[form.origin]?.map((alias) => (
                    <option key={alias} value={alias}>{alias}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 職種・武器・装飾 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-bold">職種</label>
                <select
                  className="w-full border rounded px-2 py-1 mb-4"
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value as keyof typeof BONUS_CONSTANTS.JOB_BONUSES | "未選択")}
                >
                  <option value="未選択">選択してください</option>
                  {Object.keys(BONUS_CONSTANTS.JOB_BONUSES).map((job) => (
                    <option key={job} value={job}>{job}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="w-full block mb-2 font-bold">武器</label>
                <select
                  className="w-full border rounded px-2 py-1 mb-4"
                  value={selectedWeapon}
                  onChange={(e) => setSelectedWeapon(e.target.value as keyof typeof BONUS_CONSTANTS.WEAPON_BONUSES | "未選択")}
                >
                  <option value="未選択">選択してください</option>
                  {Object.keys(BONUS_CONSTANTS.WEAPON_BONUSES).map((weapon) => (
                    <option key={weapon} value={weapon}>{weapon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-bold">装飾</label>
                <select
                  className="w-full border rounded px-2 py-1 mb-4"
                  value={selectedAccessory}
                  onChange={(e) => setSelectedAccessory(e.target.value as keyof typeof BONUS_CONSTANTS.ACCESSORY_BONUSES | "未選択")}
                >
                  <option value="未選択">選択してください</option>
                  {Object.keys(BONUS_CONSTANTS.ACCESSORY_BONUSES).map((acc) => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* ステータステーブル */}
            <table className="table-auto w-full border mt-8">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">能力</th>
                  <th className="border px-2 py-1">火力</th>
                  <th className="border px-2 py-1">射程</th>
                  <th className="border px-2 py-1">範囲</th>
                  <th className="border px-2 py-1">機動</th>
                  <th className="border px-2 py-1">耐久</th>
                  <th className="border px-2 py-1">反応</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1">成長回数</td>
                  {GROWTH_KEYS.map((key) => (
                    <td key={key} className="border px-2 py-1">
                      <input
                        type="number"
                        name={key}
                        value={growth[key]}
                        onChange={handleGrowthChange}
                        className="w-full border px-1 py-0.5 rounded"
                        step="1"
                        min="0"
                        inputMode="numeric"
                      />
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="border px-2 py-1">合計値</td>
                  <td className="border px-2 py-1">{totalStats.power}</td>
                  <td className="border px-2 py-1">{totalStats.range}</td>
                  <td className="border px-2 py-1">{totalStats.area}</td>
                  <td className="border px-2 py-1">{totalStats.mobility}</td>
                  <td className="border px-2 py-1">{totalStats.durability}</td>
                  <td className="border px-2 py-1">{totalStats.reaction}</td>
                </tr>
              </tbody>
            </table>

            {/* スキル */}
            <div className="space-y-4">
              <div>
                <label className="block mb-1">初期スキル</label>
                <select
                  name="initSkill"
                  value={form.initSkill}
                  onChange={handleChange}
                  className="p-2 border rounded"
                >
                  <option value="">選択してください</option>
                  <optgroup label="≪戦闘スキル≫">
                    {SKILL_OPTIONS.battleSkills.map((option) => (
                      <option key={`battle-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="≪調査スキル≫">
                    {SKILL_OPTIONS.searchSkills.map((option) => (
                      <option key={`search-${option}`} value={option}>
                        {option}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block mb-1">戦闘スキル</label>
                <div className="flex flex-wrap gap-2">
                  {skillArrays.battle.map((skill, idx) => (
                    <select
                      key={idx}
                      value={skill}
                      onChange={(e) => handleSkillArrayChange('battle', idx, e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="">選択してください</option>
                      {SKILL_OPTIONS.battleSkills.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">調査スキル</label>
                <div className="flex flex-wrap gap-2">
                  {skillArrays.search.map((skill, idx) => (
                    <select
                      key={idx}
                      value={skill}
                      onChange={(e) => handleSkillArrayChange('search', idx, e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="">選択してください</option>
                      {SKILL_OPTIONS.searchSkills.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">上位スキル</label>
                <div className="flex flex-wrap gap-2">
                  {skillArrays.advanced.map((skill, idx) => (
                    <select
                      key={idx}
                      value={skill}
                      onChange={(e) => handleSkillArrayChange('advanced', idx, e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="">選択してください</option>
                      {SKILL_OPTIONS.advancedSkills.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ))}
                </div>
              </div>
            </div>

            {/* アイテム */}
            <div>
              <label className="block mb-1">アイテム</label>
              <div className="flex flex-wrap gap-2">
                {skillArrays.items.map((item, idx) => (
                  <select
                    key={idx}
                    value={item}
                    onChange={(e) => handleSkillArrayChange('items', idx, e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="">選択してください</option>
                    {OPTIONS.itemOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {/* メモ */}
            <label className="block mb-2 font-bold">キャラクター設定メモ</label>
            {form.memos.map((memo, idx) => (
              <div key={idx} className="mb-4 border rounded p-2 relative">
                <button
                  className="absolute top-1 right-1 text-red-600 hover:text-red-800 font-bold"
                  onClick={() => {
                    const confirmed = window.confirm(`「${memo.title || "無題のメモ"}」を削除しますか？`);
                    if (confirmed) {
                      const newMemos = form.memos.filter((_, i) => i !== idx);
                      setForm({ ...form, memos: newMemos });
                    }
                  }}
                >
                  ×
                </button>

                <input
                  type="text"
                  className="w-full border rounded p-1 mb-1"
                  placeholder="メモのタイトル"
                  value={memo.title}
                  onChange={(e) => {
                    const newMemos = [...form.memos];
                    newMemos[idx].title = e.target.value;
                    setForm({ ...form, memos: newMemos });
                  }}
                />
                <textarea
                  className="w-full border rounded p-2 h-24 resize-y"
                  placeholder="メモ内容を記入"
                  value={memo.content}
                  onChange={(e) => {
                    const newMemos = [...form.memos];
                    newMemos[idx].content = e.target.value;
                    setForm({ ...form, memos: newMemos });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}