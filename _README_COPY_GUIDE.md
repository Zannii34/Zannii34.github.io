# README Copy Guide

The files in docs/readme-templates/ are ready to paste into your other GitHub repos.
GitHub repos are not cloned locally, so this is manual work.

## The 6 repos and what to paste

For each repo:
1. Open the repo on GitHub
2. Click README.md (or Add file > Create new file if none exists)
3. Click the pencil icon to edit
4. Paste the contents of the matching local file
5. Scroll down and commit directly to main

| GitHub repo | Local file to paste |
|---|---|
| https://github.com/Zannii34/url-shortener | docs/readme-templates/url-shortener.md |
| https://github.com/Zannii34/ai-code-reviewer | docs/readme-templates/ai-code-reviewer.md |
| https://github.com/Zannii34/receipt-scanner | docs/readme-templates/receipt-scanner.md |
| https://github.com/Zannii34/url-cleaner | docs/readme-templates/url-cleaner.md |
| https://github.com/Zannii34/pyserve | docs/readme-templates/pyserve.md |
| https://github.com/Zannii34/data-visualizer | docs/readme-templates/data-visualizer.md |

## Extra files for pyserve

The pyserve repo also needs these three files:

| GitHub path | Local file |
|---|---|
| pyproject.toml | docs/pyserve-launch/pyproject.toml |
| CHANGELOG.md | docs/pyserve-launch/CHANGELOG.md |
| CONTRIBUTING.md | docs/pyserve-launch/CONTRIBUTING.md |

Once copied, pyserve is ready to publish to PyPI.

## How to read each local file

To print a file to the terminal for copy-paste:

    Get-Content "C:\Users\zan\_zannii_clean_publish_20261013\docs\readme-templates\url-shortener.md" -Raw

Or open it in VS Code:

    code "C:\Users\zan\_zannii_clean_publish_20261013\docs\readme-templates\url-shortener.md"