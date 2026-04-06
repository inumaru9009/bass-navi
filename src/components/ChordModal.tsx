// src/components/ChordModal.tsx

import { useState } from "react";
import type { ChordDetail, BassPosition, NoteRole } from "../types";
import { getDegreeFunction } from "../lib/degreeAnalyzer";
import PhraseScreen from "./PhraseScreen";

const INTERVAL_SHORT: Record<string, string> = {
  "ルート":  "R",
  "3rd":     "3",
  "♭3rd":   "♭3",
  "5th":     "5",
  "♭5th":   "♭5",
  "7th":     "7",
  "maj7th":  "M7",
  "♭7th":   "♭7",
  "9th":     "9",
  "4th":     "4",
  "6th":     "6",
  "2nd":     "2",
};

type Props = {
  detail: ChordDetail;
  degree: string;
  onClose: () => void;
};

// 弦の名前
const STRING_NAMES: Record<number, string> = {
  1: "G",
  2: "D",
  3: "A",
  4: "E",
};

function PositionDiagram({
  positions,
  noteRoles,
}: {
  positions: BassPosition[];
  noteRoles: NoteRole[];
}) {
  const frets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const usedFrets = positions.map(p => p.fret);
  const minFret = Math.max(0, Math.min(...usedFrets) - 1);
  const displayFrets = frets.slice(minFret, minFret + 5);

  return (
    <div className="mt-1">
      <div className="flex text-xs text-gray-600 mb-1">
        <span className="w-6" />
        {displayFrets.map(f => (
          <span key={f} className="w-8 text-center">
            {f === 0 ? "開" : f}
          </span>
        ))}
      </div>
      {[1, 2, 3, 4].map(str => (
        <div key={str} className="flex items-center mb-1">
          <span className="w-6 text-xs text-gray-600">
            {STRING_NAMES[str]}
          </span>
          {displayFrets.map(f => {
            const hitIndex = positions.findIndex(
              p => p.string === str && p.fret === f
            );
            const hit = hitIndex !== -1;
            // BASS_POSITIONSはルート音のポジションのみ格納しているため、
            // すべてのポジションはnoteRoles[0]（ルート）に対応する
            const role = hit ? noteRoles[0] : undefined;
            const label = role ? (INTERVAL_SHORT[role.intervalName] ?? "R") : "R";
            return (
              <div
                key={f}
                className="w-8 h-6 border-b border-gray-700 flex items-center justify-center"
              >
                {hit ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold bg-yellow-400">
                    {label}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function ChordModal({ detail, degree, onClose }: Props) {
  const [showPhraseScreen, setShowPhraseScreen] = useState(false);

  // 度数機能からロールラベルとスタイルを決定
  const degreeFunc = getDegreeFunction(degree);
  const roleLabel =
    degreeFunc === "tonic" ? "トニック" :
    degreeFunc === "dominant" ? "ドミナント" :
    degreeFunc === "subdominant" ? "サブドミナント" :
    degree ? "ノンダイアトニック" : "";
  const roleStyle =
    degreeFunc === "tonic"
      ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/40" :
    degreeFunc === "dominant"
      ? "bg-red-900/20 text-red-400 border-red-800/40" :
    degreeFunc === "subdominant"
      ? "bg-blue-900/20 text-blue-400 border-blue-800/40" :
    roleLabel
      ? "bg-gray-800/60 text-gray-500 border-gray-700/40"
      : "";

  // ボトムシート共通ラッパー
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <div
      className="fixed inset-0 z-20 bg-black/60"
      onClick={onClose}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-950 rounded-t-2xl overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="w-9 h-1 bg-gray-700 rounded-full mx-auto mt-2.5 mb-1" />
        {children}
      </div>
    </div>
  );

  // フレーズ画面
  if (showPhraseScreen) {
    return (
      <Wrapper>
        <div style={{ height: "calc(85vh - 20px)" }}>
          <PhraseScreen
            chordName={detail.name}
            onBack={() => setShowPhraseScreen(false)}
          />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 20px)" }}>
        {/* ヘッダー */}
        <div className="flex items-baseline justify-between px-4 pb-3 pt-1 border-b border-gray-800">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl font-bold font-mono text-white">
              {detail.name}
            </span>
            {roleLabel && (
              <span className={`text-xs px-2 py-0.5 rounded-full border ${roleStyle}`}>
                {roleLabel}
              </span>
            )}
            {detail.bass && (
              <span className="text-xs text-red-400">
                ベース音: {detail.bass}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* 構成音 pill */}
        <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-gray-800">
          {detail.noteRoles.map((nr, i) => (
            <span
              key={i}
              className={`text-xs px-2.5 py-1 rounded-full border ${
                i === 0
                  ? "bg-yellow-900/20 text-yellow-400 border-yellow-800/40"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {nr.note}{" "}
              <span className="opacity-60 text-[10px]">
                {INTERVAL_SHORT[nr.intervalName] ?? nr.intervalName}
              </span>
            </span>
          ))}
        </div>

        {/* ポジション図 */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] text-gray-600 tracking-widest mb-1">ポジション</p>
          <PositionDiagram positions={detail.positions} noteRoles={detail.noteRoles} />
        </div>

        {/* アドバイス（デフォルト以外のみ） */}
        {detail.advice !== "ルート中心でOK" && (
          <div className="mx-4 mb-3 bg-gray-800 rounded p-3 text-green-400 text-sm font-bold">
            🎸 {detail.advice}
          </div>
        )}

        {/* フレーズ画面への導線 */}
        <div className="px-4 pb-6 pt-1">
          <button
            onClick={() => setShowPhraseScreen(true)}
            className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 hover:bg-gray-700 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-gray-300">
                {detail.name} の鉄板フレーズ
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                ルート弾き・ウォーキング・コードトーン
              </p>
            </div>
            <span className="text-gray-500 text-lg">›</span>
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
