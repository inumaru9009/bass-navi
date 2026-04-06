// src/components/SectionBlock.tsx

import { useEffect, useRef } from "react";
import type { Section, ChordToken } from "../types";
import { getDegreeLabel, getDegreeFunction } from "../lib/degreeAnalyzer";
import Tooltip from "./Tooltip";

const degreeFunctionColors: Record<string, string> = {
  tonic:       "bg-yellow-600 text-black hover:bg-yellow-400",
  dominant:    "bg-red-700 text-white hover:bg-red-500",
  subdominant: "bg-blue-700 text-white hover:bg-blue-500",
  other:       "bg-gray-700 text-white hover:bg-gray-500",
  "":          "bg-gray-800 text-yellow-400 hover:bg-yellow-500 hover:text-black",
};

type Props = {
  section: Section;
  isActive: boolean;
  onChordTap: (chord: ChordToken) => void;
  onVisible: () => void;
  degreeMap: Record<string, string>;
};

function getDegreeTooltip(degree: string, degreeFunc: string): React.ReactNode {
  const funcDesc: Record<string, string> = {
    tonic:       "トニック — 安定・ホーム。ルートをどっしり弾こう。",
    dominant:    "ドミナント — 緊張・解決の引力。次のコードへ向かう勢いを出そう。",
    subdominant: "サブドミナント — 浮遊・広がり。柔らかく弾くと映える。",
    other:       "ノンダイアトニック — キー外のコード。ルートをしっかり押さえよう。",
  };
  const desc = funcDesc[degreeFunc] ?? "";
  return (
    <>
      <p className="font-bold text-white mb-1">{degree}</p>
      <p>{desc}</p>
    </>
  );
}

export default function SectionBlock({
  section,
  isActive,
  onChordTap,
  onVisible,
  degreeMap,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) onVisible();
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div
      ref={ref}
      className={`mb-6 rounded-lg p-3 border ${
        isActive
          ? "border-yellow-500 bg-gray-900"
          : "border-gray-800 bg-gray-950"
      }`}
    >
      {/* セクションラベル */}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded ${
            isActive
              ? "bg-yellow-500 text-black"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {section.label}
        </span>
        {section.warnings.map((w, i) => (
          <span
            key={i}
            className="text-xs bg-red-800 text-red-200 px-2 py-0.5 rounded"
          >
            ⚠ {w.label}
          </span>
        ))}
      </div>

      {/* 歌詞・コード行 */}
      {section.lines.map((line, idx) => (
        <div key={idx} className="mb-2">
          {/* コード行 */}
          {line.chords.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-0.5">
              {line.chords.map((chord, ci) => {
                const degree = getDegreeLabel(chord.name, degreeMap);
                const degreeFunc = getDegreeFunction(degree);
                const colorClass = degreeFunctionColors[degreeFunc];
                return (
                  <div key={ci} className="flex flex-col items-center">
                    <button
                      onClick={() => onChordTap(chord)}
                      className={`text-sm font-mono font-bold px-2 py-0.5 rounded transition-colors ${colorClass}`}
                    >
                      {chord.name}
                    </button>
                    {degree && (
                      <Tooltip content={getDegreeTooltip(degree, degreeFunc)}>
                        <span className="text-gray-500 text-xs mt-0.5 cursor-default">
                          {degree}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {/* 歌詞行 */}
          {line.lyric && (
            <p className="text-gray-300 text-sm leading-relaxed">
              {line.lyric}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
