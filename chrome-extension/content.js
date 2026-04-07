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
      // 複数の.colを全部結合
      const cols = chord.querySelectorAll(".mejiowvnz .col");
      const lyricText = Array.from(cols)
        .map(col => col.textContent)
        .join("").replace(/([a-zA-Z])\s*([a-zA-Z])/g, '$1 $2').trim();

      chords.push(rt ? rt.textContent.trim() : "");
      lyrics.push(lyricText);
    });

    const chordLine = chords.filter(c => c).join("  ");
    const lyricLine = lyrics.join("");

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
