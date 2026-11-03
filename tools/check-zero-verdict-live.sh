#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
files=("index.html" "books.js" "zero-verdict-book.html" "zero-verdict-book.css" "zero-verdict-deluxe.css" "zero-verdict-book.js" "zero-verdict-plan.js" "n2-vocab-1160.js" "books/n2/vocab/zero-cover-cinematic.webp" "books/n2/vocab/zero-courthouse-rain.webp" "books/n2/vocab/zero-courtroom-interior.webp")
for n in 1 2 3 4 5 6 7 8; do files+=("zero-verdict-part${n}.js" "books/n2/vocab/zero-scene-${n}.svg"); done
for file in "${files[@]}"; do
 code="000"
 target="/tmp/zero-${file//\//_}"
 for attempt in 1 2 3 4 5 6 7 8; do
   code="$(curl -L --retry 1 --max-time 25 -s -o "$target" -w '%{http_code}' "$BASE/$file?v=zero-64")"
   if [[ "$code" == "200" ]]; then break; fi
   sleep 8
 done
 echo "$file HTTP $code"
 [[ "$code" == "200" ]] || exit 1
done
grep -q 'zero-verdict-part8.js' /tmp/zero-zero-verdict-book.html
grep -q 'zero-verdict-deluxe.css' /tmp/zero-zero-verdict-book.html
grep -q 'zero-verdict-book.js' /tmp/zero-zero-verdict-book.html
grep -q 'zero-verdict-book.html' /tmp/zero-books.js
grep -q 'BẢN ÁN SỐ KHÔNG' /tmp/zero-zero-verdict-book.js
grep -q 'Khi đồng hồ chỉ 00:01' /tmp/zero-zero-verdict-part8.js
grep -q 'window.ZERO_VERDICT_PLAN' /tmp/zero-zero-verdict-plan.js
[[ "$(wc -c </tmp/zero-books_n2_vocab_zero-cover-cinematic.webp)" -gt 2500 ]]
echo "LIVE PUBLIC ZERO VERDICT NOVEL PASS — all 64 chapters and cover published"
