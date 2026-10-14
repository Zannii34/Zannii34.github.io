# PyServe - HTTP Server from Scratch

A production-grade HTTP/1.1 server built with raw Python sockets. Thread pool, middleware chain, rate limiting, gzip, caching, live stats.

## The problem

I wanted to understand what happens between socket.accept() and a Flask view function. Frameworks hide too much. Building one from scratch was the fastest way to learn the tradeoffs.

## What it does

- HTTP/1.1 request parsing
- Thread pool for concurrent request handling
- Middleware chain (logging, auth, rate limiting, compression)
- Gzip compression of responses
- In-memory response cache with TTL
- Live stats endpoint
- 20 unit tests
- Docker image

## Technical decisions

- Raw sockets over asyncio: wanted to understand blocking I/O first.
- Thread pool over per-request threads: predictable resource usage.
- Custom middleware over decorators only: decorators are sugar over a chain.
- No framework: the point is to see the framework.

## What would I change at scale?

- HTTP/1.1 keep-alive is implemented but barely tested
- No HTTP/2 or TLS
- Response cache has no eviction policy

## What I learned

Writing an HTTP server taught me more about Python socket and threading modules in two weeks than two years of frameworks. Biggest surprise: most complexity is in error handling, not the happy path.

## License

MIT
