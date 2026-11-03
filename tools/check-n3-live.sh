#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
for path in "index.html" "books.js" "n3-book.html" "n3-book.css" "n3-book.js" "n3-story-part5.js" "n3-source-ledger.json" "books/n3/vocab/khi-mat-troi-khong-con-moc.avif" "books/n3/vocab/khi-mat-troi-khong-con-moc-hq.avif" "books/n3/vocab/khi-mat-troi-khong-con-moc.webp"; do
  status="000"
  for attempt in 1 2 3 4 5 6 7 8; do
    status="$(curl --retry 1 --max-time 25 -s -o "/tmp/n3-${path//\//_}" -w "%{http_code}" "${BASE}/${path}")"
    echo "${path} attempt ${attempt}: HTTP ${status}"
    if [ "${status}" = "200" ]; then break; fi
    sleep 6
  done
  test "${status}" = "200" || exit 1
done
grep -q "n3-story-part5.js" /tmp/n3-n3-book.html
grep -q "data-mode" /tmp/n3-n3-book.js
grep -q '"actualRows":879' /tmp/n3-n3-source-ledger.json
echo "PUBLIC SITE N3 ASSETS VERIFIED"

grep -q 'khi-mat-troi-khong-con-moc.avif' /tmp/n3-n3-book.js
grep -q 'N3 NOVEL' /tmp/n3-n3-book.css
grep -q 'books-cover-picture' /tmp/n3-books.js
test "$(wc -c </tmp/n3-books_n3_vocab_khi-mat-troi-khong-con-moc.avif)" -gt 10000
head -c 12 /tmp/n3-books_n3_vocab_khi-mat-troi-khong-con-moc.avif | strings | grep -q 'ftyp'
echo "N3 PREMIUM COVER AVIF PRESENT ON LIVE SITE"

test "$(wc -c </tmp/n3-books_n3_vocab_khi-mat-troi-khong-con-moc-hq.avif)" -gt 90000
test "$(wc -c </tmp/n3-books_n3_vocab_khi-mat-troi-khong-con-moc.webp)" -gt 60000
head -c 12 /tmp/n3-books_n3_vocab_khi-mat-troi-khong-con-moc.webp | strings | grep -q 'RIFF'
echo "N3 HIGH-RES AND WEBP FALLBACK ART VERIFIED"
