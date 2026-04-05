// src/lib/geminiAnalyzer.ts

import type { GeminiAnalysisResult } from "../types";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

function buildPrompt(rawText: string): string {
  return `
あなたは音楽理論とベース演奏に詳しいアシスタントです。
以下の歌詞コード譜を解析し、JSONのみを返してください。
前置き・説明・マークダウンは一切不要です。JSONだけ返してください。

## 譜面テキスト
${rawText}

## 出力形式
{
  "title": "曲名",
  "artist": "アーティスト名（不明な場合は省略）",
  "key": "キー（例: G, Am, Bb）",
  "capo": 0,
  "sections": [
    {
      "type": "intro | verse | b_melo | chorus | bridge | interlude | outro | unknown",
      "label": "表示用ラベル（例: イントロ, Aメロ, サビ）",
      "playGuide": "ベーシスト向け一言方針（例: タイトにルートを刻む）",
      "warnings": [
        {
          "type": "modulation | non_diatonic | slash | break | ending | section_change",
          "label": "短い注意ラベル（例: 転調注意, ベース音確認）"
        }
      ],
      "startLine": 0,
      "endLine": 5
    }
  ]
}

## 注意事項
- sectionsのstartLine/endLineは譜面テキストの行番号（0始まり）
- warningsは危険ポイントがない場合は空配列
- playGuideは長文NG、15文字以内の短文
- JSONのみ返すこと。絶対に前置きや説明を含めないこと
`;
}

export async function analyzeWithGemini(
  rawText: string
): Promise<GeminiAnalysisResult> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(rawText) }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // JSON部分を抽出（複数パターン対応）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini APIのレスポンスをパースできませんでした");
  }

  const cleaned = jsonMatch[0].trim();

  try {
    return JSON.parse(cleaned) as GeminiAnalysisResult;
  } catch {
    throw new Error("Gemini APIのレスポンスをパースできませんでした");
  }
}