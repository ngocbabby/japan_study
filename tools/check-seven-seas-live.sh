#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
files=("index.html" "books.js" "seven-seas-book.html" "seven-seas-book.css" "seven-seas-book.js" "seven-seas-part1.js" "seven-seas-plan.js" "n2-vocab-1160.js" "books/n2/vocab/hai-dang-bay-vung-bien-cam.webp")
for file in "${files[@]}"; do
 code=000
 for attempt in 1 2 3 4 5 6; do
  code="$(curl -L --retry 1 --max-time 25 -s -o "/tmp/sea-${file//\//_}" -w '%{http_code}' "$BASE/$file")"
  if [[ "$code" == 200 ]]; then break; fi
  sleep 6
 done
 echo "$file HTTP $code"
 [[ "$code" == 200 ]] || exit 1
done
grep -q 'seven-seas-part1.js' /tmp/sea-seven-seas-book.html
grep -q 'hai-dang-bay-vung-bien-cam.webp' /tmp/sea-seven-seas-book.js
grep -q 'seven-seas-book.html' /tmp/sea-books.js
[[ "$(wc -c </tmp/sea-books_n2_vocab_hai-dang-bay-vung-bien-cam.webp)" -gt 30000 ]]
echo 'PUBLIC SEVEN SEAS BOOK ASSETS PASS'