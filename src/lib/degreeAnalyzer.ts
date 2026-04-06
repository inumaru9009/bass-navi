// src/lib/degreeAnalyzer.ts

import { Key, Chord, Note } from "tonal";

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

// キーからダイアトニックコードの度数マップを生成
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
      // 正規表記でマップに登録
      map[root] = degreeLabels[i];
      // 異名同音も同じ度数で登録（Bb/A# 両方から引けるようにする）
      const alias = ENHARMONIC_ALIASES[root];
      if (alias) map[alias] = degreeLabels[i];
    });
    return map;
  } catch {
    return {};
  }
}

// 度数の機能分類
export type DegreeFunction = "tonic" | "dominant" | "subdominant" | "other" | "";

export function getDegreeFunction(degree: string): DegreeFunction {
  if (!degree) return "";
  if (/^(I|Im|IIIm|VIm)$/.test(degree)) return "tonic";
  if (/^(V|Vm|V7|VIIm|VIIm♭5)$/.test(degree)) return "dominant";
  if (/^(IV|IVm|IIm)$/.test(degree)) return "subdominant";
  return "other";
}

// コード名から度数ラベルを取得
export function getDegreeLabel(
  chordName: string,
  degreeMap: Record<string, string>
): string {
  const rootMatch = chordName.match(/^([A-G][b#]?)/);
  if (!rootMatch) return "";
  const root = rootMatch[1];
  // 正規表記で検索、なければ異名同音で再検索
  if (degreeMap[root] !== undefined) return degreeMap[root];
  const alias = ENHARMONIC_ALIASES[root];
  return alias ? (degreeMap[alias] ?? "") : "";
}
