# Data Visualizer

Browser-based tool that turns CSV or JSON files into interactive charts. Runs entirely client-side.

## The problem

Quick data exploration usually means opening a spreadsheet or pasting data into a web tool that uploads it to a server. I wanted drag-and-drop to chart in under 5 seconds, with no data leaving the browser.

## What it does

- Drag and drop a .csv or .json file
- Choose column(s) to plot
- Bar, line, pie, or scatter chart
- Export as PNG

## Technical decisions

- Client-side only: file never leaves the browser.
- Chart.js: four chart types, small API.
- PapaParse for CSV: handles edge cases better than hand-rolled.
- No backend: GitHub Pages hosts it for free.

## What would I change at scale?

- Streaming large CSVs
- More chart types (heatmap, histogram)
- Save chart configs to localStorage

## What I learned

Client-side data tools are a category where no backend is a feature, not a limitation. Users trust tools more when they can inspect the network tab and see zero outbound requests.

## License

MIT
