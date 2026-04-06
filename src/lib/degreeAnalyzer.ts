// src/lib/degreeAnalyzer.ts

import { Key, Chord } from "tonal";

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
      if (root) map[root] = degreeLabels[i];
    });
    return map;
  } catch {
    return {};
  }
}

// コード名から度数ラベルを取得
export function getDegreeLabel(
  chordName: string,
  degreeMap: Record<string, string>
): string {
  const rootMatch = chordName.match(/^([A-G][b#]?)/);
  if (!rootMatch) return "";
  const root = rootMatch[1];
  return degreeMap[root] ?? "?";
}
