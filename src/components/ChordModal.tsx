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

// intervalName → ドット色のマッピング
const DEGREE_COLOR: Record<string, string> = {
  "ルート":  "#E5B800",
  "5th":    "#4A90D9",
  "♭3rd":  "#888888",
  "3rd":    "#888888",
  "♭7th":  "#9B7FD4",
  "maj7th": "#9B7FD4",
  "♭5th":  "#D05050",
};
const DEGREE_TEXT_DARK = new Set(["ルート"]);

type ShapeLine = {
  x1: number; y1: number;
  x2: number; y2: number;
  color: string;
};

function calcShapeLines(
  positions: BassPosition[],
  fretToX: (f: number) => number,
  stringToY: (s: number) => number
): ShapeLine[] {
  const lines: ShapeLine[] = [];
  const roots  = positions.filter(p => p.intervalName === "ルート");
  const fifths = positions.filter(p => p.intervalName === "5th");

  for (let i = 0; i < roots.length - 1; i++) {
    lines.push({
      x1: fretToX(roots[i].fret),   y1: stringToY(roots[i].string),
      x2: fretToX(roots[i+1].fret), y2: stringToY(roots[i+1].string),
      color: "#E5B800",
    });
  }
  if (roots.length > 0 && fifths.length > 0) {
    lines.push({
      x1: fretToX(roots[0].fret),  y1: stringToY(roots[0].string),
      x2: fretToX(fifths[0].fret), y2: stringToY(fifths[0].string),
      color: "#4A90D9",
    });
  }
  return lines;
}

function PositionDiagram({ positions }: { positions: BassPosition[]; noteRoles: NoteRole[] }) {
  if (positions.length === 0) return null;

  const frets = positions.map(p => p.fret);
  const minFret = Math.max(0, Math.min(...frets) - 1);
  const maxFret = Math.max(...frets);
  const displayCount = Math.max(maxFret - minFret + 1, 4);

  const PAD_LEFT = 22;
  const PAD_TOP  = 8;
  const FRET_W   = 48;
  const STR_GAP  = 18;
  const STRINGS: Array<1|2|3|4> = [4, 3, 2, 1];

  const svgW = PAD_LEFT + displayCount * FRET_W + 12;
  const svgH = PAD_TOP + 3 * STR_GAP + 22;

  const fretToX = (f: number) => PAD_LEFT + (f - minFret + 0.5) * FRET_W;
  const strToY  = (s: number) => PAD_TOP  + (4 - s) * STR_GAP;

  const shapeLines = calcShapeLines(positions, fretToX, strToY);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ width: "100%", display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 弦 */}
      {STRINGS.map((s, i) => (
        <line
          key={s}
          x1={PAD_LEFT} y1={strToY(s)}
          x2={svgW - 8} y2={strToY(s)}
          stroke="#3a3a3a"
          strokeWidth={1.5 - i * 0.2}
        />
      ))}

      {/* フレット縦線 */}
      {Array.from({ length: displayCount + 1 }, (_, i) => minFret + i).map(f => (
        <line
          key={f}
          x1={PAD_LEFT + (f - minFret) * FRET_W}
          y1={PAD_TOP - 4}
          x2={PAD_LEFT + (f - minFret) * FRET_W}
          y2={strToY(1) + 4}
          stroke={f === minFret ? "#666" : "#333"}
          strokeWidth={f === minFret ? 1.8 : 0.8}
        />
      ))}

      {/* フレット番号 */}
      {Array.from({ length: displayCount }, (_, i) => minFret + i).map(f => (
        <text
          key={f}
          x={fretToX(f)}
          y={svgH - 2}
          fontSize="7"
          textAnchor="middle"
          fill="#444"
        >
          {f === 0 ? "開" : `${f + 1}f`}
        </text>
      ))}

      {/* 弦ラベル */}
      {STRINGS.map(s => (
        <text key={s} x={PAD_LEFT - 10} y={strToY(s) + 3} fontSize="7" textAnchor="middle" fill="#555">
          {["G","D","A","E"][4 - s]}
        </text>
      ))}

      {/* シェイプ破線（ドットより前に描画して背面に） */}
      {shapeLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.color}
          strokeWidth="1"
          strokeDasharray="3,2"
          opacity="0.4"
        />
      ))}

      {/* ポジションドット */}
      {positions.map((pos, i) => {
        const cx = fretToX(pos.fret);
        const cy = strToY(pos.string);
        const iname = pos.intervalName ?? "ルート";
        const fill  = DEGREE_COLOR[iname] ?? "#666";
        const textFill = DEGREE_TEXT_DARK.has(iname) ? "#12141A" : "#ffffff";
        const label = INTERVAL_SHORT[iname] ?? iname;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="7.5" fill={fill} />
            <text x={cx} y={cy + 3} fontSize="7.5" textAnchor="middle" fill={textFill} fontWeight="500">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
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
