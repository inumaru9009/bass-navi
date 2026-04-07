async function extractScore() {
  const sheet = document.querySelector(".musical-sheet");
  if (!sheet) return null;

  // 曲名・アーティスト取得
  const title = document.querySelector("h1")?.textContent?.trim()
    || document.title.split("|")[0].trim();
  const artist = document.querySelector(".p-detail-cont__artist")?.textContent?.trim() || "";

  const lines = [];
  if (title) lines.push("曲名: " + title);
  if (artist) lines.push("アーティスト: " + artist);
  lines.push("---");

  const rows = sheet.querySelectorAll(".chord-row");

  rows.forEach(row => {
    const chords = [];
    const lyrics = [];

    row.querySelectorAll(".chord").forEach(chord => {
      const rt = chord.querySelector("rt");
      const rtText = rt ? rt.innerText.trim() : "";
      // innerText でブラウザ描画テキスト全体を取得しコード名を除去
      let raw = chord.innerText || chord.textContent;
      if (rtText) {
        raw = raw.endsWith(rtText)
          ? raw.slice(0, -rtText.length)
          : raw.replace(rtText, "");
      }
      const lyricText = raw.replace(/[ \t\n\r]+/g, " ").trim();

      chords.push(rtText);
      lyrics.push(lyricText);
    });

    const chordLine = chords.filter(c => c).join("  ");
    const lyricLine = lyrics.reduce(function(acc, lyric) {
      if (!acc) return lyric;
      const lastChar = acc[acc.length - 1];
      const firstChar = lyric[0];
      if (/[a-zA-Z!?,'.]/.test(lastChar) && /[a-zA-Z(]/.test(firstChar)) {
        return acc + ' ' + lyric;
      }
      return acc + lyric;
    }, '');

    if (chordLine) lines.push(chordLine);
    if (lyricLine.trim()) lines.push(lyricLine);
  });

  return lines.join("\n");
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "extract") {
    extractScore().then(text => sendResponse({ text }));
  }
  return true;
});
