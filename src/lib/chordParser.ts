// src/lib/chordParser.ts

import type { ChordToken, ChordDetail, BassPosition, NoteRole } from "../types";

// 音名の定義
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_ALIASES: Record<string, string> = {
  "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#", "Cb": "B",
};

function normalizeNote(note: string): string {
  return NOTE_ALIASES[note] ?? note;
}

// ♭/♯をASCIIに正規化
function normalizeChordStr(str: string): string {
  return str.replace(/♭/g, "b").replace(/♯/g, "#").trim();
}

// コード文字列をパース
export function parseChord(chordStr: string): ChordToken {
  const normalized = normalizeChordStr(chordStr);
  const slashMatch = normalized.match(/^(.+)\/([A-G][b#]?)$/);
  let name = normalized;
  let bass: string | undefined;

  if (slashMatch) {
    name = slashMatch[1];
    bass = normalizeNote(slashMatch[2]);
  }

  const rootMatch = name.match(/^([A-G][b#]?)(.*)/);
  if (!rootMatch) {
    return { name: chordStr, root: chordStr, quality: "", position: 0 };
  }

  const root = normalizeNote(rootMatch[1]);
  const quality = rootMatch[2] ?? "";

  return { name: chordStr, root, bass, quality, position: 0 };
}

// コード判定パターン（複合修飾子に対応）
const chordPattern = /^[A-G][b#]?(m|maj|min|aug|dim|sus|add)?[0-9]*(b5|#5|#9|b9|b13|#11)?(\/[A-G][b#]?)?$/;

// コード行かどうか判定
export function isChordLine(line: string): boolean {
  const cleaned = normalizeChordStr(line.trim());
  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/);
  const chordCount = tokens.filter(t => chordPattern.test(t)).length;
  return chordCount > 0 && chordCount / tokens.length >= 0.5;
}

// コード行からChordTokenの配列を抽出
export function extractChords(line: string): ChordToken[] {
  const normalized = normalizeChordStr(line);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens
    .filter(t => chordPattern.test(t))
    .map((t, i) => ({ ...parseChord(t), position: i }));
}

// ベースポジション辞書（4フレット以内）
const BASS_POSITIONS: Record<string, BassPosition[]> = {
  "C":  [{ string: 3, fret: 3 }, { string: 2, fret: 10 }],
  "C#": [{ string: 3, fret: 4 }, { string: 2, fret: 11 }],
  "D":  [{ string: 3, fret: 5 }, { string: 2, fret: 0 }],
  "D#": [{ string: 3, fret: 6 }, { string: 2, fret: 1 }],
  "E":  [{ string: 3, fret: 7 }, { string: 2, fret: 2 }, { string: 4, fret: 0 }],
  "F":  [{ string: 3, fret: 8 }, { string: 2, fret: 3 }, { string: 4, fret: 1 }],
  "F#": [{ string: 3, fret: 9 }, { string: 2, fret: 4 }, { string: 4, fret: 2 }],
  "G":  [{ string: 3, fret: 10 }, { string: 2, fret: 5 }, { string: 4, fret: 3 }],
  "G#": [{ string: 3, fret: 11 }, { string: 2, fret: 6 }, { string: 4, fret: 4 }],
  "A":  [{ string: 3, fret: 0 }, { string: 2, fret: 7 }],
  "A#": [{ string: 3, fret: 1 }, { string: 2, fret: 8 }],
  "B":  [{ string: 3, fret: 2 }, { string: 2, fret: 9 }],
};

// 構成音の定義
const CHORD_TONES: Record<string, number[]> = {
  "":      [0, 4, 7],
  "m":     [0, 3, 7],
  "7":     [0, 4, 7, 10],
  "m7":    [0, 3, 7, 10],
  "maj7":  [0, 4, 7, 11],
  "m7b5":  [0, 3, 6, 10],
  "dim":   [0, 3, 6],
  "aug":   [0, 4, 8],
  "sus2":  [0, 2, 7],
  "sus4":  [0, 5, 7],
  "add9":  [0, 4, 7, 14],
  "6":     [0, 4, 7, 9],
  "m6":    [0, 3, 7, 9],
  "9":     [0, 4, 7, 10, 14],
  "m9":    [0, 3, 7, 10, 14],
  "dim7":  [0, 3, 6, 9],
  "maj9":  [0, 4, 7, 11, 14],
  "7sus4": [0, 5, 7, 10],
  "sus":   [0, 5, 7],
  "13":    [0, 4, 7, 10, 14, 21],
  "maj13": [0, 4, 7, 11, 14, 21],
  "m11":   [0, 3, 7, 10, 14, 17],
  "11":    [0, 4, 7, 10, 14, 17],
  "add2":  [0, 2, 4, 7],
  "madd9": [0, 3, 7, 14],
  "5":     [0, 7],
  "aug7":  [0, 4, 8, 10],
  "m13":   [0, 3, 7, 10, 14, 21],
};

const INTERVAL_ROLES: Record<number, { name: string; role: string }> = {
  0:  { name: "ルート",  role: "土台。必ず弾く" },
  1:  { name: "♭2nd",   role: "緊張感のある音" },
  2:  { name: "2nd",     role: "浮遊感を加える音" },
  3:  { name: "♭3rd",   role: "暗さを決める音（マイナーの色）" },
  4:  { name: "3rd",     role: "明るさを決める音（メジャーの色）" },
  5:  { name: "4th",     role: "落ち着きを加える音" },
  6:  { name: "♭5th",   role: "不安定・緊張感のある音" },
  7:  { name: "5th",     role: "安定感を加える音" },
  8:  { name: "♭6th",   role: "哀愁を加える音" },
  9:  { name: "6th",     role: "明るい余韻を加える音" },
  10: { name: "♭7th",   role: "ブルージーな響きを加える音" },
  11: { name: "maj7th",  role: "オシャレさ・浮遊感を加える音" },
  14: { name: "9th",     role: "広がりを加える音" },
};

// コードクオリティ別の相対ポジションテンプレート
// fretOffset: ルートフレットからの相対フレット数（A弦ルート基準）
type RelPos = { string: 1|2|3|4; fretOffset: number; intervalName: string };

const SHAPE_TEMPLATES: Record<string, RelPos[]> = {
  "": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 2,  intervalName: "5th"   },
    { string: 2, fretOffset: -3, intervalName: "3rd"   },
    { string: 1, fretOffset: 2,  intervalName: "ルート" },
  ],
  "m": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 2,  intervalName: "5th"   },
    { string: 2, fretOffset: -2, intervalName: "♭3rd"  },
    { string: 1, fretOffset: 5,  intervalName: "♭3rd"  },
  ],
  "7": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 2,  intervalName: "5th"   },
    { string: 2, fretOffset: -3, intervalName: "3rd"   },
    { string: 1, fretOffset: 0,  intervalName: "♭7th"  },
  ],
  "m7": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 2,  intervalName: "5th"   },
    { string: 2, fretOffset: -4, intervalName: "♭3rd"  },
    { string: 1, fretOffset: 0,  intervalName: "♭7th"  },
  ],
  "maj7": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 2,  intervalName: "5th"   },
    { string: 2, fretOffset: -3, intervalName: "3rd"   },
    { string: 1, fretOffset: 1,  intervalName: "maj7th"},
  ],
  "dim": [
    { string: 3, fretOffset: 0,  intervalName: "ルート" },
    { string: 2, fretOffset: 1,  intervalName: "♭5th"  },
    { string: 2, fretOffset: -4, intervalName: "♭3rd"  },
  ],
};

/**
 * ルートノートとクオリティから、全構成音ポジションを生成する
 */
function buildAllPositions(root: string, quality: string): BassPosition[] {
  const rootCandidates = BASS_POSITIONS[root] ?? [];
  const rootPos = rootCandidates.find(p => p.string === 3) ?? rootCandidates[0];
  if (!rootPos) return [];

  const template = SHAPE_TEMPLATES[quality] ?? SHAPE_TEMPLATES[""];

  return template
    .map(t => ({
      string: t.string,
      fret: rootPos.fret + t.fretOffset,
      intervalName: t.intervalName,
    }))
    .filter(p => p.fret >= 0 && p.fret <= 24) as BassPosition[];
}

function getSafeNotes(root: string, quality: string): string[] {
  const rootIdx = NOTES.indexOf(root);
  if (rootIdx === -1) return [root];
  const intervals = CHORD_TONES[quality] ?? CHORD_TONES[""] ?? [0, 4, 7];
  return intervals.map(i => NOTES[(rootIdx + i) % 12]);
}

// コード詳細を生成
export function getChordDetail(token: ChordToken): ChordDetail {
  const root = token.bass ?? token.root;
  const safeNotes = getSafeNotes(token.root, token.quality);
  const positions = buildAllPositions(token.root, token.quality);

  const rootIdx = NOTES.indexOf(token.root);
  const intervals = CHORD_TONES[token.quality] ?? CHORD_TONES[""] ?? [0, 4, 7];
  const noteRoles: NoteRole[] = rootIdx === -1 ? [] : intervals.map(i => ({
    note: NOTES[(rootIdx + i) % 12],
    intervalName: INTERVAL_ROLES[i]?.name ?? `${i}th`,
    role: INTERVAL_ROLES[i]?.role ?? "",
  }));

  let advice = "ルート中心でOK";
  if (token.bass) {
    advice = `ベース音は${token.bass}を弾く`;
  } else if (token.quality.includes("dim")) {
    advice = "不安定。ルートを短く";
  } else if (token.quality.includes("aug")) {
    advice = "不安定。ルートを短く";
  } else if (token.quality === "m7b5") {
    advice = "ルートを短く、次へ";
  }

  return {
    name: token.name,
    root: token.root,
    bass: token.bass,
    safeNotes,
    noteRoles,
    positions,
    advice,
  };
}