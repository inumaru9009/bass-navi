// src/App.tsx

import { useState } from "react";
import type { Song } from "./types";
import { analyzeWithGemini } from "./lib/geminiAnalyzer";
import { buildSong } from "./lib/scoreParser";
import ScoreView from "./components/ScoreView";

type AppState = "input" | "loading" | "result" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("input");
  const [rawText, setRawText] = useState("");
  const [song, setSong] = useState<Song | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleAnalyze() {
    if (!rawText.trim()) return;
    setState("loading");
    try {
      const result = await analyzeWithGemini(rawText);
      const built = buildSong(rawText, result);
      setSong(built);
      setState("result");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "エラーが発生しました");
      setState("error");
    }
  }

  if (state === "result" && song) {
    return <ScoreView song={song} onBack={() => setState("input")} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">🎸 Bass Navi</h1>
      <p className="text-gray-400 text-sm mb-6">
        歌詞コード譜を貼り付けて解析
      </p>

      {state === "error" && (
        <div className="w-full max-w-lg bg-red-900 text-red-200 rounded p-3 mb-4 text-sm">
          {errorMsg}
        </div>
      )}

      <textarea
        className="w-full max-w-lg h-64 bg-gray-900 text-white rounded p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
        placeholder="U-FRETなどから歌詞コード譜をコピーしてここに貼り付けてください"
        value={rawText}
        onChange={e => setRawText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={state === "loading" || !rawText.trim()}
        className="mt-4 w-full max-w-lg bg-yellow-500 text-black font-bold py-3 rounded disabled:opacity-50"
      >
        {state === "loading" ? "解析中..." : "解析する"}
      </button>

      {state === "loading" && (
        <p className="mt-4 text-gray-400 text-sm animate-pulse">
          Geminiが譜面を解析しています...
        </p>
      )}
    </div>
  );
}