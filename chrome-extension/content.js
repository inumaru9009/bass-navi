function extractScore() {
  const sheet = document.querySelector(".musical-sheet");
  if (!sheet) return null;

  const lines = [];
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
        .join("");

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
    const text = extractScore();
    sendResponse({ text });
  }
  return true;
});