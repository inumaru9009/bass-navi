// src/components/ScoreView.tsx

import { useState, useMemo } from "react";
import type { Song, ChordToken } from "../types";
import { getChordDetail } from "../lib/chordParser";
import { getDegreeMap, getDegreeLabel } from "../lib/degreeAnalyzer";
import ChordModal from "./ChordModal";
import KeyInfoSheet from "./KeyInfoSheet";
import SectionBlock from "./SectionBlock";
import Tooltip from "./Tooltip";

type Props = {
  song: Song;
  onBack: () => void;
};

export default function ScoreView({ song, onBack }: Props) {
  const [selectedChord, setSelectedChord] = useState<ChordToken | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [showKeyInfo, setShowKeyInfo] = useState(false);
  const degreeMap = useMemo(
    () => getDegreeMap(song.key ?? ""),
    [song.key]
  );

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
          <div className="flex items-center gap-2">
            {song.key ? (
              <button
                onClick={() => setShowKeyInfo(true)}
                className="text-yellow-400 text-sm underline decoration-dotted"
              >
                Key: {song.key}
              </button>
            ) : null}
          </div>
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
        <div className="flex gap-3 mt-1">
          <Tooltip position="bottom" content={<><p className="font-bold text-yellow-400 mb-1">トニック</p><p>曲の「ホーム」。安定・落ち着きを感じさせるコード。ルート音をしっかり弾いてOK。</p></>}>
            <span className="flex items-center gap-1 text-xs text-gray-400 cursor-default">
              <span className="w-3 h-3 rounded-sm bg-yellow-600 inline-block" />トニック
            </span>
          </Tooltip>
          <Tooltip position="bottom" content={<><p className="font-bold text-red-400 mb-1">ドミナント</p><p>緊張感を生むコード。次のトニックへ「解決」しようとする引力がある。</p></>}>
            <span className="flex items-center gap-1 text-xs text-gray-400 cursor-default">
              <span className="w-3 h-3 rounded-sm bg-red-700 inline-block" />ドミナント
            </span>
          </Tooltip>
          <Tooltip position="bottom" content={<><p className="font-bold text-blue-400 mb-1">サブドミナント</p><p>トニックとドミナントの中間。浮遊感・広がりを出す。</p></>}>
            <span className="flex items-center gap-1 text-xs text-gray-400 cursor-default">
              <span className="w-3 h-3 rounded-sm bg-blue-700 inline-block" />サブドミナント
            </span>
          </Tooltip>
          <Tooltip position="bottom" content="キーのスケール外のコード。転調や色付けに使われる。注意して聴いてみよう。">
            <span className="flex items-center gap-1 text-xs text-gray-400 cursor-default">
              <span className="w-3 h-3 rounded-sm bg-gray-700 inline-block" />その他
            </span>
          </Tooltip>
        </div>
      </div>

      {/* 本文（上部バー分のパディング） */}
      <div id="score-full" className="pt-24 pb-24 px-4 overflow-y-auto">
        {/* 曲解説 */}
        {song.songAnalysis && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-400 mb-1">📖 曲の分析</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              {song.songAnalysis}
            </p>
          </div>
        )}
        {song.sections.map((section, idx) => (
          <SectionBlock
            key={section.id}
            section={section}
            isActive={idx === currentSectionIdx}
            onChordTap={setSelectedChord}
            onVisible={() => setCurrentSectionIdx(idx)}
            degreeMap={degreeMap}
          />
        ))}
      </div>

      {/* コードモーダル */}
      {selectedChord && (
        <ChordModal
          detail={getChordDetail(selectedChord)}
          degree={getDegreeLabel(selectedChord.name, degreeMap)}
          onClose={() => setSelectedChord(null)}
        />
      )}

      {/* KeyInfoSheet */}
      {showKeyInfo && song.key && !selectedChord && (
        <KeyInfoSheet
          songKey={song.key}
          onClose={() => setShowKeyInfo(false)}
        />
      )}
    </div>
  );
}
