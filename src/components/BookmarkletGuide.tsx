// src/components/BookmarkletGuide.tsx

import { useState } from "react";

const BOOKMARKLET_CODE = `javascript:(function(){var sheet=document.querySelector('.musical-sheet');if(!sheet){alert('U-FRETの曲ページで実行してください');return;}var title=document.querySelector('h1')?.textContent?.trim()||document.title.split('|')[0].trim();var artist=document.querySelector('.p-detail-cont__artist')?.textContent?.trim()||'';var lines=[];if(title)lines.push('曲名: '+title);if(artist)lines.push('アーティスト: '+artist);lines.push('---');sheet.querySelectorAll('.chord-row').forEach(function(row){var chords=[];var lyrics=[];row.querySelectorAll('.chord').forEach(function(chord){var rt=chord.querySelector('rt');var cols=chord.querySelectorAll('.mejiowvnz .col');var lyric=Array.from(cols).map(function(c){return c.textContent;}).join('');chords.push(rt?rt.textContent.trim():'');lyrics.push(lyric);});var chordLine=chords.filter(function(c){return c;}).join('  ');var lyricLine=lyrics.join('');if(chordLine)lines.push(chordLine);if(lyricLine.trim())lines.push(lyricLine);});var text=lines.join('\\n');navigator.clipboard.writeText(text).then(function(){alert('譜面をコピーしました！\\nBass Naviに貼り付けてください。');window.open('https://bass-navi-nm2w.vercel.app/','_blank');}).catch(function(){prompt('以下をコピーしてBass Naviに貼り付けてください:',text);window.open('https://bass-navi-nm2w.vercel.app/','_blank');});})();`;

type Props = {
  onBack: () => void;
};

export default function BookmarkletGuide({ onBack }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(BOOKMARKLET_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt("以下をコピーしてください:", BOOKMARKLET_CODE);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ヘッダー */}
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="text-gray-400 text-sm">
          ← 戻る
        </button>
        <h1 className="text-white font-bold">スマホでの使い方</h1>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto w-full space-y-8">

        {/* ブックマークレットコード */}
        <section>
          <h2 className="text-yellow-400 font-bold mb-2">ブックマークレット</h2>
          <p className="text-gray-400 text-sm mb-3">
            U-FRETで実行すると譜面をコピーしてBass Naviを開きます。
          </p>
          <div className="bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-300 break-all leading-relaxed border border-gray-700 max-h-32 overflow-y-auto">
            {BOOKMARKLET_CODE}
          </div>
          <button
            onClick={handleCopy}
            className="mt-3 w-full bg-yellow-500 text-black font-bold py-3 rounded"
          >
            {copied ? "✓ コピーしました！" : "コードをコピー"}
          </button>
        </section>

        {/* iOS登録手順 */}
        <section>
          <h2 className="text-yellow-400 font-bold mb-3">📱 iOSでの登録手順</h2>
          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: "このページをブックマーク保存",
                desc: "Safariの共有ボタン（□↑）→「ブックマークに追加」",
              },
              {
                step: "2",
                title: "上のコードをコピー",
                desc: "「コードをコピー」ボタンをタップ",
              },
              {
                step: "3",
                title: "ブックマークを編集",
                desc: "ブックマーク一覧（本のアイコン）→ 保存したブックマークを左スワイプ→「編集」",
              },
              {
                step: "4",
                title: "URLを置き換え",
                desc: "URL欄を全部消してコピーしたコードを貼り付け",
              },
              {
                step: "5",
                title: "名前を変更して保存",
                desc: "名前を「Bass Navi取得」に変更→「完了」",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-3">
                <span className="w-7 h-7 bg-yellow-500 text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {step}
                </span>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* PC登録手順 */}
        <section>
          <h2 className="text-yellow-400 font-bold mb-3">💻 PCでの登録手順</h2>
          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: "コードをコピー",
                desc: "「コードをコピー」ボタンをクリック",
              },
              {
                step: "2",
                title: "新規ブックマークを作成",
                desc: "ブックマークバーを右クリック→「ページを追加」または「新しいブックマーク」",
              },
              {
                step: "3",
                title: "URLに貼り付け",
                desc: "名前を「Bass Navi取得」、URLにコピーしたコードを貼り付けて保存",
              },
            ].map(({ step, title, desc }) => (
              <li key={step} className="flex gap-3">
                <span className="w-7 h-7 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {step}
                </span>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 使い方 */}
        <section className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h2 className="text-white font-bold mb-2">使い方</h2>
          <ol className="text-gray-300 text-sm space-y-1">
            <li>1. U-FRETで曲ページを開く</li>
            <li>2. ブックマーク一覧から「Bass Navi取得」を実行</li>
            <li>3. 「譜面をコピーしました」が出たらOK</li>
            <li>4. Bass Naviに貼り付けて「解析する」</li>
          </ol>
        </section>

      </div>
    </div>
  );
}
