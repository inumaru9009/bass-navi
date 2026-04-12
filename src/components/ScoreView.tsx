// src/components/ScoreView.tsx

import { useState, useMemo } from "react";
import type { Song, ChordToken } from "../types";
import { getChordDetail } from "../lib/chordParser";
import { getDegreeMap, getDegreeLabel } from "../lib/degreeAnalyzer";
import { calcSoundingKey } from "../lib/bassPlayUtils";
import ChordModal from "./ChordModal";
import KeyInfoSheet from "./KeyInfoSheet";
import SectionBlock from "./SectionBlock";
import Tooltip from "./Tooltip";

const TUNING_OPTIONS = [
  { value:  2, label: "+1音上げ" },
  { value:  1, label: "+半音上げ" },
  { value:  0, label: "原曲" },
  { value: -1, label: "半音下げ" },
  { value: -2, label: "1音下げ" },
  { value: -3, label: "1.5音下げ" },
];

type Props = {
  song: Song;
  onBack: () => void;
  onCapoOffsetChange?: (offset: number) => void;
};

export default function ScoreView({ song, onBack, onCapoOffsetChange }: Props) {
  const [selectedChord, setSelectedChord] = useState<ChordToken | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [showKeyInfo, setShowKeyInfo] = useState(false);
  const [capoOffset, setCapoOffset] = useState(song.capoOffset ?? 0);
  const [showHints, setShowHints] = useState(false);

  function handleCapoOffsetChange(offset: number) {
    setCapoOffset(offset);
    onCapoOffsetChange?.(offset);
  }

  const soundingKey = calcSoundingKey(song.key, song.capo, capoOffset);
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

        {/* カポ・チューニングバー */}
        <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-800 flex-wrap text-xs">
          <span className="text-gray-500">
            カポ: <span className="text-gray-300 font-mono">{song.capo ? `${song.capo}` : "なし"}</span>
          </span>
          <span className="text-gray-700">|</span>
          <span className="text-gray-500">
            表記: <span className="text-yellow-400 font-mono">{song.key ?? "?"}</span>
          </span>
          <span className="text-gray-700">|</span>
          <span className="text-gray-500">
            実音: <span className="text-green-400 font-mono">{soundingKey}</span>
          </span>
          <span className="text-gray-700">|</span>
          <select
            value={capoOffset}
            onChange={e => handleCapoOffsetChange(Number(e.target.value))}
            className="bg-gray-800 text-gray-300 text-xs rounded px-1 py-0.5 border border-gray-700"
          >
            {TUNING_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowHints(h => !h)}
            className={`text-xs px-1.5 py-0.5 rounded border ${
              showHints
                ? "bg-purple-900/60 text-purple-300 border-purple-700/40"
                : "bg-gray-800 text-gray-500 border-gray-700"
            }`}
          >
            遊びどころ
          </button>
        </div>
      </div>

      {/* 本文（上部バー分のパディング） */}
      <div id="score-full" className="pt-36 pb-24 px-4 overflow-y-auto">
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
            showHints={showHints}
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
