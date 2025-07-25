'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/Sidebar";
import { copyTokenToClipboard } from "@/utils/tokenGenerator";

export default function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("id");


  
  const [generatedTokenJson, setGeneratedTokenJson] = useState("");
  const [showTokenJson, setShowTokenJson] = useState(false);

  const fateOptions: { [key: string]: string[] } = {
    "超越": ["肉体", "科学", "激情"],
    "加護": ["選択", "安寧", "逆転"],
    "契約": ["享受", "収奪", "燃焼", "奉納"],
    "呪い": ["歪曲", "崩壊", "破滅"],
    "異物": ["模造", "混血", "彼方"],
    "報い": ["堕落", "忘却", "封印"],
    "同化": ["怪物", "秘宝", "概念"],
  };

  const aliasOptions: { [key: string]: string[] } = {
    "超越": ["調停者", "観察者", "拒絶者", "教導者"],
    "加護": ["蒐集者", "模倣者", "守護者", "隷属者"],
    "契約": ["破壊者", "策謀者", "先駆者", "支配者"],
    "呪い": ["予言者", "運航者", "探索者", "欺瞞者"],
    "異物": ["放浪者", "復讐者", "征服者", "発見者"],
    "報い": ["侵略者", "審判者", "不死者", "覚醒者"],
    "同化": ["貯蔵者", "挑戦者", "巡礼者", "簒奪者"],
  };

  const jobOptions: string[] = [
    "戦士", "聖職", "猟師", "罪人", "家政", "工匠", "芸家", "放浪", "学徒"
  ];

  const weaponOptions: string[] = [
    "引裂く物", "突刺す物", "薙払う物", "圧潰す物", "叩割る物",
    "打倒す物", "刻込む物", "射抜く物", "撥退る物"
  ];

  const accessoryOptions: string[] = [
    "奇跡の靴", "伝説の指輪", "類稀な外套", "至高の帯", "魔導の書",
    "超常の仮面", "幻の櫛", "格別な首輪", "秘密の刺青"
  ];
  
  const battleSkillOptions = [
    "怨念", "解除", "加速", "庇う", "構え", "鬼気", "逆境", "吸収", "急所", "結界",
    "強奪", "残像", "死角", "指揮", "式神", "自信", "下準備", "地均し", "集中", "執念",
    "衝撃", "尻上り", "心眼", "神器", "捨て身", "全力", "相殺", "蘇生", "溜める", "弾幕",
    "遅延", "挑発", "治療", "使い魔", "伝授", "毒電波", "突進", "配下", "憑依", "不意打ち",
    "暴発", "真似", "守る", "見切り", "目潰し", "連撃"
  ];
  const searchSkillOptions = [
    "暗号", "暗殺", "回想", "観察", "護衛", "散策", "地獄耳", "冗談",
    "仲介", "転移", "道化", "突発", "複製", "平行線", "目星", "猛進",
    "物知り", "誘導"
  ];

  const advancedSkillOptions = [
    "圧倒", "解明", "絆", "気まぐれ", "幻覚", "幸福", "号令", "最強", "自在",
    "侵蝕", "真の姿", "増幅", "大団円", "脳筋", "波動", "不可視", "卜占", "魅了", "輪廻"
  ];

  const initSkillOptions = [...battleSkillOptions, ...searchSkillOptions];
  
  const itemOptions = [
    "宣誓", "後悔", "理想", "大罪", "幸運"
  ];

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    exp: 0,
    origin: "",
    alias: "",
    fate: "",
    job: "",
    weapon: "",
    accessory: "",
    power: 1,
    range: 1,
    area: 1,
    mobility: 1,
    durability: 1,
    reaction: 1,
    memo: "", 
    combatSkills: [],
    investigateSkills: [],
    upperSkills: [],
    initSkill: "",
    memos: [{ title: "メモ1", content: "" }]
  });
  
  const growthKeys: (keyof typeof growth)[] = [
      "power", "range", "area", "mobility", "durability", "reaction"
    ];


  const [growth, setGrowth] = useState({
    power: 0,
    range: 0,
    area: 0,
    mobility: 0,
    durability: 0,
    reaction: 0
  });

const [selectedJob, setSelectedJob] = useState<keyof typeof JOB_BONUSES | "未選択">("未選択");
const [selectedWeapon, setSelectedWeapon] = useState<keyof typeof WEAPON_BONUSES | "未選択">("未選択");
const [selectedAccessory, setSelectedAccessory] = useState<keyof typeof ACCESSORY_BONUSES | "未選択">("未選択");

const [selectedSurveySkills, setSelectedSurveySkills] = useState<string[]>([]); // 調査スキル
const [selectedBattleSkills, setSelectedBattleSkills] = useState<string[]>([]); // 戦闘スキル
const [selectedUpperSkills, setSelectedUpperSkills] = useState<string[]>([]);   // 上位スキル
const [selectedItems, setSelectedItems] = useState<string[]>([]);               // アイテム
const [selectedCodename, setSelectedCodename] = useState("未選択");             // 仮称

        const JOB_BONUSES = {
          "戦士":   { power: 1, range: 0, area: 0, mobility: 0, durability: 500, reaction: 1 },
          "聖職":   { power: 1, range: 1, area: 1, mobility: 0, durability: 0,   reaction: 0 },
          "猟師":   { power: 0, range: 1, area: 0, mobility: 1, durability: 0,   reaction: 0 },
          "罪人":   { power: 0, range: 0, area: 0, mobility: 0, durability: 1000,reaction: 1 },
          "家政":   { power: 1, range: 0, area: 1, mobility: 0, durability: 1000,reaction: 0 },
          "工匠":   { power: 0, range: 0, area: 1, mobility: 0, durability: 500, reaction: 1 },
          "芸家":   { power: 2, range: 1, area: 0, mobility: 0, durability: 0,   reaction: 0 },
          "放浪":   { power: 0, range: 0, area: 0, mobility: 1, durability: 1000,reaction: 1 },
          "学徒":   { power: 0, range: 1, area: 1, mobility: 0, durability: 500, reaction: 0 }
        } as const;

        const WEAPON_BONUSES = {
        "引裂く物":   { power: 1, range: 1, area: 0, mobility: 0, durability: 0,    reaction: 0 },
        "突刺す物":   { power: 1, range: 0, area: 0, mobility: 0, durability: 0,    reaction: 1 },
        "薙払う物":   { power: 0, range: 0, area: 1, mobility: 1, durability: 0,    reaction: 0 },
        "圧潰す物":   { power: 1, range: 0, area: 2, mobility: 0, durability: 0,    reaction: 0 },
        "叩割る物":   { power: 2, range: 0, area: 0, mobility: 0, durability: 500,  reaction: 0 },
        "打倒す物":   { power: 1, range: 0, area: 0, mobility: 1, durability: 0,    reaction: 0 },
        "刻込む物":   { power: 1, range: 0, area: 0, mobility: 0, durability: 1000, reaction: 0 },
        "射抜く物":   { power: 0, range: 1, area: 1, mobility: 0, durability: 0,    reaction: 0 },
        "撥退る物":   { power: 0, range: 0, area: 1, mobility: 0, durability: 1000, reaction: 0 }
      } as const;

      const ACCESSORY_BONUSES = {
      "奇跡の靴":     { power: 0, range: 0, area: 0, mobility: 1, durability: 500, reaction: 0 },
      "伝説の指輪":   { power: 0, range: 0, area: 0, mobility: 0, durability: 1500, reaction: 0 },
      "類稀な外套":   { power: 0, range: 0, area: 1, mobility: 0, durability: 1000, reaction: 0 },
      "至高の帯":     { power: 0, range: 0, area: 0, mobility: 0, durability: 500, reaction: 1 },
      "魔導の書":     { power: 0, range: 1, area: 0, mobility: 0, durability: 500, reaction: 0 },
      "超常の仮面":   { power: 0, range: 0, area: 1, mobility: 1, durability: 0, reaction: 0 },
      "幻の櫛":       { power: 1, range: 0, area: 0, mobility: 0, durability: 0, reaction: 1 },
      "格別な首輪":   { power: 1, range: 0, area: 0, mobility: 1, durability: 0, reaction: 0 },
      "秘密の刺青":   { power: 0, range: 0, area: 1, mobility: 0, durability: 0, reaction: 1 }
    } as const;

const saveCharacterSheet = async () => {
  const user = auth.currentUser;

  if (!user) {
    alert("ログインしていません。保存できません。");
    return;
  }

  const uid = user.uid;

        const jobBonus = selectedJob !== "未選択" ? JOB_BONUSES[selectedJob] : {
      power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
    };
    const weaponBonus = selectedWeapon !== "未選択" ? WEAPON_BONUSES[selectedWeapon] : {
      power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
    };
    const accessoryBonus = selectedAccessory !== "未選択" ? ACCESSORY_BONUSES[selectedAccessory] : {
      power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
    };

    const totalStats = {
      power:      form.power      + growth.power      * 2 + jobBonus.power      + weaponBonus.power      + accessoryBonus.power,
      range:      form.range      + growth.range      * 1 + jobBonus.range      + weaponBonus.range      + accessoryBonus.range,
      area:       form.area       + growth.area       * 2 + jobBonus.area       + weaponBonus.area       + accessoryBonus.area,
      mobility:   form.mobility   + growth.mobility   * 1 + jobBonus.mobility   + weaponBonus.mobility   + accessoryBonus.mobility,
      durability: form.durability + growth.durability * 1000 + jobBonus.durability + weaponBonus.durability + accessoryBonus.durability,
      reaction:   form.reaction   + growth.reaction   * 1 + jobBonus.reaction   + weaponBonus.reaction   + accessoryBonus.reaction,
    };

    const remainingExp =
  form.exp -
  (growth.power + growth.range + growth.area + growth.mobility + growth.durability + growth.reaction) * 5 -
  selectedSurveySkills.filter(Boolean).length * 3 -
  selectedBattleSkills.filter(Boolean).length * 5 -
  selectedUpperSkills.filter(Boolean).length * 30 -
  selectedItems.filter(Boolean).length * 1 -
  (form.alias ? 5 : 0);


  const characterData = {
    name: form.name || "", // 名前フィールドがあれば
    form,
    growth,
    selectedJob,
    selectedWeapon,
    selectedAccessory,
    selectedCodename,
    selectedSurveySkills,
    selectedBattleSkills,
    selectedUpperSkills,
    selectedItems,
    totalStats,
    remainingExp,
    userId: user.uid,
    updatedAt: Timestamp.now(),
    createdAt: Timestamp.now()
  };
  

    try {
      if (characterId) {
        // 編集モード
        await setDoc(doc(db, "characters", characterId), characterData, { merge: true });
        router.push(`/character/${characterId}`);
      } else {
        // 新規作成モード
        const docRef = await addDoc(collection(db, "characters"), {
          ...characterData,
          createdAt: Timestamp.now(),  // ✅ 新規作成時のみ追加
        });
        router.push(`/character/${docRef.id}`);
      }
    } catch (error) {
      console.error("キャラシートの保存に失敗:", error);
      alert("保存に失敗しました。もう一度お試しください。");
    }
};

const remainingExp = useMemo(() => {
  const growthTotal =
    growth.power +
    growth.range +
    growth.area +
    growth.mobility +
    growth.durability +
    growth.reaction;

  const surveySkillCount = selectedSurveySkills.length;  // 調査スキル
  const battleSkillCount = selectedBattleSkills.length;  // 戦闘スキル
  const upperSkillCount = selectedUpperSkills.length;    // 上位スキル
  const itemCount = selectedItems.length;                // アイテム

  const codenameCost = selectedCodename !== "未選択" ? 5 : 0;

  const cost =
    growthTotal * 5 +
    surveySkillCount * 3 +
    battleSkillCount * 5 +
    upperSkillCount * 30 +
    itemCount * 1 +
    codenameCost;

  return form.exp - cost;
}, [
  form.exp,
  growth,
  selectedSurveySkills,
  selectedBattleSkills,
  selectedUpperSkills,
  selectedItems,
  selectedCodename,
]);

const handleGenerateTokenAndCopy = () => {
  // 現在のフォーム状態から必要なデータを構築
  const characterData = {
    form: {
      name: form.name,
      fate: form.fate,
      alias: form.alias,
      initSkill: form.initSkill,

    },
    totalStats,
    selectedBattleSkills,
    selectedSurveySkills,
    selectedUpperSkills,
  };
  
  // ユーティリティ関数を使用
  copyTokenToClipboard(characterData);
};

  const handleGrowthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = parseInt(value) || 0;
    setGrowth(prev => ({ ...prev, [name]: val }));
  };



      const totalStats = useMemo(() => {
        const jobBonus = selectedJob !== "未選択" ? JOB_BONUSES[selectedJob] : {
          power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
        };
        const weaponBonus = selectedWeapon !== "未選択" ? WEAPON_BONUSES[selectedWeapon] : {
          power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
        };
        const accessoryBonus = selectedAccessory !== "未選択" ? ACCESSORY_BONUSES[selectedAccessory] : {
          power: 0, range: 0, area: 0, mobility: 0, durability: 0, reaction: 0
        };

        return {
          power:      form.power      + growth.power      * 2 + jobBonus.power      + weaponBonus.power      + accessoryBonus.power,
          range:      form.range      + growth.range      * 1 + jobBonus.range      + weaponBonus.range      + accessoryBonus.range,
          area:       form.area       + growth.area       * 2 + jobBonus.area       + weaponBonus.area       + accessoryBonus.area,
          mobility:   form.mobility   + growth.mobility   * 1 + jobBonus.mobility   + weaponBonus.mobility   + accessoryBonus.mobility,
          durability: form.durability + growth.durability * 1000 + jobBonus.durability + weaponBonus.durability + accessoryBonus.durability,
          reaction:   form.reaction   + growth.reaction   * 1 + jobBonus.reaction   + weaponBonus.reaction   + accessoryBonus.reaction,
        };
      }, [form, growth, selectedJob, selectedWeapon, selectedAccessory]);

  const [battleSkills, setBattleSkills] = useState<string[]>([""]);
  const [searchSkills, setSearchSkills] = useState<string[]>([""]);
  const [advancedSkills, setAdvancedSkills] = useState<string[]>([""]);
  const [items, setItems] = useState<string[]>([""]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSkillChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    skills: string[]
  ) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setter(newSkills);
    if (value !== "" && index === skills.length - 1) {
      setter([...newSkills, ""]);
    }
  };

            const handleItemChange = (index: number, value: string) => {
            const newItems = [...items];
            newItems[index] = value;
            setItems(newItems);
            if (value !== "" && index === items.length - 1) {
              setItems([...newItems, ""]);
            }
          };

    useEffect(() => {
      setSelectedBattleSkills(battleSkills.filter((s) => s !== ""));
    }, [battleSkills]);

    useEffect(() => {
      setSelectedSurveySkills(searchSkills.filter((s) => s !== ""));
    }, [searchSkills]);

    useEffect(() => {
      setSelectedUpperSkills(advancedSkills.filter((s) => s !== ""));
    }, [advancedSkills]);

    useEffect(() => {
      setSelectedItems(items.filter((i) => i !== ""));
    }, [items]);

    useEffect(() => {
      setSelectedCodename(form.alias || "未選択");
    }, [form.alias]);


    useEffect(() => {
  const fetchCharacter = async () => {
    if (!characterId) return;

    const docRef = doc(db, "characters", characterId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();

      // 各種stateにデータを反映
      setForm(data.form);
      setGrowth(data.growth);
      setSelectedJob(data.selectedJob || "未選択");
      setSelectedWeapon(data.selectedWeapon || "未選択");
      setSelectedAccessory(data.selectedAccessory || "未選択");
      setSelectedCodename(data.selectedCodename || "未選択");
      setSelectedSurveySkills(data.selectedSurveySkills || []);
      setSelectedBattleSkills(data.selectedBattleSkills || []);
      setSelectedUpperSkills(data.selectedUpperSkills || []);
      setSelectedItems(data.selectedItems || []);
      setSearchSkills((data.selectedSurveySkills || []).concat([""]));
      setBattleSkills((data.selectedBattleSkills || []).concat([""]));
      setAdvancedSkills((data.selectedUpperSkills || []).concat([""]));
      setItems((data.selectedItems || []).concat([""]));
    }
  };

  fetchCharacter();
}, [characterId]);



  console.log("CreatePage rendered!");
return (
  <div className="flex min-h-screen bg-white text-gray-800">
    {/* サイドバー */}
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
    
    {/* メインコンテンツ */}
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

        {/* 出自・運命・仮称 */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">出自</label>
            <select name="origin" value={form.origin} onChange={handleChange} className="w-full border px-3 py-2 rounded">
              <option value="">選択してください</option>
              {Object.keys(fateOptions).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">運命</label>
            <select name="fate" value={form.fate} onChange={handleChange} className="w-full border px-3 py-2 rounded" disabled={!form.origin}>
              <option value="">選択してください</option>
              {form.origin && fateOptions[form.origin]?.map((fate) => (
                <option key={fate} value={fate}>{fate}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">仮称</label>
            <select name="alias" value={form.alias} onChange={handleChange} className="w-full border px-3 py-2 rounded" disabled={!form.origin}>
              <option value="">選択してください</option>
              {form.origin && aliasOptions[form.origin]?.map((alias) => (
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
              onChange={(e) => setSelectedJob(e.target.value as keyof typeof JOB_BONUSES | "未選択")}
            >
              <option value="未選択">選択してください</option>
              {Object.keys(JOB_BONUSES).map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="w-full block mb-2 font-bold">武器</label>
            <select
              className="w-full border rounded px-2 py-1 mb-4"
              value={selectedWeapon}
              onChange={(e) => setSelectedWeapon(e.target.value as keyof typeof WEAPON_BONUSES | "未選択")}
            >
              <option value="未選択">選択してください</option>
              {Object.keys(WEAPON_BONUSES).map((weapon) => (
                <option key={weapon} value={weapon}>
                  {weapon}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold">装飾</label>
            <select
              className="w-full border rounded px-2 py-1 mb-4"
              value={selectedAccessory}
              onChange={(e) => setSelectedAccessory(e.target.value as keyof typeof ACCESSORY_BONUSES | "未選択")}
            >
              <option value="未選択">選択してください</option>
              {Object.keys(ACCESSORY_BONUSES).map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 数値系ステータス */}
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
              {growthKeys.map((key) => (
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
                {battleSkillOptions.map((option) => (
                  <option key={`battle-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </optgroup>
              <optgroup label="≪調査スキル≫">
                {searchSkillOptions.map((option) => (
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
              {battleSkills.map((skill, idx) => (
                <select
                  key={idx}
                  value={skill}
                  onChange={(e) => handleMultiSkillChange(idx, e.target.value, setBattleSkills, battleSkills)}
                  className="p-2 border rounded"
                >
                  <option value="">選択してください</option>
                  {battleSkillOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">調査スキル</label>
            <div className="flex flex-wrap gap-2">
              {searchSkills.map((skill, idx) => (
                <select
                  key={idx}
                  value={skill}
                  onChange={(e) => handleMultiSkillChange(idx, e.target.value, setSearchSkills, searchSkills)}
                  className="p-2 border rounded"
                >
                  <option value="">選択してください</option>
                  {searchSkillOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">上位スキル</label>
            <div className="flex flex-wrap gap-2">
              {advancedSkills.map((skill, idx) => (
                <select
                  key={idx}
                  value={skill}
                  onChange={(e) => handleMultiSkillChange(idx, e.target.value, setAdvancedSkills, advancedSkills)}
                  className="p-2 border rounded"
                >
                  <option value="">選択してください</option>
                  {advancedSkillOptions.map((option) => (
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
          {items.map((item, idx) => (
            <select
              key={idx}
              value={item}
              onChange={(e) => handleItemChange(idx, e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">選択してください</option>
              {itemOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ))}
        </div>

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
