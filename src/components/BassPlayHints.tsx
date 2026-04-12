// src/components/BassPlayHints.tsx

import type { BassPlay, PlayType } from "../types";

const TYPE_STYLE: Record<PlayType, string> = {
  passing:  "bg-purple-900/50 text-purple-300 border-purple-700/40",
  approach: "bg-teal-900/50 text-teal-300 border-teal-700/40",
  octave:   "bg-orange-900/50 text-orange-300 border-orange-700/40",
};

type Props = {
  play: BassPlay;
};

export default function BassPlayHint({ play }: Props) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] leading-none self-center ${TYPE_STYLE[play.type]}`}
      title={play.advice}
    >
      <span className="opacity-70">{play.label}</span>
      {play.noteExamples.length > 0 && (
        <span className="font-mono font-bold">{play.noteExamples.join("·")}</span>
      )}
    </div>
  );
}
