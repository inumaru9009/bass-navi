// src/components/ChordModal.tsx

import type { ChordDetail, BassPosition, NoteRole } from "../types";

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
    <div className="mt-2">
      <div className="flex text-xs text-gray-400 mb-1">
        <span className="w-6" />
        {displayFrets.map(f => (
          <span key={f} className="w-8 text-center">
            {f === 0 ? "開" : f}
          </span>
        ))}
      </div>
      {[1, 2, 3, 4].map(str => (
        <div key={str} className="flex items-center mb-1">
          <span className="w-6 text-xs text-gray-400">
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
            const isRoot = true;
            const label = role ? (INTERVAL_SHORT[role.intervalName] ?? "R") : "R";
            return (
              <div
                key={f}
                className="w-8 h-6 border-b border-gray-600 flex items-center justify-center"
              >
                {hit ? (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold ${
                    isRoot ? "bg-yellow-400" : "bg-green-400"
                  }`}>
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

export default function ChordModal({ detail, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-end justify-center z-20"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 w-full max-w-lg rounded-t-2xl p-5 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-yellow-400 text-2xl font-bold font-mono">
            {detail.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 text-xl"
          >
            ✕
          </button>
        </div>

        {/* ルート・ベース音 */}
        <div className="flex gap-4 text-sm mb-3">
          <div>
            <span className="text-gray-400">ルート </span>
            <span className="text-white font-bold">{detail.root}</span>
          </div>
          {detail.bass && (
            <div>
              <span className="text-gray-400">ベース音 </span>
              <span className="text-red-400 font-bold">{detail.bass}</span>
            </div>
          )}
        </div>

        {/* 構成音と役割 */}
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">構成音と役割</p>
          <div className="space-y-1">
            {detail.noteRoles.map((nr, i) => (
              <div key={i} className="flex items-baseline gap-3">
                <span className={`font-mono font-bold text-sm w-6 ${
                  i === 0 ? "text-yellow-400" : "text-green-400"
                }`}>
                  {nr.note}
                </span>
                <span className="text-gray-400 text-xs w-16">
                  {nr.intervalName}
                </span>
                <span className="text-gray-300 text-xs">
                  {nr.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ポジション図 */}
        <div className="mb-3">
          <p className="text-gray-400 text-xs mb-1">ポジション</p>
          <PositionDiagram positions={detail.positions} noteRoles={detail.noteRoles} />
        </div>

        {/* 一言アドバイス（デフォルト以外のみ表示） */}
        {detail.advice !== "ルート中心でOK" && (
          <div className="bg-gray-800 rounded p-3 text-green-400 text-sm font-bold">
            🎸 {detail.advice}
          </div>
        )}
      </div>
    </div>
  );
}