# Bass Navi - Claude Code 引き継ぎドキュメント

## プロジェクト概要

U-FRETなどの歌詞コード譜をGemini APIで解析し、セクション分け・演奏ガイド・コード詳細を表示する初見ベーシスト向け演奏支援ツール。

- **本番URL**: https://bass-navi.vercel.app/
- **GitHub**: https://github.com/inumaru9009/bass-navi（Public）
- **技術スタック**: React 19 + Vite 8 + Tailwind CSS v4 + Gemini API (`gemini-2.5-flash`) + Tonal.js

## セットアップ

```bash
npm install
npm run dev  # http://localhost:5173
```

`.env.local` に以下が必要（Vercel環境変数にも設定済み）:
```
VITE_GEMINI_API_KEY=AIza...
```

## アーキテクチャ

```
入力テキスト（U-FRET譜面）
  ↓
geminiAnalyzer.ts  → Gemini 2.5 Flash でセクション解析（思考トークン無効）
  ↓
scoreParser.ts     → GeminiResult + rawText → Song オブジェクト構築
  ↓
chordParser.ts     → コード行判定・ChordToken抽出・コード詳細・構成音と役割生成
degreeAnalyzer.ts  → Tonal.js でキーからダイアトニック度数マップ生成
  ↓
ScoreView / SectionBlock / ChordModal で表示
```

## 実装済み機能

- **Gemini解析**: セクション分け・演奏ガイド・警告（思考トークン無効化で低コスト）
- **度数表示**: コードボタン下に `I` `IIm` `V` 等を表示（Tonal.js）
- **コードモーダル**: 構成音と役割（ルート/3rd/5th等）・ポジション図・アドバイス
- **localStorage永続化**: 解析結果をローカルに保存、リロード後も維持
- **印刷保存**: `📷 保存` ボタンで `window.print()` → PDF/画像保存（iOS/PC対応）
- **ブックマークレット**: U-FRETの譜面をコピーしてBass Naviを開く（ガイドページあり）
- **Chrome拡張**: U-FRETから曲名・アーティスト・譜面テキストを取得

## Gemini API の注意事項

- モデル: `gemini-2.5-flash`
- `thinkingBudget: 0` で思考トークンを無効化（コスト削減）
- `parts[0]` が思考トークン(`thought: true`)になる場合があるため、`!p.thought` でフィルタして使用
- 入力に行番号（`0:行内容`）を付けてGeminiに渡すことで出力トークンを削減
- Vercelのデプロイ時、`VITE_GEMINI_API_KEY` がないと403エラーになる

## ♭/♯の扱い

`chordParser.ts` の `normalizeChordStr` で `♭`→`b`、`♯`→`#` に正規化してから処理。U-FRETのDOM上でUnicode記号が使われる場合に対応。

## 既知の問題・今後の改修ポイント

### 🔴 要対応

**1. `main.jsx` が TypeScript化されていない**
- `src/main.jsx` だけ `.jsx` のまま。他は `.tsx`
- 厳密な型管理のため `.tsx` に変更推奨

### 🟡 品質改善

**2. コード判定パターンが不完全**
- `src/lib/chordParser.ts` の `chordPattern` が `maj7`、`7sus4`、`dim7` などの複合修飾子に対応できていない
- 現在: `/^[A-G][b#]?(m|maj|min|aug|dim|sus|add)?[0-9]*(\/[A-G][b#]?)?$/`

**3. CHORD_TONES の網羅性**
- `7sus4`、`maj9`、`13`、`dim7` 等が未定義でメジャーにフォールバックする

**4. Gemini の startLine/endLine の信頼性**
- 行番号を誤るとセクション内容がずれる場合がある

**5. ChordModal のポジション図**
- 開放弦（フレット0）の表示が一般的な記法と異なる（黄色い円の中に "○"）

### 🟢 将来の機能候補

- セクションジャンプナビゲーション（タップで該当セクションへスクロール）
- カポ考慮した実音表示
- 繰り返し記号の検出と表示
- Chrome拡張から直接アプリにデータを送るAPI連携（現状はコピペ）
- PWA化（オフライン対応・ホーム画面追加）
- カポ自動リセット機能の再実装（一度ロールバックで消えた）

## Chrome拡張について

`chrome-extension/` ディレクトリに格納。U-FRETページのDOMから曲名・アーティスト・譜面テキストを抽出してクリップボードにコピーする。

- `manifest.json`: Chrome拡張のマニフェスト（Manifest V3）
- `content.js`: U-FRETページへのコンテンツスクリプト（曲名・アーティスト取得対応済み）
- `popup.html/js`: 拡張のポップアップUI

Chromeの「デベロッパーモード」で `chrome-extension/` フォルダを読み込んで使用。Vercelへのデプロイ対象外。

## Vercelデプロイについての注意

- GitHubリポジトリはPublic
- Vercelプロジェクト名: `bass-navi`（`bass-navi.vercel.app`）
- 過去にTeamスコープで誤作成したプロジェクトが複数あったが削除済み
- 環境変数 `VITE_GEMINI_API_KEY` 追加後は必ず **Redeploy** が必要
- `main` ブランチへ push すると自動デプロイ

```bash
git add .
git commit -m "feat: ..."
git push origin main
```
