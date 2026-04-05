// src/components/SectionBlock.tsx

import { useEffect, useRef } from "react";
import type { Section, ChordToken } from "../types";

type Props = {
  section: Section;
  isActive: boolean;
  onChordTap: (chord: ChordToken) => void;
  onVisible: () => void;
};

export default function SectionBlock({
  section,
  isActive,
  onChordTap,
  onVisible,
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
              {line.chords.map((chord, ci) => (
                <button
                  key={ci}
                  onClick={() => onChordTap(chord)}
                  className="text-yellow-400 text-sm font-mono font-bold bg-gray-800 px-2 py-0.5 rounded hover:bg-yellow-500 hover:text-black transition-colors"
                >
                  {chord.name}
                </button>
              ))}
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