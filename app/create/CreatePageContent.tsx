'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";


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
    "図星", "仲介", "転移", "道化", "突発", "複製", "平行線", "猛進",
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
      "至高の箒":     { power: 0, range: 0, area: 0, mobility: 0, durability: 500, reaction: 1 },
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
    uid,
    createdAt: Timestamp.now()
  };
  

 try {
    if (characterId) {
      // 編集モード → setDocで上書き
      await setDoc(doc(db, "characters", characterId), characterData);
      router.push(`/character/${characterId}`);
    } else {
      // 新規作成モード
      const docRef = await addDoc(collection(db, "characters"), {
        ...characterData,
        createdAt: Timestamp.now()
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

  const fateTable: Record<string, number> = {
    "肉体": 999,
    "科学": 10,
    "激情": 5,
    "選択": 999,
    "安寧": 10,
    "逆転": 5,
    "享受": 999,
    "収奪": 999,
    "燃焼": 10,
    "奉納": 5,
    "歪曲": 999,
    "崩壊": 10,
    "破滅": 5,
    "模造": 999,
    "混血": 10,
    "彼方": 5,
    "堕落": 999,
    "忘却": 10,
    "封印": 5,
    "怪物": 999,
    "秘宝": 10,
    "概念": 5,
  };

  const aliasTable: Record<string, number> = {
    "調停者": 3,
    "蒐集者": 3,
    "破壊者": 3,
    "予言者": 3,
    "放浪者": 3,
    "侵略者": 3,
    "貯蔵者": 3,
  };
  const skillTable: Record<string, { value: number; max: number }> = {
    "怨念": { value: 1, max: 1 },
    "解除": { value: 1, max: 1 },
    "加速": { value: 1, max: 1 },
    "庇う": { value: 999, max: 999 },
    "構え": { value: 5, max: 5 },
    "鬼気": { value: 3, max: 3 },
    "逆境": { value: 1, max: 1 },
    "吸収": { value: 3, max: 3 },
    "急所": { value: 5, max: 5 },
    "結界": { value: 3, max: 3 },
    "強奪": { value: 3, max: 3 },
    "残像": { value: 1, max: 1 },
    "死角": { value: 3, max: 3 },
    "指揮": { value: 1, max: 1 },
    "式神": { value: 1, max: 1 },
    "自信": { value: 1, max: 1 },
    "下準備": { value: 5, max: 5 },
    "地均し": { value: 3, max: 3 },
    "集中": { value: 3, max: 3 },
    "執念": { value: 3, max: 3 },
    "衝撃": { value: 5, max: 5 },
    "尻上り": { value: 3, max: 3 },
    "心眼": { value: 1, max: 1 },
    "神器": { value: 1, max: 1 },
    "捨て身": { value: 3, max: 3 },
    "全力": { value: 5, max: 5 },
    "相殺": { value: 5, max: 5 },
    "蘇生": { value: 3, max: 3 },
    "溜める": { value: 3, max: 3 },
    "弾幕": { value: 5, max: 5 },
    "遅延": { value: 1, max: 1 },
    "挑発": { value: 3, max: 3 },
    "治療": { value: 5, max: 5 },
    "使い魔": { value: 1, max: 1 },
    "伝授": { value: 1, max: 1 },
    "毒電波": { value: 1, max: 1 },
    "突進": { value: 3, max: 3 },
    "配下": { value: 1, max: 1 },
    "憑依": { value: 1, max: 1 },
    "不意打ち": { value: 3, max: 3 },
    "暴発": { value: 1, max: 1 },
    "真似": { value: 1, max: 1 },
    "守る": { value: 5, max: 5 },
    "見切り": { value: 3, max: 3 },
    "目潰し": { value: 3, max: 3 },
    "連撃": { value: 3, max: 3 },
    "暗号": { value: 3, max: 3 },
    "暗殺": { value: 3, max: 3 },
    "回想": { value: 1, max: 1 },
    "観察": { value: 3, max: 3 },
    "護衛": { value: 3, max: 3 },
    "散策": { value: 1, max: 1 },
    "地獄耳": { value: 5, max: 5 },
    "冗談": { value: 5, max: 5 },
    "仲介": { value: 3, max: 3 },
    "転移": { value: 3, max: 3 },
    "道化": { value: 3, max: 3 },
    "突発": { value: 3, max: 3 },
    "複製": { value: 3, max: 3 },
    "平行線": { value: 1, max: 1 },
    "目星": { value: 1, max: 1 },
    "猛進": { value: 3, max: 3 },
    "物知り": { value: 1, max: 1 },
    "誘導": { value: 3, max: 3 },
    "圧倒": { value: 1, max: 1 },
    "解明": { value: 1, max: 1 },
    "絆": { value: 1, max: 1 },
    "気まぐれ": { value: 999, max: 999 },
    "幻覚": { value: 10, max: 10 },
    "幸福": { value: 1, max: 1 },
    "号令": { value: 1, max: 1 },
    "最強": { value: 1, max: 1 },
    "自在": { value: 999, max: 999 },
    "侵蝕": { value: 5, max: 5 },
    "真の姿": { value: 1, max: 1 },
    "増幅": { value: 1, max: 1 },
    "大団円": { value: 1, max: 1 },
    "脳筋": { value: 1, max: 1 },
    "波動": { value: 10, max: 10 },
    "不可視": { value: 3, max: 3 },
    "卜占": { value: 5, max: 5 },
    "魅了": { value: 1, max: 1 },
    "輪廻": { value: 1, max: 1 },
  };

  const fateCommandTable: Record<string, string[]> = {
    "肉体": [
      "5hs4 超越",
      "5hs4,b 肉体の超越",
    ],
    "科学": [
      "5hs4 超越",
      "5hs4,s,{科学値} 科学の超越",
    ],
    "激情": [
      "5hs4 超越",
      "5hs4,p 激情の超越",
    ],
    "選択": [
      "4hs6 加護",
      "4hs6,s 選択の加護",
    ],
    "安寧": [
      "4hs6 加護",
      "4hs6,p 安寧の加護",
    ],
    "逆転": [
      "4hs6 加護",
      "4hs6,r 逆転の加護",
    ],
    "享受": [
      "3hs8, 契約",
      "3hs8,a,{享受値1},{享受値2} 享受の契約",
    ],
    "収奪": [
      "3hs8, 契約",
      "3hs8,e,{収奪値} 収奪の契約",
    ],
    "燃焼": [
      "3hs8, 契約",
      "3hs8,b 燃焼の契約",
    ],
    "奉納": [
      "3hs8, 契約",
      "3hs8,o,{奉納値1},{奉納値2} 契約",
      "3hs8,o,{奉納値1},{奉納値2} 奉納の契約",
    ],
    "歪曲": [
      "2hs20 呪い",
      "2hs20,d 歪曲の呪い",
    ],
    "崩壊": [
      "2hs20 呪い",
      "2hs20,c 崩壊の呪い",
    ],
    "破滅": [
      "2hs20 呪い",
      "2hs20,r 破滅の呪い",
    ],
    "模造": [
      "3hs10 異物",
      "3hs10,i 模造の異物",
    ],
    "混血": [
      "3hs10 異物",
      "3hs10,m, 混血の異物",
    ],
    "彼方": [
      "3hs10 異物",
      "3hs10,b,{彼方値} 彼方の異物",
    ],
    "堕落": [
      "1hs60 報い",
      "1hs60,d 堕落の報い",
    ],
    "忘却": [
      "1hs60 報い",
      "1hs60,o 忘却の報い",
    ],
    "封印": [
      "1hs60 報い",
      "1hs60,s,{封印値} 封印の報い",
    ],
    "怪物": [
      "12hs2,m,{d2},{d4},{d6},{d8},{d10},{d12},{d20},{d60} 同化",
      "12hs2,m,{d2},{d4},{d6},{d8},{d10},{d12},{d20},{d60} 怪物の同化",
    ],
    "秘宝": [
      "12hs2 同化",
      "12hs2,t,{秘宝値} 秘宝の同化",
    ],
    "概念": [
      "12hs2 同化",
      "12hs2,c,{概念値} 概念の同化",
    ],
  };

  const commonCommands = [
    ":耐久-",
    ":運命-1",
    ":達成値=",
    "C({達成値}*{射程}) 命中値",
    "C({達成値}*{火力}) 破壊値",
    "C({達成値}*{機動}) 回避値",
    "C({達成値}*{反応}) 守護値",
  ];


const handleGenerateTokenAndCopy = () => {
  const fateValue = fateTable[form.fate] ?? 0;
  const status: any[] = [];

  status.push({
    label: "運命",
    value: fateValue,
    max: fateValue,
  });

  status.push({
    label: "耐久",
    value: totalStats.durability,
    max: totalStats.durability,
  });

  if (form.alias && aliasTable[form.alias]) {
    const aliasValue = aliasTable[form.alias];
    status.push({
      label: "仮称",
      value: aliasValue,
      max: aliasValue,
    });
  }

  status.push({
    label: "達成値",
    value: 0,
    max: 99999,
  });

  switch (form.fate) {
    case "科学":
      status.push({ label: "科学値", value: 0, max: 1024 });
      break;
    case "享受":
      status.push(
        { label: "享受値1", value: 0, max: 0 },
        { label: "享受値2", value: 0, max: 0 }
      );
      break;
    case "収奪":
      status.push({ label: "収奪値", value: 0, max: 0 });
      break;
    case "奉納":
      status.push(
        { label: "奉納値1", value: 1, max: 8 },
        { label: "奉納値2", value: 1, max: 8 }
      );
      break;
    case "彼方":
      status.push({ label: "彼方値", value: 666, max: 666 });
      break;
    case "封印":
      status.push({ label: "封印値", value: 1, max: 1024 });
      break;
    case "怪物":
      status.push(
        { label: "d2", value: 12, max: 0 },
        { label: "d4", value: 0, max: 0 },
        { label: "d6", value: 0, max: 0 },
        { label: "d8", value: 0, max: 0 },
        { label: "d10", value: 0, max: 0 },
        { label: "d12", value: 0, max: 0 },
        { label: "d20", value: 0, max: 0 },
        { label: "d60", value: 0, max: 0 }
      );
      break;
    case "秘宝":
      status.push({ label: "秘宝値", value: 6, max: 12 });
      break;
    case "概念":
      status.push({ label: "概念値", value: 0, max: 12 });
      break;
  }

  const allSkills = [
    ...(form.combatSkills ?? []),
    ...(form.investigateSkills ?? []),
    ...(form.upperSkills ?? []),
  ];

  for (const skillName of allSkills) {
    const skill = skillTable[skillName];
    if (skill) {
      status.push({
        label: skillName,
        value: skill.value,
        max: skill.max,
      });
    }
  }

  const params = [
    { label: "火力", value: totalStats.power },
    { label: "射程", value: totalStats.range },
    { label: "範囲", value: totalStats.area },
    { label: "機動", value: totalStats.mobility },
    { label: "反応", value: totalStats.reaction },
  ];

  const commands = [
    ...(fateCommandTable[form.fate] ?? []),
    ...commonCommands,
  ].join("\n");

  const tokenData = {
    kind: "character",
    data: {
      name: form.name || "名前なし",
      memo: "",
      initiative: 0,
      status,
      params,
      iconUrl: "",
      commands,
    },
  };

  const json = JSON.stringify(tokenData, null, 2);
  navigator.clipboard.writeText(json)
    .then(() => alert("ココフォリア用駒データをクリップボードにコピーしました！"))
    .catch(() => alert("コピーに失敗しました"));
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

  <div className="flex min-h-screen bg-white text-gray-800">
    {/* サイドバー */}
    <aside className="w-64 p-4 bg-gray-100 sticky top-0 h-screen flex flex-col gap-4">
      <button onClick={() => router.push("/")} className="px-4 py-2 bg-gray-500 text-white rounded">ホームに戻る</button>

      <button
        onClick={() => router.push("/mypage")}
        className="px-4 py-2 bg-gray-500 text-white rounded"
      >
        マイページへ
      </button>
      
      <button
        className="bg-green-500 text-white px-3 py-2 rounded"
        onClick={() => {
          const title = prompt("新しいメモのタイトルを入力してください");
          if (title) {
            setForm({
              ...form,
              memos: [...form.memos, { title, content: "" }]
            });
          }
        }}
      >
        メモを追加
      </button>
      <button
        onClick={saveCharacterSheet}
        className="bg-blue-600 text-white font-bold px-4 py-2 rounded hover:bg-blue-700"
      >
        キャラクターを保存する
      </button>
      <button
        onClick={handleGenerateTokenAndCopy}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2"
      >
        CCFOLIA駒出力
      </button>

      <p className="text-center text-sm text-gray-600 mb-4">
        ログイン中: {user?.displayName || user?.email || "ゲストユーザー"}
      </p>

    </aside>

        {/* メインコンテンツ */}
    <main className="flex-1 p-8 overflow-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">英雄の尺度　キャラクターシート</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {/* 基本情報 */}
        <div className="grid grid-cols-3 gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="PC名" className="p-2 border rounded" />
          <input name="gender" value={form.gender} onChange={handleChange} placeholder="性別" className="p-2 border rounded" />
          <input name="age" value={form.age} onChange={handleChange} placeholder="年齢" className="p-2 border rounded" />
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
  className="border rounded px-2 py-1 mb-4"
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
    <label className="block mb-2 font-bold">武器</label>
<select
  className="border rounded px-2 py-1 mb-4"
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
      className="border rounded px-2 py-1 mb-4"
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
              className="p-2 border rounded w-full"
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
    </main>
    </div>

    </div>);
}
