// src/components/KeyInfoSheet.tsx

import { useState } from "react";
import { getKeyInfo } from "../lib/keyData";

type Props = {
  songKey: string;
  onClose: () => void;
};

export default function KeyInfoSheet({ songKey, onClose }: Props) {
  const [showAllProgressions, setShowAllProgressions] = useState(false);
  const [showScales, setShowScales] = useState(false);

  const info = getKeyInfo(songKey);
  const visibleProgressions = showAllProgressions
    ? info.progressions
    : info.progressions.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-20 bg-black/60"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-950 rounded-t-2xl overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-9 h-1 bg-gray-700 rounded-full mx-auto mt-2.5 mb-1" />

        <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 20px)" }}>

          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1 border-b border-gray-800">
            <span className="text-xl font-bold text-white">
              Key: {songKey} とは？
            </span>
            <button onClick={onClose} className="text-gray-600 text-lg leading-none">
              ×
            </button>
          </div>

          {/* スケール音 */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
            <p className="text-[10px] text-gray-500 tracking-widest mb-2">
              {info.isMinor ? "ナチュラルマイナースケール" : "メジャースケール"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {info.scaleNotes.map((note, i) => (
                <span
                  key={i}
                  className={`text-xs px-2.5 py-1 rounded-full border ${
                    i === 0
                      ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/40"
                      : "bg-gray-800 text-gray-400 border-gray-700"
                  }`}
                >
                  {note}
                </span>
              ))}
            </div>
          </div>

          {/* ダイアトニックコード */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
            <p className="text-[10px] text-gray-500 tracking-widest mb-1">ダイアトニックコード</p>
            <p className="text-xs text-gray-500 mb-2">{info.diatonicDescription}</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {info.diatonicChords.map((d, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center flex-shrink-0 px-2.5 py-1.5 rounded-lg border ${
                    i === 0
                      ? "bg-yellow-900/20 border-yellow-800/40"
                      : "bg-gray-800 border-gray-700"
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${i === 0 ? "text-yellow-400" : "text-gray-300"}`}>
                    {d.chord}
                  </span>
                  <span className="text-[9px] text-gray-600 mt-0.5">{d.roman}</span>
                </div>
              ))}
            </div>
          </div>

          {/* よくあるコード進行 */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
            <p className="text-[10px] text-gray-500 tracking-widest mb-3">よくあるコード進行</p>
            <div className="flex flex-col gap-3">
              {visibleProgressions.map((prog, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3">
                  <p className="text-sm font-bold text-white mb-1">{prog.name}</p>
                  <p className="text-xs font-mono text-yellow-400 mb-1">{prog.chords}</p>
                  <p className="text-[10px] text-gray-500 mb-1">{prog.degrees}</p>
                  <p className="text-xs text-gray-400">{prog.description}</p>
                </div>
              ))}
            </div>
            {!showAllProgressions && info.progressions.length > 3 && (
              <button
                onClick={() => setShowAllProgressions(true)}
                className="mt-3 w-full text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-lg py-2 hover:bg-gray-700 transition-colors"
              >
                すべて見る（{info.progressions.length}件）
              </button>
            )}
          </div>

          {/* スケール一覧 */}
          <div className="px-4 pt-4 pb-3 border-b border-gray-800">
            <button
              onClick={() => setShowScales(!showScales)}
              className="flex items-center justify-between w-full text-[10px] text-gray-500 tracking-widest mb-2"
            >
              <span>スケール一覧</span>
              <span>{showScales ? "∨" : "›"}</span>
            </button>
            {showScales && (
              <div className="flex flex-col gap-3">
                {info.scales.map((s) => (
                  <div key={s.name} className="bg-gray-800 rounded-lg p-3">
                    <p className="text-sm font-bold text-white mb-1">{s.name}</p>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {s.notes.map((note) => (
                        <span
                          key={note}
                          className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">{s.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ベースのポイント */}
          <div className="px-4 pt-4 pb-6">
            <p className="text-[10px] text-gray-500 tracking-widest mb-2">ベースのポイント</p>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-green-400">🎸 {info.bassPoint}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
