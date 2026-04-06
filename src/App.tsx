import { useState, useEffect } from "react";
import type { Song } from "./types";
import { analyzeWithGemini } from "./lib/geminiAnalyzer";
import { buildSong } from "./lib/scoreParser";
import ScoreView from "./components/ScoreView";
import BookmarkletGuide from "./components/BookmarkletGuide";

type AppState = "input" | "loading" | "result" | "error" | "guide";

const STORAGE_KEY = "bass-navi-song";

export default function App() {
  const [song, setSong] = useState<Song | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as Song;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return "input";
      const parsed = JSON.parse(saved);
      return parsed ? "result" : "input";
    } catch {
      return "input";
    }
  });

  const [rawText, setRawText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // song更新時にlocalStorageに保存
  useEffect(() => {
    if (song) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(song));
      } catch {
        console.warn("localStorage保存失敗");
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [song]);

  // URLパラメータから譜面テキストを受け取る
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const score = params.get("score");
    if (score) {
      setRawText(decodeURIComponent(score));
      window.history.replaceState({}, "", "/");
    }
  }, []);

  function handleBack() {
    localStorage.removeItem(STORAGE_KEY);
    setSong(null);
    setState("input");
  }

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
    return <ScoreView song={song} onBack={handleBack} />;
  }

  if (state === "guide") {
    return <BookmarkletGuide onBack={() => setState("input")} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Bass Navi</h1>
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
      <button
        onClick={() => setState("guide")}
        className="mt-6 text-gray-500 text-xs underline"
      >
        📖 スマホでの使い方（ブックマークレット）
      </button>
    </div>
  );
}
