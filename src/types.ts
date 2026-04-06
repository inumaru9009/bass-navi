// src/types.ts

export type SectionType =
  | "intro"
  | "verse"
  | "b_melo"
  | "chorus"
  | "bridge"
  | "interlude"
  | "outro"
  | "unknown";

export type WarningType =
  | "modulation"
  | "non_diatonic"
  | "slash"
  | "break"
  | "ending"
  | "section_change";

export type ChordToken = {
  name: string;
  root: string;
  bass?: string;
  quality: string;
  position: number;
};

export type Warning = {
  type: WarningType;
  label: string;
};

export type Line = {
  lyric: string;
  chords: ChordToken[];
  isChordOnly: boolean;
};

export type Section = {
  id: string;
  type: SectionType;
  label: string;
  lines: Line[];
  playGuide: string;
  warnings: Warning[];
};

export type Song = {
  title: string;
  artist?: string;
  key?: string;
  capo?: number;
  sections: Section[];
  rawText: string;
};

export type BassPosition = {
  string: 1 | 2 | 3 | 4;
  fret: number;
  finger?: number;
  intervalName?: string;  // 例: "ルート", "5th", "♭3rd" など
};

export type NoteRole = {
  note: string;
  intervalName: string;
  role: string;
};

export type ChordDetail = {
  name: string;
  root: string;
  bass?: string;
  safeNotes: string[];
  noteRoles: NoteRole[];
  positions: BassPosition[];
  advice: string;
};

// Gemini APIのレスポンス型
export type GeminiSection = {
  type: SectionType;
  label: string;
  playGuide: string;
  warnings: Warning[];
  startLine: number;
  endLine: number;
};

export type GeminiAnalysisResult = {
  title: string;
  artist?: string;
  key: string;
  capo?: number;
  sections: GeminiSection[];
};