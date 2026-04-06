// src/lib/phraseData.ts

export type PhraseDifficulty = "easy" | "mid";
export type PhraseCategory = "root" | "walking" | "chord-tone";

export interface Phrase {
  name: string;
  difficulty: PhraseDifficulty;
  tab: string;
  tip: string;
}

export interface PhraseSet {
  root: Phrase[];
  walking: Phrase[];
  "chord-tone": Phrase[];
}

export const phraseData: Record<string, PhraseSet> = {
  m: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        tab: "A|--5---5---5---5-|\nE|----------------|",
        tip: "ルート音だけを安定して刻む基本形。まずここから。",
      },
      {
        name: "オクターブ上下",
        difficulty: "easy",
        tab: "A|--5---------5---|\nD|------7---------|",
        tip: "同じルートをオクターブで行き来するパターン。",
      },
    ],
    walking: [
      {
        name: "クロマチックアプローチ",
        difficulty: "mid",
        tab: "A|--5-------------|\nD|----7---6---5---|",
        tip: "次のコードのルートへ半音で近づくウォーキングライン。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→5 アルペジオ",
        difficulty: "mid",
        tab: "A|--5---8---------|\nD|------7---------|",
        tip: "コードトーン(1,♭3,5)を順番に弾くシンプルなアルペジオ。",
      },
    ],
  },
  M: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        tab: "A|--5---5---5---5-|\nE|----------------|",
        tip: "まずルートを安定して刻む練習。",
      },
    ],
    walking: [
      {
        name: "スケールウォーク",
        difficulty: "mid",
        tab: "A|--5---7---------|\nD|--------7---9---|",
        tip: "メジャースケールの音を使ってスムーズに次へつなぐ。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5 アルペジオ",
        difficulty: "mid",
        tab: "A|--5---9---------|\nD|------7---------|",
        tip: "メジャーコードのコードトーン(1,3,5)を順に弾く。",
      },
    ],
  },
  "7": {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        tab: "A|--5---5---5---5-|\nE|----------------|",
        tip: "ドミナント7thはルートを中心にシンプルに。",
      },
    ],
    walking: [
      {
        name: "♭7thを経由するライン",
        difficulty: "mid",
        tab: "A|--5---4---3---2-|\nE|----------------|",
        tip: "♭7thを経由して次のコードへ半音でつなぐ。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5→♭7 アルペジオ",
        difficulty: "mid",
        tab: "A|--5---9---------|\nD|------7---8-----|",
        tip: "4音のコードトーンをすべて使ったアルペジオ。",
      },
    ],
  },
  m7: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        tab: "A|--5---5---5---5-|\nE|----------------|",
        tip: "マイナー7thはルートを落ち着かせて。",
      },
    ],
    walking: [
      {
        name: "クロマチックアプローチ",
        difficulty: "mid",
        tab: "A|--5-------------|\nD|----7---6---5---|",
        tip: "半音で近づくウォーキングライン。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→5→♭7",
        difficulty: "mid",
        tab: "A|--5---8---------|\nD|------7---8-----|",
        tip: "m7のコードトーン4音を順に弾く。",
      },
    ],
  },
  M7: {
    root: [
      {
        name: "シンプルルート",
        difficulty: "easy",
        tab: "A|--5---5---5---5-|\nE|----------------|",
        tip: "maj7はルートをゆったり持続させるのが効果的。",
      },
    ],
    walking: [
      {
        name: "スケールウォーク",
        difficulty: "mid",
        tab: "A|--5---7---------|\nD|--------7---9---|",
        tip: "maj7スケールをなめらかに歩く。",
      },
    ],
    "chord-tone": [
      {
        name: "1→3→5→M7",
        difficulty: "mid",
        tab: "A|--5---9---------|\nD|------7---9-----|",
        tip: "メジャー7thのコードトーン。M7が美しい響き。",
      },
    ],
  },
  dim: {
    root: [
      {
        name: "ルートを短く",
        difficulty: "easy",
        tab: "A|--5-----------5-|\nE|----------------|",
        tip: "dimは不安定。ルートを短めに弾いて次へ。",
      },
    ],
    walking: [
      {
        name: "半音下降ライン",
        difficulty: "mid",
        tab: "A|--5---4---3---2-|\nE|----------------|",
        tip: "半音で下降して緊張感を演出する。",
      },
    ],
    "chord-tone": [
      {
        name: "1→♭3→♭5",
        difficulty: "mid",
        tab: "A|--5---8---------|\nD|------6---------|",
        tip: "dimのコードトーン。♭5が特徴的な緊張感。",
      },
    ],
  },
  aug: {
    root: [
      {
        name: "ルートを短く",
        difficulty: "easy",
        tab: "A|--5-----------5-|\nE|----------------|",
        tip: "augも不安定。ルートを短めに弾いて次へ。",
      },
    ],
    walking: [],
    "chord-tone": [
      {
        name: "1→3→#5",
        difficulty: "mid",
        tab: "A|--5---9---------|\nD|------8---------|",
        tip: "augのコードトーン。#5の浮遊感を活かす。",
      },
    ],
  },
};

/**
 * コード名からクオリティキーを取得する
 * 例: 'Am' → 'm', 'C' → 'M', 'G7' → '7', 'Cmaj7' → 'M7'
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
