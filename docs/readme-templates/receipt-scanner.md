# Receipt Scanner with VAT Tracking

Scan or upload receipts, extract merchant / total / VAT / date using Tesseract OCR, group receipts into lists for tax reporting.

## The problem

Small business owners and freelancers in South Africa need VAT-compliant records. Manually typing receipts into a spreadsheet is slow and error-prone. I wanted a phone-camera-first tool that extracted the fields automatically.

## What it does

- Capture via device camera (getUserMedia) or upload a file
- OCR extraction with Tesseract
- Auto-categorisation of merchant and expense type
- Group receipts into named lists
- Per-list VAT summary for tax reporting

## Technical decisions

- Tesseract over cloud OCR: free, offline, no vendor lock-in. Slightly worse on stylised receipts.
- Flask backend over pure client-side: Tesseract runs better server-side, and file uploads need a stable endpoint.
- Chart.js for the VAT summary: right size for 3-4 charts.

## What would I change at scale?

- Tesseract struggles with faded thermal-printed receipts
- Human-in-the-loop correction would improve data quality
- Persist the OCR confidence score per field

## What I learned

OCR is not solved at the edges. Typed receipts work great. Thermal receipts from a corner shop? I spent more time on preprocessing (grayscale, contrast, deskew) than on extraction.

## License

MIT
