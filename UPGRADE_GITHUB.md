# GitHub Pages 大版本更新步骤（ilovepapapa / KamizukiKyoto）

你的现有公开网址：

`https://ilovepapapa.github.io/KamizukiKyoto/`

## 最稳的网页上传方式

1. 先把本 ZIP 完整解压成普通 Windows 文件夹。不要直接从 ZIP 窗口拖文件。
2. 打开 GitHub 仓库 `ilovepapapa/KamizukiKyoto`。
3. 进入 `Add file` → `Upload files`。
4. 将解压后的所有文件和文件夹拖入上传区域。
5. 等待 GitHub 列出文件后再提交。
6. Commit message 填：

`Upgrade Kamizuki Kyoto to Learning Suite V1.1`

7. Description 可填：

`Major learning update with vocabulary, grammar, sentence patterns, listening, reading, statistics, backup tools, mobile optimization, and PWA support.`

8. Commit directly to the `main` branch。
9. 等 GitHub Pages 自动重新部署。
10. 第一次打开新版时强制刷新；iPhone 可关闭网页后重新打开。

## 上传后应出现的新文件

- `pages/vocabulary.html`
- `pages/grammar.html`
- `pages/patterns.html`
- `pages/listening.html`
- `pages/reading.html`
- `data/vocabulary.json`
- `data/grammar.json`
- `data/patterns.json`
- `data/reading.json`
- `manifest.webmanifest`
- `service-worker.js`

旧五十音进度会继续使用原来的 `kamizukiCards` 数据。
