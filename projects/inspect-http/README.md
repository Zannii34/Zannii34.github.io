# inspect-http

A single-file CLI tool that inspects HTTP responses in detail.

## What it does

Point it at a URL and get back a clean report:

    $ inspect-http https://zannii34.github.io

      inspect-http v0.1.0
      ------------------------------------------------

      URL         https://zannii34.github.io/
      Status      200 OK
      Time        187ms
      Size        31.2 KB
      Server      GitHub.com
      Content     text/html; charset=utf-8
      Encoding    gzip

      Timing
        TTFB      140ms
        Total     187ms

      Redirects
        (none)

      Security Headers
        + Strict-Transport-Security
        + X-Content-Type-Options
        - X-Frame-Options (missing)
        - Content-Security-Policy (missing)
        - Referrer-Policy (missing)

## Why I built it

I wanted a fast way to sanity-check a deployed site: is HTTPS working, are the security headers present, how slow is the first byte. Existing tools print raw headers but not a summary.

## Design decisions

- Stdlib only. No requests, no httpx, no click. Runs on any Python 3.8+.
- Auto-disables colour when output is not a TTY, so piping to a file gives clean text.
- Exit codes matter. Non-2xx returns 0, connection failure returns 1.

## Installation

    git clone https://github.com/Zannii34/inspect-http.git
    cd inspect-http
    python inspect_http.py https://example.com

## What I learned

Writing a CLI in pure stdlib is a good exercise in restraint. argparse is powerful enough for most tools. Colouring output correctly (only when the terminal supports it) is a detail most tutorials skip.

## License

MIT