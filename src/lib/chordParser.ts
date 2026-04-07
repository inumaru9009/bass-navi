// src/lib/chordParser.ts
// ⚠️ Write ツールでこのファイルを丸ごと上書きすること（Edit ツール不可）

import type { ChordToken, ChordDetail, BassPosition, NoteRole } from "../types";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_ALIASES: Record<string, string> = {
  "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#", "Cb": "B",
};

function normalizeNote(note: string): string {
  return NOTE_ALIASES[note] ?? note;
}

function normalizeChordStr(str: string): string {
  return str.replace(/♭/g, "b").replace(/♯/g, "#").trim();
}

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

const chordPattern = /^[A-G][b#]?(m|maj|min|aug|dim|sus|add)?[0-9]*(b5|#5|#9|b9|b13|#11)?(\/[A-G][b#]?)?$/;

export function isChordLine(line: string): boolean {
  const cleaned = normalizeChordStr(line.trim());
  if (!cleaned) return false;
  const tokens = cleaned.split(/\s+/);
  const chordCount = tokens.filter(t => chordPattern.test(t)).length;
  return chordCount > 0 && chordCount / tokens.length >= 0.5;
}

export function extractChords(line: string): ChordToken[] {
  const normalized = normalizeChordStr(line);
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return tokens
    .filter(t => chordPattern.test(t))
    .map((t, i) => ({ ...parseChord(t), position: i }));
}

// C=0基準の半音数
const NOTE_SEMITONES: Record<string, number> = {
  "C": 0, "C#": 1, "D": 2, "D#": 3, "E": 4, "F": 5,
  "F#": 6, "G": 7, "G#": 8, "A": 9, "A#": 10, "B": 11,
};

// C=0基準の各弦開放音
const OPEN_STRINGS: Record<1|2|3|4, number> = {
  4: 4,  // E弦
  3: 9,  // A弦
  2: 2,  // D弦
  1: 7,  // G弦
};

function noteToFret(stringNum: 1|2|3|4, noteSemitone: number): number {
  const open = OPEN_STRINGS[stringNum];
  return ((noteSemitone - open) % 12 + 12) % 12;
}

const QUALITY_INTERVALS: Record<string, { semitone: number; intervalName: string }[]> = {
  "":     [{ semitone: 0, intervalName: "ルート" }, { semitone: 4, intervalName: "3rd"   }, { semitone: 7,  intervalName: "5th"   }],
  "m":    [{ semitone: 0, intervalName: "ルート" }, { semitone: 3, intervalName: "♭3rd"  }, { semitone: 7,  intervalName: "5th"   }],
  "7":    [{ semitone: 0, intervalName: "ルート" }, { semitone: 4, intervalName: "3rd"   }, { semitone: 7,  intervalName: "5th"   }, { semitone: 10, intervalName: "♭7th"  }],
  "m7":   [{ semitone: 0, intervalName: "ルート" }, { semitone: 3, intervalName: "♭3rd"  }, { semitone: 7,  intervalName: "5th"   }, { semitone: 10, intervalName: "♭7th"  }],
  "maj7": [{ semitone: 0, intervalName: "ルート" }, { semitone: 4, intervalName: "3rd"   }, { semitone: 7,  intervalName: "5th"   }, { semitone: 11, intervalName: "maj7th"}],
  "dim":  [{ semitone: 0, intervalName: "ルート" }, { semitone: 3, intervalName: "♭3rd"  }, { semitone: 6,  intervalName: "♭5th"  }],
  "dim7": [{ semitone: 0, intervalName: "ルート" }, { semitone: 3, intervalName: "♭3rd"  }, { semitone: 6,  intervalName: "♭5th"  }, { semitone: 9,  intervalName: "6th"   }],
  "aug":  [{ semitone: 0, intervalName: "ルート" }, { semitone: 4, intervalName: "3rd"   }, { semitone: 8,  intervalName: "♭6th"  }],
  "m7b5": [{ semitone: 0, intervalName: "ルート" }, { semitone: 3, intervalName: "♭3rd"  }, { semitone: 6,  intervalName: "♭5th"  }, { semitone: 10, intervalName: "♭7th"  }],
  "sus4": [{ semitone: 0, intervalName: "ルート" }, { semitone: 5, intervalName: "4th"   }, { semitone: 7,  intervalName: "5th"   }],
  "sus2": [{ semitone: 0, intervalName: "ルート" }, { semitone: 2, intervalName: "2nd"   }, { semitone: 7,  intervalName: "5th"   }],
};

function resolveQualityKey(quality: string): string {
  if (!quality) return "";
  if (quality.includes("m7b5")) return "m7b5";
  if (quality.includes("dim7")) return "dim7";
  if (quality.includes("dim"))  return "dim";
  if (quality.includes("aug"))  return "aug";
  if (quality.includes("maj7") || quality.includes("M7")) return "maj7";
  if (quality.includes("m7"))   return "m7";
  if (quality.includes("m"))    return "m";
  if (quality.includes("7"))    return "7";
  if (quality.includes("sus4")) return "sus4";
  if (quality.includes("sus2")) return "sus2";
  return "";
}

function buildAllPositions(root: string, quality: string): BassPosition[] {
  const rootSemitone = NOTE_SEMITONES[root];
  if (rootSemitone === undefined) return [];

  const qualityKey = resolveQualityKey(quality);
  const intervals = QUALITY_INTERVALS[qualityKey] ?? QUALITY_INTERVALS[""];
  const toneSet = intervals.map(iv => ({
    semitone: (rootSemitone + iv.semitone) % 12,
    intervalName: iv.intervalName,
  }));

  const priority = ["ルート", "5th", "♭3rd", "3rd", "♭7th", "maj7th", "4th", "♭5th", "6th", "♭6th", "2nd"];
  const WINDOW = 5;
  const strings: Array<1|2|3|4> = [4, 3, 2, 1];
  const positions: BassPosition[] = [];
  let rootUsedCount = 0;

  for (const str of strings) {
    const open = OPEN_STRINGS[str];
    // 各弦でのルートフレット（0〜11f）をウィンドウ基準にする
    const rootFretOnStr = ((rootSemitone - open) % 12 + 12) % 12;

    // octave=0 の候補（低フレット優先）
    const candsLow: { semitone: number; intervalName: string; fret: number }[] = [];
    // octave=12 のフォールバック候補
    const candsHigh: { semitone: number; intervalName: string; fret: number }[] = [];
    for (const tone of toneSet) {
      const baseFret = ((tone.semitone - open) % 12 + 12) % 12;
      candsLow.push({ ...tone, fret: baseFret });
      if (baseFret + 12 <= 17) candsHigh.push({ ...tone, fret: baseFret + 12 });
    }

    type Cand = { semitone: number; intervalName: string; fret: number };
    // ルート使用済み2弦以上ならルート以外を優先
    const filterRoot = (arr: Cand[]): Cand[] =>
      rootUsedCount >= 2 ? arr.filter(c => c.intervalName !== "ルート") : arr;
    const filterWindow = (arr: Cand[]): Cand[] =>
      arr.filter(c => Math.abs(c.fret - rootFretOnStr) <= WINDOW);

    // 優先順位: octave=0 ウィンドウ内 → octave=12 ウィンドウ内 → octave=0 全体 → 全候補
    let pool = filterWindow(filterRoot(candsLow));
    if (pool.length === 0) pool = filterWindow(filterRoot(candsHigh));
    if (pool.length === 0) pool = filterRoot(candsLow);
    if (pool.length === 0) pool = [...candsLow, ...candsHigh];

    pool.sort((a, b) => {
      const pa = priority.indexOf(a.intervalName);
      const pb = priority.indexOf(b.intervalName);
      const pd = (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      if (pd !== 0) return pd;
      return Math.abs(a.fret - rootFretOnStr) - Math.abs(b.fret - rootFretOnStr);
    });

    const chosen = pool[0];
    if (chosen.intervalName === "ルート") rootUsedCount++;
    positions.push({ string: str, fret: chosen.fret, intervalName: chosen.intervalName });
  }

  // ルートが複数弦にある場合、最低フレットのルート1つだけ残す
  const rootPositions = positions.filter(p => p.intervalName === "ルート");
  if (rootPositions.length > 1) {
    const lowestFretRoot = rootPositions.sort((a, b) => a.fret - b.fret)[0];
    return positions.filter(p => p.intervalName !== "ルート" || p.fret === lowestFretRoot.fret);
  }

  return positions;
}

const CHORD_TONES: Record<string, number[]> = {
  "": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10],
  "maj7": [0, 4, 7, 11], "m7b5": [0, 3, 6, 10], "dim": [0, 3, 6], "aug": [0, 4, 8],
  "sus2": [0, 2, 7], "sus4": [0, 5, 7], "add9": [0, 4, 7, 14], "6": [0, 4, 7, 9],
  "m6": [0, 3, 7, 9], "9": [0, 4, 7, 10, 14], "m9": [0, 3, 7, 10, 14],
  "dim7": [0, 3, 6, 9], "maj9": [0, 4, 7, 11, 14], "7sus4": [0, 5, 7, 10],
  "sus": [0, 5, 7], "13": [0, 4, 7, 10, 14, 21], "maj13": [0, 4, 7, 11, 14, 21],
  "m11": [0, 3, 7, 10, 14, 17], "11": [0, 4, 7, 10, 14, 17], "add2": [0, 2, 4, 7],
  "madd9": [0, 3, 7, 14], "5": [0, 7], "aug7": [0, 4, 8, 10], "m13": [0, 3, 7, 10, 14, 21],
};

const INTERVAL_ROLES: Record<number, { name: string; role: string }> = {
  0:  { name: "ルート",  role: "土台。必ず弾く" },
  1:  { name: "♭2nd",  role: "緊張感のある音" },
  2:  { name: "2nd",    role: "浮遊感を加える音" },
  3:  { name: "♭3rd",  role: "暗さを決める音（マイナーの色）" },
  4:  { name: "3rd",    role: "明るさを決める音（メジャーの色）" },
  5:  { name: "4th",    role: "落ち着きを加える音" },
  6:  { name: "♭5th",  role: "不安定・緊張感のある音" },
  7:  { name: "5th",    role: "安定感を加える音" },
  8:  { name: "♭6th",  role: "哀愁を加える音" },
  9:  { name: "6th",    role: "明るい余韻を加える音" },
  10: { name: "♭7th",  role: "ブルージーな響きを加える音" },
  11: { name: "maj7th", role: "オシャレさ・浮遊感を加える音" },
  14: { name: "9th",    role: "広がりを加える音" },
};

function getSafeNotes(root: string, quality: string): string[] {
  const rootIdx = NOTES.indexOf(root);
  if (rootIdx === -1) return [root];
  const intervals = CHORD_TONES[quality] ?? CHORD_TONES[""] ?? [0, 4, 7];
  return intervals.map(i => NOTES[(rootIdx + i) % 12]);
}

export function getChordDetail(token: ChordToken): ChordDetail {
  const root = token.bass ?? token.root;
  const safeNotes = getSafeNotes(token.root, token.quality);
  const positions = buildAllPositions(root, token.quality);

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

  return { name: token.name, root: token.root, bass: token.bass, safeNotes, noteRoles, positions, advice };
}
