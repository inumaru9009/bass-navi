// src/components/ScoreView.tsx

import { useState } from "react";
import type { Song, ChordToken } from "../types";
import { getChordDetail } from "../lib/chordParser";
import ChordModal from "./ChordModal";
import SectionBlock from "./SectionBlock";

type Props = {
  song: Song;
  onBack: () => void;
};

export default function ScoreView({ song, onBack }: Props) {
  const [selectedChord, setSelectedChord] = useState<ChordToken | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);

  const currentSection = song.sections[currentSectionIdx];
  const nextSection = song.sections[currentSectionIdx + 1];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 上部固定バー */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 px-4 py-2 z-10">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="text-gray-400 text-sm">
            ← 戻る
          </button>
          <span className="text-white font-bold text-sm truncate max-w-xs">
            {song.title}
          </span>
          <span className="text-yellow-400 text-sm">
            {song.key ? `Key: ${song.key}` : ""}
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="bg-yellow-500 text-black px-2 py-0.5 rounded font-bold">
            {currentSection?.label ?? ""}
          </span>
          {currentSection?.warnings?.length > 0 && (
            <span className="bg-red-700 text-white px-2 py-0.5 rounded">
              ⚠ {currentSection.warnings[0].label}
            </span>
          )}
          {nextSection && (
            <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded">
              次→ {nextSection.label}
            </span>
          )}
        </div>
        {currentSection?.playGuide && (
          <p className="text-green-400 text-xs mt-1">
            🎸 {currentSection.playGuide}
          </p>
        )}
      </div>

      {/* 本文（上部バー分のパディング） */}
      <div className="pt-24 pb-24 px-4 overflow-y-auto">
        {song.sections.map((section, idx) => (
          <SectionBlock
            key={section.id}
            section={section}
            isActive={idx === currentSectionIdx}
            onChordTap={setSelectedChord}
            onVisible={() => setCurrentSectionIdx(idx)}
          />
        ))}
      </div>

      {/* コードモーダル */}
      {selectedChord && (
        <ChordModal
          detail={getChordDetail(selectedChord)}
          onClose={() => setSelectedChord(null)}
        />
      )}
    </div>
  );
}