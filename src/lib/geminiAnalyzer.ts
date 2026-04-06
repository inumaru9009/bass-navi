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

## セクション判定のルール
- 譜面テキスト中に「イントロ」「Aメロ」「Bメロ」「サビ」「アウトロ」「間奏」「ブリッジ」などのラベルが明記されている場合は必ずそれに従う
- ラベルがない場合は歌詞・コード進行の繰り返しパターンから推定する
- サビ（chorus）は曲中で最も繰り返し登場し、感情的なクライマックスとなる部分
- Aメロ（verse）はサビ前の落ち着いた展開部分
- Bメロ（b_melo）はAメロとサビの間の転換部分
- 同じコード進行・歌詞が繰り返されるブロックは同じsectionTypeにする

## 注意事項
- sectionsのstartLine/endLineは譜面テキストの行番号（0始まり）
- 全行をいずれかのセクションに必ず含める（行の抜けを作らない）
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
        maxOutputTokens: 16384,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  // gemini-2.5-flashは思考トークン(thought:true)をparts[0]に返すことがある
  const textPart = parts.find((p: { thought?: boolean; text?: string }) => !p.thought && p.text);
  const text: string = textPart?.text ?? "";

  // JSON部分を抽出（複数パターン対応）
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`パース失敗: レスポンス="${text.slice(0, 100)}"`);
  }

  const cleaned = jsonMatch[0].trim();

  try {
    return JSON.parse(cleaned) as GeminiAnalysisResult;
  } catch (e) {
    throw new Error(`JSONパース失敗: ${e instanceof Error ? e.message : String(e)}`);
  }
}