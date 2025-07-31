// utils/tokenGenerator.ts

// 型定義
interface CharacterData {
  id?: string;
  form: {
    name: string;
    fate: string;
    alias: string;
    initSkill: string;
    fateboost?: number;
  };
  totalStats: {
    power: number;
    range: number;
    area: number;
    mobility: number;
    durability: number;
    reaction: number;
  };
  selectedBattleSkills: string[];
  selectedSurveySkills: string[];
  selectedUpperSkills: string[];
}

// 各種テーブルデータ
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
    ":科学値=",
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
    ":享受値1=",
    ":享受値2=",
  ],
  "収奪": [
    "3hs8, 契約",
    "3hs8,e,{収奪値} 収奪の契約",
    ":収奪値=",  
],
  "燃焼": [
    "3hs8, 契約",
    "3hs8,b 燃焼の契約",
  ],
  "奉納": [
    "3hs8, 契約",
    "3hs8,o,{奉納値1},{奉納値2} 契約",
    "3hs8,o,{奉納値1},{奉納値2} 奉納の契約",
    ":奉納値1=",
    ":奉納値2=",
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
    ":彼方値=",
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
    ":封印値=",
  ],
  "怪物": [
    "12hs2,m,{d2},{d4},{d6},{d8},{d10},{d12},{d20},{d60} 同化",
    "12hs2,m,{d2},{d4},{d6},{d8},{d10},{d12},{d20},{d60} 怪物の同化",
    ":d2=",
    ":d4=",
    ":d6=",
    ":d8=",
    ":d10=",
    ":d12=",
    ":d20=",
    ":d60=",
  ],
  "秘宝": [
    "12hs2 同化",
    "12hs2,t,{秘宝値} 秘宝の同化",
    ":秘宝値=",
  ],
  "概念": [
    "12hs2 同化",
    "12hs2,c,{概念値} 概念の同化",
    ":概念値=",
  ],
};

const commonCommands: string[] = [
  ":耐久-",
  ":運命-1",
  ":達成値=",
  ":initiative=",
  "C({達成値}*{射程}) 命中値",
  "C({達成値}*{火力}) 破壊値",
  "C({達成値}*{機動}) 回避値",
  "C({達成値}*{反応}) 守護値",
];

// メイン関数：ココフォリア用トークンデータを生成してクリップボードにコピー
export const copyTokenToClipboard = (characterData: CharacterData): void => {
  const { form, totalStats, selectedBattleSkills, selectedSurveySkills, selectedUpperSkills} = characterData;
  const { initSkill } = form;
  
  const baseFateValue = fateTable[form.fate] ?? 0;
  const fateBoost = (form as any).fateboost ?? 0;

  const fateValue = 
    baseFateValue === 999 || fateBoost === 0 
      ? baseFateValue 
      : baseFateValue + fateBoost;
  const status: any[] = [];

  // 基本ステータスを追加
  
  status.push({
    label: "耐久",
    value: totalStats.durability,
    max: totalStats.durability,
  });

    status.push({
    label: "運命",
    value: fateValue,
    max: fateValue,
  });

  // 仮称があれば追加
  if (form.alias && aliasTable[form.alias]) {
    const aliasValue = aliasTable[form.alias];
    status.push({
      label: "仮称",
      value: aliasValue,
      max: aliasValue,
    });
  }

  // 達成値を追加
  status.push({
    label: "達成値",
    value: 0,
    max: 99999,
  });

  // 運命に応じた特殊ステータスを追加
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

  // スキルを追加
  const allSkills = [
    ...(characterData.form.initSkill ? [characterData.form.initSkill] : []), 
    ...(selectedBattleSkills ?? []),
    ...(selectedSurveySkills ?? []),
    ...(selectedUpperSkills ?? []),
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

  // パラメータを設定
    const params = [
    { label: "火力", value: totalStats.power.toString() },
    { label: "射程", value: totalStats.range.toString() },
    { label: "範囲", value: totalStats.area.toString() },
    { label: "機動", value: totalStats.mobility.toString() },
    { label: "反応", value: totalStats.reaction.toString() },
    ];


  // コマンドを生成
  const commands = [
    ...(fateCommandTable[form.fate] ?? []),
    ...commonCommands,
  ].join("\n");

  // トークンデータを構築
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
        externalUrl: `https://heroscale-charasheet.vercel.app/character/${characterData.id ?? ""}`, // ★ここを追加
      },
    };

  // JSONに変換してクリップボードにコピー
  const json = JSON.stringify(tokenData, null, 2);
  navigator.clipboard.writeText(json)
    .then(() => alert("ココフォリア用駒データをクリップボードにコピーしました！"))
    .catch(() => alert("コピーに失敗しました"));
};

// TypeScriptでは型も一緒にexportすることができます
export type { CharacterData };