# Bass Navi - Claude Code 引き継ぎドキュメント

## プロジェクト概要

U-FRETなどの歌詞コード譜をGemini APIで解析し、セクション分け・演奏ガイド・コード詳細を表示する初見ベーシスト向け演奏支援ツール。

- **本番URL**: https://bass-navi-nm2w.vercel.app/
- **GitHub**: https://github.com/inumaru9009/bass-navi
- **技術スタック**: React 19 + Vite 8 + Tailwind CSS v4 + Gemini API

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
geminiAnalyzer.ts  → Gemini 2.5 Flash でセクション解析
  ↓
scoreParser.ts     → GeminiResult + rawText → Song オブジェクト構築
  ↓
chordParser.ts     → コード行判定・ChordToken抽出・コード詳細生成
  ↓
ScoreView / SectionBlock / ChordModal で表示
```

## 既知の問題・今後の改修ポイント

### 🔴 要対応

**1. デバッグログが本番に残っている**
- `src/lib/geminiAnalyzer.ts:73` に `console.log("Gemini raw response:", text)` が残っている
- リリース前に削除すること

**2. `src/lib/App .tsx` がgitに混入している**
- スペースを含む誤ったファイル `src/lib/App .tsx` がコミット済み
- 削除してpushすること: `git rm 'src/lib/App .tsx' && git commit -m "chore: remove misplaced file"`

**3. `main.jsx` が TypeScript化されていない**
- `src/main.jsx` だけ `.jsx` のまま。他は `.tsx`
- 厳密な型管理のため `.tsx` に変更推奨

### 🟡 品質改善

**4. コード判定パターンが不完全**
- `src/lib/chordParser.ts` の `chordPattern` が `Cmaj7`、`C7sus4`、`Cadd9` などを一部取りこぼす可能性
- 現在: `/^[A-G][b#]?(m|maj|min|aug|dim|sus|add)?[0-9]*(\/[A-G][b#]?)?$/`
- `maj7`、`7sus4`、`dim7` などの複合修飾子に対応できていない

**5. CHORD_TONES の網羅性**
- `src/lib/chordParser.ts` の `CHORD_TONES` に未定義のクオリティが来ると `""` (メジャー) にフォールバックする
- `7sus4`、`maj9`、`13`、`dim7` 等が未定義

**6. Gemini の startLine/endLine の信頼性**
- `scoreParser.ts` は Gemini が返す行番号でテキストをスライスするが、Gemini が行番号を誤ることがある
- 境界がずれてセクションの内容が欠けるケースがあり得る

**7. ChordModal のポジション図**
- `ChordModal.tsx:50` でフレット0のとき "○" を黄色い円の中に表示しているが、視覚的にわかりにくい
- 開放弦は円の外側に表示する一般的な記法に変更推奨

### 🟢 将来の機能候補

- セクションジャンプナビゲーション（タップで該当セクションへスクロール）
- カポ考慮した実音表示
- 繰り返し記号の検出と表示
- Chrome拡張から直接アプリにデータを送るAPI連携（現状はコピペ）
- PWA化（オフライン対応・ホーム画面追加）

## Chrome拡張について

`chrome-extension/` ディレクトリに格納。U-FRETページのDOMから譜面テキストを抽出してクリップボードにコピーする。

- `manifest.json`: Chrome拡張のマニフェスト（Manifest V3）
- `content.js`: U-FRETページへのコンテンツスクリプト
- `popup.html/js`: 拡張のポップアップUI

Chromeの「デベロッパーモード」で `chrome-extension/` フォルダを読み込んで使用。Vercelへのデプロイ対象外。

## デプロイ

Vercelと GitHub が連携済み。`main` ブランチへ push すると自動デプロイ。

```bash
git add .
git commit -m "feat: ..."
git push origin main
```

環境変数 `VITE_GEMINI_API_KEY` は Vercel ダッシュボード → Settings → Environment Variables で管理。
