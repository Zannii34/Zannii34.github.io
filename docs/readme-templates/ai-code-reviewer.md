# AI Code Reviewer

A GitHub Action that reviews pull requests using Claude AI and posts feedback as a PR comment.

## The problem

Code review is a bottleneck on small teams. I wanted to know whether an AI could catch obvious issues (unused imports, missing error handling, unclear naming) before a human reviewer sees the PR.

## What it does

- Runs automatically on every PR open and sync
- Calls Claude with the PR diff
- Posts structured feedback as a comment
- Configurable strictness via a workflow input

## Technical decisions

- Claude over GPT: simpler API and per-token pricing without warm-up.
- GitHub Action over standalone bot: runs in the repo CI, no external hosting.
- Comment-per-review over annotations: annotations require GitHub App permissions; a comment works everywhere.

## What would I change at scale?

- Diff chunking for very large PRs
- Cache responses by file hash
- Rate limiting per repo

## What I learned

Prompt engineering for code review is harder than expected. Vague prompts get vague reviews. Being specific about what to look for (error handling, security, naming) produces dramatically better output.

## License

MIT
