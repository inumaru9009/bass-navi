const extractBtn = document.getElementById("extractBtn");
const copyBtn = document.getElementById("copyBtn");
const output = document.getElementById("output");
const status = document.getElementById("status");
const error = document.getElementById("error");

extractBtn.addEventListener("click", async () => {
  status.textContent = "";
  error.textContent = "";
  extractBtn.disabled = true;
  extractBtn.textContent = "取得中...";

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab.url.includes("ufret.jp") && !tab.url.includes("u-fret.com")) {
      error.textContent = "U-FRETのページで使用してください";
      extractBtn.disabled = false;
      extractBtn.textContent = "譜面を取得する";
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "extract",
    });

    if (response?.text) {
      output.value = response.text;
      output.style.display = "block";
      copyBtn.style.display = "block";
      status.textContent = "取得成功！Bass Naviに貼り付けてください";
    } else {
      error.textContent = "譜面が取得できませんでした";
    }
  } catch (e) {
    error.textContent = "エラー: " + e.message;
  } finally {
    extractBtn.disabled = false;
    extractBtn.textContent = "譜面を取得する";
  }
});

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(output.value).then(() => {
    status.textContent = "コピーしました！";
  });
});