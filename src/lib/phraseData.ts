// src/lib/phraseData.ts

export type PhraseDifficulty = "easy" | "mid";
export type PhraseCategory = "root" | "walking" | "chord-tone";

export type NoteEvent = {
  string: 1 | 2 | 3 | 4; // 1=G弦, 2=D弦, 3=A弦, 4=E弦
  semitoneOffset: number; // ルートからの半音数（0=ルート, 3=♭3rd, 4=3rd, 7=5th...）
  beat: number;           // 16分音符の位置（1始まり: 1=1拍目頭, 5=2拍目頭, 9=3拍目頭, 13=4拍目頭）
};

export interface Phrase {
  name: string;
  difficulty: PhraseDifficulty;
  pattern: NoteEvent[];
  beats: number;
  tip: string;
}

export interface PhraseSet {
  root: Phrase[];
  walking: Phrase[];
  "chord-tone": Phrase[];
}

// ── 音程計算 ──────────────────────────────────────────────

const NOTE_SEMITONES: Record<string, number> = {
  "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
  "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
};

// C=0基準の各弦開放音
const OPEN_STRINGS: Record<1 | 2 | 3 | 4, number> = {
  4: 4,  // E弦
  3: 9,  // A弦
  2: 2,  // D弦 (14%12)
  1: 7,  // G弦 (19%12)
};

const STRING_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: "G", 2: "D", 3: "A", 4: "E",
};

function noteToFret(stringNum: 1 | 2 | 3 | 4, noteSemitone: number): number {
  const open = OPEN_STRINGS[stringNum];
  return ((noteSemitone - open) % 12 + 12) % 12;
}

/**
 * パターンとルート音名からタブ譜文字列を生成する
 * beat は1始まり（beat=1 が最初の16分音符）
 * 1beat = 1文字。2桁フレットは1の位のみ表示。
 */
export function generateTab(pattern: NoteEvent[], rootNote: string, beats = 16): string {
  const rootSemitone = NOTE_SEMITONES[rootNote] ?? 9;
  const usedStrings = [...new Set(pattern.map(e => e.string))].sort((a, b) => a - b);

  return usedStrings.map(str => {
    const eventMap = new Map<number, number>();
    for (const ev of pattern) {
      if (ev.string !== str) continue;
      const noteSemitone = (rootSemitone + ev.semitoneOffset) % 12;
      eventMap.set(ev.beat, noteToFret(str, noteSemitone));
    }

    let line = "";
    for (let i = 1; i <= beats; i++) {
      if (eventMap.has(i)) {
        line += String(eventMap.get(i)! % 10); // 2桁は1の位のみ
      } else {
        line += "-";
      }
    }

    return `${STRING_NAMES[str]}|${line}|`;
  }).join("\n");
}

/**
 * コード名からルート音名を取得する
 */
export function getRootNote(chordName: string): string {
  const aliases: Record<string, string> = {
    "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#",
    "Ab": "G#", "Bb": "A#", "Cb": "B",
  };
  const match = chordName.match(/^([A-G][b#]?)/);
  if (!match) return "A";
  return aliases[match[1]] ?? match[1];
}

/**
 * コード名からクオリティキーを取得する
 */
export function getQualityKey(chordName: string): string {
  if (/m7b5|dim7|dim/.test(chordName)) return "dim";
  if (/aug/.test(chordName)) return "aug";
  if (/mM7|m7/.test(chordName)) return "m7";
  if (/M7|maj7/.test(chordName)) return "M7";
  if (/m/.test(chordName)) return "m";
  if (/7/.test(chordName)) return "7";
  return "M";
}

// ── フレーズデータ ────────────────────────────────────────
// beat は1始まりの16分音符位置
// 1=1拍目頭, 5=2拍目頭, 9=3拍目頭, 13=4拍目頭

export const phraseData: Record<string, PhraseSet> = {
  // ── マイナー ──────────────────────────────────────────
  m: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 5 },
          { string: 3, semitoneOffset: 0, beat: 9 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "ルート音だけを安定して刻む基本形。まずここから。",
      },
      {
        name: "オクターブ上下",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 2, semitoneOffset: 0, beat: 7 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "同じルートをオクターブで行き来するパターン。",
      },
    ],
    walking: [
      {
        name: "クロマチックアプローチ",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 2, semitoneOffset: 7, beat: 5 },
          { string: 2, semitoneOffset: 6, beat: 9 },
          { string: 2, semitoneOffset: 5, beat: 13 },
        ],
        beats: 16,
        tip: "次のコードのルートへ半音で近づくウォーキングライン。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→5 アルペジオ",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 3, beat: 5 },
          { string: 2, semitoneOffset: 7, beat: 9 },
        ],
        beats: 16,
        tip: "コードトーン(1,♭3,5)を順番に弾くシンプルなアルペジオ。",
      },
    ],
  },

  // ── メジャー ──────────────────────────────────────────
  M: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 5 },
          { string: 3, semitoneOffset: 0, beat: 9 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "まずルートを安定して刻む練習。",
      },
    ],
    walking: [
      {
        name: "スケールウォーク",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 2, beat: 5 },
          { string: 2, semitoneOffset: 7, beat: 9 },
          { string: 2, semitoneOffset: 9, beat: 13 },
        ],
        beats: 16,
        tip: "メジャースケールの音を使ってスムーズに次へつなぐ。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5 アルペジオ",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 4, beat: 5 },
          { string: 2, semitoneOffset: 7, beat: 9 },
        ],
        beats: 16,
        tip: "メジャーコードのコードトーン(1,3,5)を順に弾く。",
      },
    ],
  },

  // ── ドミナント7th ─────────────────────────────────────
  "7": {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 5 },
          { string: 3, semitoneOffset: 0, beat: 9 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "ドミナント7thはルートを中心にシンプルに。",
      },
    ],
    walking: [
      {
        name: "♭7thを経由するライン",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0,  beat: 1 },
          { string: 3, semitoneOffset: 10, beat: 5 },
          { string: 3, semitoneOffset: 9,  beat: 9 },
          { string: 3, semitoneOffset: 8,  beat: 13 },
        ],
        beats: 16,
        tip: "♭7thを経由して次のコードへ半音でつなぐ。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5→♭7 アルペジオ",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0,  beat: 1 },
          { string: 3, semitoneOffset: 4,  beat: 5 },
          { string: 2, semitoneOffset: 7,  beat: 9 },
          { string: 2, semitoneOffset: 10, beat: 13 },
        ],
        beats: 16,
        tip: "4音のコードトーンをすべて使ったアルペジオ。",
      },
    ],
  },

  // ── マイナー7th ───────────────────────────────────────
  m7: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 5 },
          { string: 3, semitoneOffset: 0, beat: 9 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "マイナー7thはルートを落ち着かせて。",
      },
    ],
    walking: [
      {
        name: "クロマチックアプローチ",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 2, semitoneOffset: 7, beat: 5 },
          { string: 2, semitoneOffset: 6, beat: 9 },
          { string: 2, semitoneOffset: 5, beat: 13 },
        ],
        beats: 16,
        tip: "半音で近づくウォーキングライン。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→5→♭7",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0,  beat: 1 },
          { string: 3, semitoneOffset: 3,  beat: 5 },
          { string: 2, semitoneOffset: 7,  beat: 9 },
          { string: 2, semitoneOffset: 10, beat: 13 },
        ],
        beats: 16,
        tip: "m7のコードトーン4音を順に弾く。",
      },
    ],
  },

  // ── メジャー7th ───────────────────────────────────────
  M7: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 5 },
          { string: 3, semitoneOffset: 0, beat: 9 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "maj7はルートをゆったり持続させるのが効果的。",
      },
    ],
    walking: [
      {
        name: "スケールウォーク",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 2, beat: 5 },
          { string: 2, semitoneOffset: 7, beat: 9 },
          { string: 2, semitoneOffset: 9, beat: 13 },
        ],
        beats: 16,
        tip: "maj7スケールをなめらかに歩く。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5→M7",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0,  beat: 1 },
          { string: 3, semitoneOffset: 4,  beat: 5 },
          { string: 2, semitoneOffset: 7,  beat: 9 },
          { string: 2, semitoneOffset: 11, beat: 13 },
        ],
        beats: 16,
        tip: "メジャー7thのコードトーン。M7が美しい響き。",
      },
    ],
  },

  // ── dim ───────────────────────────────────────────────
  dim: {
    root: [
      {
        name: "ルートを短く",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "dimは不安定。ルートを短めに弾いて次へ。",
      },
    ],
    walking: [
      {
        name: "半音下降ライン",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0,  beat: 1 },
          { string: 3, semitoneOffset: 11, beat: 5 },
          { string: 3, semitoneOffset: 10, beat: 9 },
          { string: 3, semitoneOffset: 9,  beat: 13 },
        ],
        beats: 16,
        tip: "半音で下降して緊張感を演出する。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→♭5",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 3, beat: 5 },
          { string: 2, semitoneOffset: 6, beat: 9 },
        ],
        beats: 16,
        tip: "dimのコードトーン。♭5が特徴的な緊張感。",
      },
    ],
  },

  // ── aug ───────────────────────────────────────────────
  aug: {
    root: [
      {
        name: "ルートを短く",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 0, beat: 13 },
        ],
        beats: 16,
        tip: "augも不安定。ルートを短めに弾いて次へ。",
      },
    ],
    walking: [],
    "chord-tone": [
      {
        name: "1→3→#5",
        difficulty: "mid",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 1 },
          { string: 3, semitoneOffset: 4, beat: 5 },
          { string: 2, semitoneOffset: 8, beat: 9 },
        ],
        beats: 16,
        tip: "augのコードトーン。#5の浮遊感を活かす。",
      },
    ],
  },
};
