// src/lib/scoreParser.ts

import type { Song, Section, Line, GeminiAnalysisResult } from "../types";
import { extractChords, isChordLine } from "./chordParser";

// 生テキストを行配列に変換
export function splitLines(rawText: string): string[] {
  return rawText.split("\n");
}

// 行をLineオブジェクトに変換
function parseLine(line: string): Line {
  const chordOnly = isChordLine(line);
  return {
    lyric: chordOnly ? "" : line,
    chords: chordOnly ? extractChords(line) : [],
    isChordOnly: chordOnly,
  };
}

// GeminiのセクションデータとrawTextを合わせてSongを構築
export function buildSong(
  rawText: string,
  geminiResult: GeminiAnalysisResult
): Song {
  const allLines = splitLines(rawText);

  const sections: Section[] = geminiResult.sections.map((gs, idx) => {
    const start = gs.startLine ?? 0;
    const end = gs.endLine ?? allLines.length - 1;
    const sectionLines = allLines.slice(start, end + 1);

    // コード行と歌詞行をペアにする
    const lines: Line[] = [];
    for (let i = 0; i < sectionLines.length; i++) {
      const current = sectionLines[i];
      const next = sectionLines[i + 1];

      if (isChordLine(current)) {
        // コード行の次が歌詞行なら合成
        if (next && !isChordLine(next)) {
          lines.push({
            lyric: next,
            chords: extractChords(current),
            isChordOnly: false,
          });
          i++; // 歌詞行をスキップ
        } else {
          lines.push({
            lyric: "",
            chords: extractChords(current),
            isChordOnly: true,
          });
        }
      } else {
        lines.push(parseLine(current));
      }
    }

    return {
      id: `section-${idx}`,
      type: gs.type,
      label: gs.label,
      lines,
      playGuide: gs.playGuide,
      warnings: gs.warnings ?? [],
    };
  });

  return {
    title: geminiResult.title,
    artist: geminiResult.artist,
    key: geminiResult.key,
    capo: geminiResult.capo,
    sections,
    rawText,
  };
}