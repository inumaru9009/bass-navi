// src/lib/degreeAnalyzer.ts

import { Key, Chord } from "tonal";

// 異名同音（エンハーモニック）ペアの対応マップ
const ENHARMONIC_ALIASES: Record<string, string> = {
  "Cb": "B", "B#": "C",
  "Db": "C#", "C#": "Db",
  "Eb": "D#", "D#": "Eb",
  "Fb": "E", "E#": "F",
  "Gb": "F#", "F#": "Gb",
  "Ab": "G#", "G#": "Ab",
  "Bb": "A#", "A#": "Bb",
};

// ── ダイアトニック・クオリティ互換チェック ──────────────────

// quality 文字列を正規キーに変換（chordParser の resolveQualityKey と同等）
function resolveQuality(quality: string): string {
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
  if (quality.includes("6"))    return "6";
  if (quality.includes("add9") || quality.includes("add2")) return "add9";
  return "";
}

// 度数ラベルに対して期待されるクオリティのリスト
const DIATONIC_QUALITIES: Record<string, string[]> = {
  // メジャーキー
  "I":       ["", "maj7", "6", "add9", "sus4", "sus2"],
  "IIm":     ["m", "m7"],
  "IIIm":    ["m", "m7"],
  "IV":      ["", "maj7", "6", "add9"],
  "V":       ["", "7", "sus4"],
  "VIm":     ["m", "m7"],
  "VIIm♭5": ["m7b5", "dim"],
  // マイナーキー
  "Im":      ["m", "m7"],
  "IIm♭5":  ["m7b5", "dim"],
  "♭III":   ["", "maj7"],
  "IVm":     ["m", "m7"],
  "Vm":      ["m", "m7", "7"],
  "♭VI":    ["", "maj7"],
  "♭VII":   ["", "7"],
};

/**
 * 度数ラベルとクオリティが互換かどうか確認する。
 * 未知の度数ラベルは互換とみなす（フォールバック）。
 */
function isQualityCompatible(degreeLabel: string, quality: string): boolean {
  const allowed = DIATONIC_QUALITIES[degreeLabel];
  if (!allowed) return true;
  return allowed.includes(resolveQuality(quality));
}

// ── キーからダイアトニックコードの度数マップを生成 ──────────

export function getDegreeMap(keyStr: string): Record<string, string> {
  if (!keyStr) return {};

  const isMinor = keyStr.includes("m") && !keyStr.includes("maj");
  const tonic = keyStr.replace("m", "");

  try {
    const scale = isMinor ? Key.minorKey(tonic) : Key.majorKey(tonic);
    const chords = isMinor ? scale.natural.chords : scale.chords;
    const degreeLabels = isMinor
      ? ["Im", "IIm♭5", "♭III", "IVm", "Vm", "♭VI", "♭VII"]
      : ["I", "IIm", "IIIm", "IV", "V", "VIm", "VIIm♭5"];

    const map: Record<string, string> = {};
    chords.forEach((chord, i) => {
      const root = Chord.get(chord).tonic ?? "";
      if (!root) return;
      map[root] = degreeLabels[i];
      const alias = ENHARMONIC_ALIASES[root];
      if (alias) map[alias] = degreeLabels[i];
    });
    return map;
  } catch {
    return {};
  }
}

// ── 度数の機能分類 ────────────────────────────────────────

export type DegreeFunction = "tonic" | "dominant" | "subdominant" | "other" | "";

export function getDegreeFunction(degree: string): DegreeFunction {
  if (!degree) return "";
  if (/^(I|Im|IIIm|VIm)$/.test(degree)) return "tonic";
  if (/^(V|Vm|V7|VIIm|VIIm♭5)$/.test(degree)) return "dominant";
  if (/^(IV|IVm|IIm)$/.test(degree)) return "subdominant";
  return "other";
}

// ── コード名から度数ラベルを取得（クオリティ互換チェック付き）──

export function getDegreeLabel(
  chordName: string,
  degreeMap: Record<string, string>
): string {
  if (!Object.keys(degreeMap).length) return "";

  const rootMatch = chordName.match(/^([A-G][b#]?)(.*)/);
  if (!rootMatch) return "";
  const root = rootMatch[1];
  // スラッシュコードのベース音を除いたクオリティ部分を取り出す
  const rawQuality = (rootMatch[2] ?? "").replace(/\/.*$/, "");

  // 度数マップからルートを探す（正規表記 → 異名同音の順）
  let degree = degreeMap[root];
  if (degree === undefined) {
    const alias = ENHARMONIC_ALIASES[root];
    degree = alias ? (degreeMap[alias] ?? "") : "";
  }
  if (!degree) return "";

  // クオリティがそのディグリーに対してダイアトニックでなければノンダイアトニック扱い
  if (!isQualityCompatible(degree, rawQuality)) return "";

  return degree;
}
