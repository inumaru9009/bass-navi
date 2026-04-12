// src/lib/keyData.ts

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NOTE_ALIASES: Record<string, string> = {
  "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#",
  "Ab": "G#", "Bb": "A#", "Cb": "B",
};

// メジャースケール音程
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
// ナチュラルマイナースケール音程
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// メジャーダイアトニックコード（度数・クオリティ・ローマ数字）
const MAJOR_DIATONIC = [
  { degree: 0,  quality: "",      roman: "I"       },
  { degree: 2,  quality: "m",     roman: "IIm"     },
  { degree: 4,  quality: "m",     roman: "IIIm"    },
  { degree: 5,  quality: "",      roman: "IV"      },
  { degree: 7,  quality: "",      roman: "V"       },
  { degree: 9,  quality: "m",     roman: "VIm"     },
  { degree: 11, quality: "m7b5",  roman: "VIIm♭5"  },
];

// マイナーダイアトニックコード
const MINOR_DIATONIC = [
  { degree: 0,  quality: "m",     roman: "Im"      },
  { degree: 2,  quality: "m7b5",  roman: "IIm♭5"  },
  { degree: 3,  quality: "",      roman: "♭III"    },
  { degree: 5,  quality: "m",     roman: "IVm"     },
  { degree: 7,  quality: "m",     roman: "Vm"      },
  { degree: 8,  quality: "",      roman: "♭VI"     },
  { degree: 10, quality: "",      roman: "♭VII"    },
];

type DiatonicEntry = { degree: number; quality: string; roman: string };

type ProgressionDef = {
  name: string;
  description: string;
  degreeIndices?: number[];
  chordsFn?: (root: string) => string[];
  degrees?: string[];
};

// メジャーコード進行パターン（度数インデックスで定義）
// MAJOR_DIATONICのindex: 0=I, 1=IIm, 2=IIIm, 3=IV, 4=V, 5=VIm, 6=VIIm♭5
const MAJOR_PROGRESSIONS: ProgressionDef[] = [
  {
    name: "王道進行",
    degreeIndices: [0, 4, 5, 3],
    description: "Jポップで最もよく使われる。明るく感動的な流れ。",
  },
  {
    name: "カノン進行",
    degreeIndices: [0, 4, 5, 2, 3, 0, 3, 4],
    description: "クラシック由来。壮大で美しい流れ。",
  },
  {
    name: "循環進行",
    degreeIndices: [0, 5, 3, 4],
    description: "50年代ロック・ポップスの定番。明るくシンプル。",
  },
  {
    name: "下降進行",
    chordsFn: (root: string) => {
      const idx = NOTES.indexOf(root);
      return [
        root,
        NOTES[(idx + 10) % 12],
        NOTES[(idx + 8) % 12],
        NOTES[(idx + 7) % 12],
      ];
    },
    degrees: ["I", "♭VII", "♭VI", "V"],
    description: "ベースラインが半音下降。ドラマチックな雰囲気。",
  },
  {
    name: "ブルース進行",
    chordsFn: (root: string) => {
      const idx = NOTES.indexOf(root);
      return [
        root,
        NOTES[(idx + 5) % 12],
        root,
        NOTES[(idx + 7) % 12],
        NOTES[(idx + 5) % 12],
        root,
      ];
    },
    degrees: ["I", "IV", "I", "V", "IV", "I"],
    description: "ロック・R&Bの基本。グルーヴ重視。",
  },
  {
    name: "Just the Two of Us進行",
    chordsFn: (root: string) => {
      const idx = NOTES.indexOf(root);
      return [
        NOTES[(idx + 5) % 12] + "maj7",
        NOTES[(idx + 4) % 12] + "m7",
        NOTES[(idx + 9) % 12] + "m7",
      ];
    },
    degrees: ["IVmaj7", "IIIm7", "VIm7"],
    description: "おしゃれ・ネオソウル系の定番。",
  },
];

// マイナーコード進行パターン
// MINOR_DIATONICのindex: 0=Im, 1=IIm♭5, 2=♭III, 3=IVm, 4=Vm, 5=♭VI, 6=♭VII
const MINOR_PROGRESSIONS: ProgressionDef[] = [
  {
    name: "基本マイナー進行",
    degreeIndices: [0, 6, 5, 6],
    description: "マイナーキーの最も基本的な循環。暗く落ち着いた雰囲気。",
  },
  {
    name: "悲しみの王道",
    degreeIndices: [0, 5, 2, 6],
    description: "Jポップのマイナー版王道。切なさと美しさが共存。",
  },
  {
    name: "フラメンコ進行",
    chordsFn: (root: string) => {
      const idx = NOTES.indexOf(root);
      return [
        NOTES[(idx + 5) % 12] + "m",
        NOTES[(idx + 10) % 12],
        NOTES[(idx + 8) % 12],
        NOTES[(idx + 7) % 12],
      ];
    },
    degrees: ["IVm", "♭VII", "♭VI", "V"],
    description: "スペイン・フラメンコ由来。情熱的でドラマチック。",
  },
  {
    name: "Andalusian Cadence",
    degreeIndices: [0, 6, 5, 4],
    description: "クラシック・フラメンコの定番下降進行。緊張感がある。",
  },
  {
    name: "マイナーブルース",
    chordsFn: (root: string) => {
      const idx = NOTES.indexOf(root);
      return [
        root + "m",
        NOTES[(idx + 5) % 12] + "m",
        root + "m",
        NOTES[(idx + 7) % 12],
        NOTES[(idx + 5) % 12] + "m",
        root + "m",
      ];
    },
    degrees: ["Im", "IVm", "Im", "V", "IVm", "Im"],
    description: "ブルースのマイナー版。哀愁とグルーヴ。",
  },
  {
    name: "夜想進行",
    degreeIndices: [0, 3, 6, 2],
    description: "映画・ドラマBGMによく登場。物悲しく美しい。",
  },
];

function getBassPoint(normalizedRoot: string, isMinor: boolean): string {
  const openStringKeys = ["C", "G", "D", "A", "E"];
  const openStringMinorKeys = ["E", "A", "D"];
  const highPosKeys = ["F#", "G#", "A#", "C#", "D#"];

  if (isMinor) {
    if (openStringMinorKeys.includes(normalizedRoot))
      return "開放弦が多く使えるキー。E・A・D弦の開放音がそのまま使えて弾きやすい。";
    if (highPosKeys.includes(normalizedRoot))
      return "ハイポジション中心のキー。7〜12フレット付近を使う練習になる。";
    return "中程度のフレット位置が中心。3〜8フレット付近で弾きやすいポジションが見つかる。";
  } else {
    if (openStringKeys.includes(normalizedRoot))
      return "開放弦が多く使えるキー。E・A・D・G弦の開放音が活躍する弾きやすいキー。";
    if (highPosKeys.includes(normalizedRoot))
      return "ハイポジション中心のキー。7〜12フレット付近を使う練習になる。";
    return "中程度のフレット位置が中心。3〜8フレット付近で弾きやすいポジションが見つかる。";
  }
}

function resolveChords(
  normalizedRoot: string,
  progression: ProgressionDef,
  diatonic: DiatonicEntry[],
): { chord: string; degree: string }[] {
  const rootIdx = NOTES.indexOf(normalizedRoot);
  if (rootIdx === -1) return [];

  if (progression.chordsFn) {
    const chords = progression.chordsFn(normalizedRoot);
    return chords.map((chord, i) => ({
      chord,
      degree: progression.degrees?.[i] ?? "",
    }));
  }

  return (progression.degreeIndices ?? []).map((di) => {
    const d = diatonic[di];
    const chordRoot = NOTES[(rootIdx + d.degree) % 12];
    return {
      chord: chordRoot + d.quality,
      degree: d.roman,
    };
  });
}

export type ProgressionItem = {
  name: string;
  degrees: string;
  chords: string;
  description: string;
};

export type ScaleInfo = {
  name: string;
  notes: string[];
  description: string;
};

export type KeyInfo = {
  key: string;
  isMinor: boolean;
  scaleNotes: string[];
  diatonicChords: { chord: string; roman: string }[];
  diatonicDescription: string;
  progressions: ProgressionItem[];
  bassPoint: string;
  scales: ScaleInfo[];
};

export function getKeyInfo(rawKey: string): KeyInfo {
  const isMinor = rawKey.endsWith("m");
  const root = isMinor ? rawKey.slice(0, -1) : rawKey;
  const normalizedRoot = NOTE_ALIASES[root] ?? root;
  const rootIdx = NOTES.indexOf(normalizedRoot);

  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const diatonic = isMinor ? MINOR_DIATONIC : MAJOR_DIATONIC;
  const progressions = isMinor ? MINOR_PROGRESSIONS : MAJOR_PROGRESSIONS;

  // スケール音
  const scaleNotes = rootIdx === -1 ? [] : scale.map((s) => NOTES[(rootIdx + s) % 12]);

  // ダイアトニックコード
  const diatonicChords = rootIdx === -1 ? [] : diatonic.map((d) => ({
    chord: NOTES[(rootIdx + d.degree) % 12] + d.quality,
    roman: d.roman,
  }));

  // ダイアトニックコードの説明文
  const diatonicDescription = `${rawKey}キーで自然に使えるコード一覧。この中のコードだけで曲が作れる。`;

  // コード進行
  const progressionItems: ProgressionItem[] = progressions.map((p) => {
    const resolved = resolveChords(normalizedRoot, p, diatonic);
    return {
      name: p.name,
      degrees: resolved.map((r) => r.degree).join(" → "),
      chords: resolved.map((r) => r.chord).join(" → "),
      description: p.description,
    };
  });

  // スケール一覧
  const PENTATONIC_MAJOR = [0, 2, 4, 7, 9];
  const PENTATONIC_MINOR = [0, 3, 5, 7, 10];
  const BLUES_MAJOR = [0, 2, 3, 4, 7, 9];
  const BLUES_MINOR = [0, 3, 5, 6, 7, 10];

  const scales: ScaleInfo[] = rootIdx === -1 ? [] : isMinor
    ? [
        {
          name: "ナチュラルマイナースケール",
          notes: MINOR_SCALE.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "暗い響き。マイナーキーの基本スケール。",
        },
        {
          name: "マイナーペンタトニック",
          notes: PENTATONIC_MINOR.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "マイナーから2・6度を抜いた5音。ロック・ブルースの基本。",
        },
        {
          name: "ブルーススケール",
          notes: BLUES_MINOR.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "マイナーペンタ + ♭5th。最も渋い響き。",
        },
      ]
    : [
        {
          name: "メジャースケール",
          notes: MAJOR_SCALE.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "明るい響き。メジャーキーの基本スケール。",
        },
        {
          name: "メジャーペンタトニック",
          notes: PENTATONIC_MAJOR.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "メジャーから4・7度を抜いた5音。明るくシンプル。",
        },
        {
          name: "ブルーススケール",
          notes: BLUES_MAJOR.map((s) => NOTES[(rootIdx + s) % 12]),
          description: "メジャーペンタ + ♭3rd。渋みが出る。",
        },
      ];

  return {
    key: rawKey,
    isMinor,
    scaleNotes,
    diatonicChords,
    diatonicDescription,
    progressions: progressionItems,
    bassPoint: getBassPoint(normalizedRoot, isMinor),
    scales,
  };
}
