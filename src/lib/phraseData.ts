// src/lib/phraseData.ts

export type PhraseDifficulty = "easy" | "mid";
export type PhraseCategory = "root" | "walking" | "chord-tone";

// タブ譜の1イベント: どの弦の何度数オフセットを弾くか
// string: 1=G, 2=D, 3=A, 4=E
// semitoneOffset: ルート音からの半音数（0=ルート, 3=♭3rd, 4=3rd, 7=5th, 10=♭7th ...）
// beat: 16分音符での位置（0始まり、1小節=16）
export type NoteEvent = {
  string: 1 | 2 | 3 | 4;
  semitoneOffset: number;
  beat: number;
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

// ── 音程計算ユーティリティ ────────────────────────────────

const NOTE_SEMITONES: Record<string, number> = {
  "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
  "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
};

const OPEN_STRINGS: Record<1 | 2 | 3 | 4, number> = {
  4: 4,  // E
  3: 9,  // A
  2: 2,  // D (14%12=2)
  1: 7,  // G (19%12=7)
};

function noteToFret(stringNum: 1 | 2 | 3 | 4, noteSemitone: number): number {
  const open = OPEN_STRINGS[stringNum];
  return ((noteSemitone - open) % 12 + 12) % 12;
}

const STRING_NAMES: Record<1 | 2 | 3 | 4, string> = {
  1: "G", 2: "D", 3: "A", 4: "E",
};

/**
 * パターンとルート音名からタブ譜文字列を生成する
 */
export function generateTab(pattern: NoteEvent[], rootNote: string, beats = 16): string {
  const rootSemitone = NOTE_SEMITONES[rootNote] ?? 9; // デフォルトA

  const usedStrings = [...new Set(pattern.map(e => e.string))].sort((a, b) => a - b);

  const lines = usedStrings.map(str => {
    const cells: string[] = Array(beats).fill("-");

    for (const ev of pattern) {
      if (ev.string !== str) continue;
      const noteSemitone = (rootSemitone + ev.semitoneOffset) % 12;
      const fret = noteToFret(str, noteSemitone);
      const fretStr = fret === 0 ? "0" : String(fret);
      cells[ev.beat] = fretStr;
      if (fretStr.length > 1 && ev.beat + 1 < beats) {
        cells[ev.beat + 1] = "";
      }
    }

    const label = STRING_NAMES[str];
    return `${label}|${cells.join("-")}|`;
  });

  return lines.join("\n");
}

// ── フレーズデータ ────────────────────────────────────────
// beat は16分音符位置（0=1拍目頭, 4=2拍目頭, 8=3拍目頭, 12=4拍目頭）

export const phraseData: Record<string, PhraseSet> = {
  // ── マイナー ──────────────────────────────────────────
  m: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 6 },
          { string: 3, semitoneOffset: 0, beat: 10 },
          { string: 3, semitoneOffset: 0, beat: 14 },
        ],
        beats: 16,
        tip: "ルート音だけを安定して刻む基本形。まずここから。",
      },
      {
        name: "オクターブ上下",
        difficulty: "easy",
        pattern: [
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 2, semitoneOffset: 0, beat: 8 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 2, semitoneOffset: 7,  beat: 6 },
          { string: 2, semitoneOffset: 6,  beat: 10 },
          { string: 2, semitoneOffset: 5,  beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 3, beat: 6 },
          { string: 2, semitoneOffset: 7, beat: 10 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 6 },
          { string: 3, semitoneOffset: 0, beat: 10 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 2,  beat: 6 },
          { string: 2, semitoneOffset: 7,  beat: 10 },
          { string: 2, semitoneOffset: 9,  beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 4, beat: 6 },
          { string: 2, semitoneOffset: 7, beat: 10 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 6 },
          { string: 3, semitoneOffset: 0, beat: 10 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 10, beat: 6 },
          { string: 3, semitoneOffset: 9,  beat: 10 },
          { string: 3, semitoneOffset: 8,  beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 4,  beat: 6 },
          { string: 2, semitoneOffset: 7,  beat: 10 },
          { string: 2, semitoneOffset: 10, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 6 },
          { string: 3, semitoneOffset: 0, beat: 10 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 2, semitoneOffset: 7, beat: 6 },
          { string: 2, semitoneOffset: 6, beat: 10 },
          { string: 2, semitoneOffset: 5, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 3,  beat: 6 },
          { string: 2, semitoneOffset: 7,  beat: 10 },
          { string: 2, semitoneOffset: 10, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 6 },
          { string: 3, semitoneOffset: 0, beat: 10 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 2, beat: 6 },
          { string: 2, semitoneOffset: 7, beat: 10 },
          { string: 2, semitoneOffset: 9, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 4,  beat: 6 },
          { string: 2, semitoneOffset: 7,  beat: 10 },
          { string: 2, semitoneOffset: 11, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0,  beat: 2 },
          { string: 3, semitoneOffset: 11, beat: 6 },
          { string: 3, semitoneOffset: 10, beat: 10 },
          { string: 3, semitoneOffset: 9,  beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 3, beat: 6 },
          { string: 2, semitoneOffset: 6, beat: 10 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 0, beat: 14 },
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
          { string: 3, semitoneOffset: 0, beat: 2 },
          { string: 3, semitoneOffset: 4, beat: 6 },
          { string: 2, semitoneOffset: 8, beat: 10 },
        ],
        beats: 16,
        tip: "augのコードトーン。#5の浮遊感を活かす。",
      },
    ],
  },
};

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

/**
 * コード名からルート音名を取得する
 * 例: 'Am' → 'A', 'C#m7' → 'C#', 'Bb7' → 'A#'
 */
export function getRootNote(chordName: string): string {
  const aliases: Record<string, string> = {
    "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#",
    "Ab": "G#", "Bb": "A#", "Cb": "B",
  };
  const match = chordName.match(/^([A-G][b#]?)/);
  if (!match) return "A";
  const raw = match[1];
  return aliases[raw] ?? raw;
}
