// src/lib/bassPlayUtils.ts

import type { ChordToken, BassPlay } from "../types";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_ALIASES: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
};

function normalizeRoot(root: string): string {
  return NOTE_ALIASES[root] ?? root;
}

function rootIdx(root: string): number {
  return NOTES.indexOf(normalizeRoot(root));
}

function noteAt(idx: number): string {
  return NOTES[((idx % 12) + 12) % 12];
}

// 最短経路での半音距離（正=上、負=下）
function shortestDist(from: string, to: string): number {
  const f = rootIdx(from);
  const t = rootIdx(to);
  if (f < 0 || t < 0) return 0;
  const raw = (t - f + 12) % 12;
  return raw <= 6 ? raw : raw - 12;
}

// 2ルート間の経過音を列挙（端点除く）
function passingNotes(from: string, to: string): string[] {
  const f = rootIdx(from);
  const t = rootIdx(to);
  if (f < 0 || t < 0) return [];
  const raw = (t - f + 12) % 12;
  const step = raw <= 6 ? 1 : -1;
  const dist = raw <= 6 ? raw : 12 - raw;
  const notes: string[] = [];
  for (let i = 1; i < dist; i++) {
    notes.push(noteAt(f + step * i));
  }
  return notes;
}

// 目標ルートへの半音アプローチ音（半音下）
function approachNote(target: string): string {
  const idx = rootIdx(target);
  return idx >= 0 ? noteAt(idx - 1) : "";
}

/**
 * キー・カポ・チューニングオフセットから実音キーを計算
 * 例: key="G", capo=2, capoOffset=-1 → "A"（G+2-1=A）
 */
export function calcSoundingKey(
  key: string | undefined,
  capo: number | undefined,
  capoOffset: number | undefined
): string {
  if (!key) return "?";
  const total = (capo ?? 0) + (capoOffset ?? 0);
  if (total === 0) return key;
  const m = key.match(/^([A-G][#b]?)(.*)/);
  if (!m) return key;
  const normalized = NOTE_ALIASES[m[1]] ?? m[1];
  const idx = NOTES.indexOf(normalized);
  if (idx < 0) return key;
  return noteAt(idx + total) + m[2];
}

/**
 * コード列から遊びどころヒントを生成（1行分）
 * afterIndex = そのコードの"直後"の遷移に対応するヒント
 */
export function getLinePlays(
  chords: ChordToken[]
): Array<{ afterIndex: number; play: BassPlay }> {
  const result: Array<{ afterIndex: number; play: BassPlay }> = [];

  for (let i = 0; i < chords.length - 1; i++) {
    const curr = chords[i];
    const next = chords[i + 1];
    const currRoot = curr.root;
    const nextRoot = next.root;

    // 同ルート → オクターブ跳躍ヒント
    if (normalizeRoot(currRoot) === normalizeRoot(nextRoot)) {
      result.push({
        afterIndex: i,
        play: {
          type: "octave",
          label: "8ve",
          chordName: curr.name,
          nextChordName: next.name,
          noteExamples: [currRoot],
          advice: `${currRoot}のオクターブ跳躍でアクセントを`,
        },
      });
      continue;
    }

    const dist = Math.abs(shortestDist(currRoot, nextRoot));

    if (dist >= 3) {
      // 3半音以上離れている → 経過音ヒント
      const pn = passingNotes(currRoot, nextRoot).slice(0, 2);
      result.push({
        afterIndex: i,
        play: {
          type: "passing",
          label: "経過音",
          chordName: curr.name,
          nextChordName: next.name,
          noteExamples: pn,
          advice:
            pn.length > 0
              ? `${currRoot}→${nextRoot}を${pn.join("・")}で繋ごう`
              : `${currRoot}→${nextRoot}をステップで繋ごう`,
        },
      });
    } else {
      // 近接移動 → アプローチノートヒント
      const an = approachNote(nextRoot);
      result.push({
        afterIndex: i,
        play: {
          type: "approach",
          label: "♩",
          chordName: curr.name,
          nextChordName: next.name,
          noteExamples: an ? [an] : [],
          advice: an
            ? `${an}から${nextRoot}へ半音アプローチ`
            : `${nextRoot}への半音アプローチ`,
        },
      });
    }
  }

  return result;
}
