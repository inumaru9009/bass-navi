// src/components/PhraseScreen.tsx

import { useState } from "react";
import { phraseData, getQualityKey } from "../lib/phraseData";
import type { PhraseCategory } from "../lib/phraseData";

interface Props {
  chordName: string;
  onBack: () => void;
}

const TABS: { key: PhraseCategory; label: string }[] = [
  { key: "root",        label: "ルート弾き" },
  { key: "walking",     label: "ウォーキング" },
  { key: "chord-tone",  label: "コードトーン" },
];

export default function PhraseScreen({ chordName, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<PhraseCategory>("root");

  const qualityKey = getQualityKey(chordName);
  const phraseSet = phraseData[qualityKey] ?? phraseData["M"];
  const phrases = phraseSet[activeTab] ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* ナビゲーションバー */}
      <div className="flex items-center gap-3 px-4 h-11 border-b border-gray-800 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-blue-400 text-sm flex items-center gap-1"
        >
          ‹ {chordName}
        </button>
        <span className="text-sm font-medium text-gray-300">鉄板フレーズ</span>
      </div>

      {/* タブ */}
      <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeTab === key
                ? "bg-gray-100 text-gray-900 border-transparent"
                : "border-gray-700 text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* フレーズカード一覧 */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {phrases.length === 0 ? (
          <p className="text-gray-600 text-sm mt-4">フレーズデータがまだありません。</p>
        ) : (
          phrases.map((phrase, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-lg p-3"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-200">{phrase.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    phrase.difficulty === "easy"
                      ? "bg-green-900/40 text-green-400"
                      : "bg-amber-900/40 text-amber-400"
                  }`}
                >
                  {phrase.difficulty === "easy" ? "初級" : "中級"}
                </span>
              </div>
              <pre className="font-mono text-xs text-gray-400 bg-gray-950 rounded px-3 py-2 leading-relaxed mb-2 whitespace-pre overflow-x-auto">
                {phrase.tab}
              </pre>
              <p className="text-xs text-gray-500 leading-relaxed">{phrase.tip}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
