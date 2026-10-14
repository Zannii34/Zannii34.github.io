#!/usr/bin/env python3
'''
inspect-http - a CLI tool that inspects HTTP responses in detail.
Usage:
    inspect-http <url>
'''

import argparse
import socket
import ssl
import sys
import time
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

# Colour only when output is a TTY and we are not on legacy Windows console
USE_COLOUR = sys.stdout.isatty() and not (sys.platform == "win32" and not sys.stdout.isatty())
# Windows: prefer ANSI but disable if the terminal is unlikely to render it
if sys.platform == "win32":
    import os
    # Enable ANSI if the console supports it; otherwise disable.
    # CMD.exe and older PowerShell hosts do not support ANSI by default.
    USE_COLOUR = os.environ.get("WT_SESSION") is not None or os.environ.get("TERM_PROGRAM") == "vscode"

def c(text, code):
    return f"\033[{code}m{text}\033[0m" if USE_COLOUR else text

def dim(t):    return c(t, "2")
def bold(t):   return c(t, "1")
def green(t):  return c(t, "32")
def yellow(t): return c(t, "33")
def red(t):    return c(t, "31")
def blue(t):   return c(t, "36")

def hr(char="-", width=48):
    return char * width

def fmt_ms(seconds):
    return f"{seconds * 1000:.0f}ms"

def fmt_bytes(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.1f} {unit}" if unit != "B" else f"{n} B"
        n /= 1024
    return f"{n:.1f} TB"

def http_reason(code):
    reasons = {
        200: "OK", 201: "Created", 204: "No Content",
        301: "Moved Permanently", 302: "Found", 304: "Not Modified",
        307: "Temporary Redirect", 308: "Permanent Redirect",
        400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
        404: "Not Found", 405: "Method Not Allowed", 429: "Too Many Requests",
        500: "Internal Server Error", 502: "Bad Gateway",
        503: "Service Unavailable", 504: "Gateway Timeout",
    }
    return reasons.get(code, "")

def status_colour(code):
    label = f"{code} {http_reason(code)}".strip()
    if 200 <= code < 300: return green(label)
    if 300 <= code < 400: return yellow(label)
    return red(label)

def header_report(headers):
    checks = ["Strict-Transport-Security", "X-Content-Type-Options",
              "X-Frame-Options", "Content-Security-Policy", "Referrer-Policy"]
    lower = {k.lower(): v for k, v in headers.items()}
    present = [h for h in checks if h.lower() in lower]
    missing = [h for h in checks if h.lower() not in lower]
    return present, missing

def inspect(url, timeout=10):
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    print()
    print(bold("  inspect-http v0.1.0"))
    print(dim("  " + hr()))
    print()
    t_start = time.perf_counter()
    try:
        req = Request(url, headers={"User-Agent": "inspect-http/0.1.0"})
        with urlopen(req, timeout=timeout) as r:
            t_ttfb = time.perf_counter()
            body = r.read()
            t_end = time.perf_counter()
            status = r.status
            headers = dict(r.headers)
            final_url = r.geturl()
    except HTTPError as e:
        print(f"  {red('HTTP error')}: {e.code} {e.reason}")
        sys.exit(1)
    except URLError as e:
        print(f"  {red('Connection error')}: {e.reason}")
        sys.exit(1)
    except socket.timeout:
        print(f"  {red('Timed out')} after {timeout}s")
        sys.exit(1)
    total = t_end - t_start
    ttfb = t_ttfb - t_start
    rows = [
        ("URL", final_url),
        ("Status", status_colour(status)),
        ("Time", fmt_ms(total)),
        ("Size", fmt_bytes(len(body))),
        ("Server", headers.get("Server", dim("(not disclosed)"))),
        ("Content", headers.get("Content-Type", dim("(none)"))),
        ("Encoding", headers.get("Content-Encoding", dim("(none)"))),
    ]
    for label, val in rows:
        print(f"  {bold(label.ljust(11))} {val}")
    print()
    print(f"  {blue('Timing')}")
    print(f"    TTFB      {fmt_ms(ttfb)}")
    print(f"    Total     {fmt_ms(total)}")
    print()
    print(f"  {blue('Redirects')}")
    if final_url != url:
        print(f"    {url} -> {final_url}")
    else:
        print(f"    {dim('(none)')}")
    present, missing = header_report(headers)
    print()
    print(f"  {blue('Security Headers')}")
    for h in present:
        print(f"    {green('+')} {h}")
    for h in missing:
        print(f"    {red('-')} {h} {dim('(missing)')}")
    print()

def main():
    parser = argparse.ArgumentParser(
        prog="inspect-http",
        description="Inspect an HTTP response: status, headers, timing, security.")
    parser.add_argument("url", help="URL to inspect")
    parser.add_argument("-t", "--timeout", type=int, default=10,
                        help="Timeout in seconds (default: 10)")
    args = parser.parse_args()
    inspect(args.url, timeout=args.timeout)

if __name__ == "__main__":
    main()