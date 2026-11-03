#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
files=("index.html" "books.js" "n2-novel.html" "n2-novel.css" "n2-novel.js" "n2-novel-plan.js" "n2-vocab-1160.js" "books/n2/vocab/ngay-mai-bi-rao-ban.webp")
for n in 1 2 3 4 5 6 7 8; do files+=("n2-novel-part${n}.js"); done
for path in "${files[@]}"; do
  status="000"
  for attempt in 1 2 3 4 5 6; do
    status="$(curl -L --retry 1 --max-time 22 -s -o "/tmp/n2-${path//\//_}" -w "%{http_code}" "${BASE}/${path}")"
    if [[ "$status" == "200" ]]; then break; fi
    sleep 5
  done
  echo "$path HTTP $status"
  [[ "$status" == "200" ]] || exit 1
done
grep -q "n2-novel-part8.js" /tmp/n2-n2-novel.html
grep -q "64/64" /tmp/n2-books.js
grep -q "window.N2_NOVEL.published.push" /tmp/n2-n2-novel-part8.js
[[ "$(wc -c </tmp/n2-books_n2_vocab_ngay-mai-bi-rao-ban.webp)" -gt 50000 ]]
echo "PASS: N2 book, 64 chapter files, vocabulary and cover served from GitHub Pages."
