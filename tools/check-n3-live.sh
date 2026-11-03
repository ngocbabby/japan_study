#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
for path in "index.html" "n3-book.html" "n3-book.js" "n3-story-part5.js" "n3-source-ledger.json"; do
  status="$(curl --retry 2 --max-time 25 -s -o "/tmp/n3-${path//\//_}" -w "%{http_code}" "${BASE}/${path}")"
  echo "${path}: HTTP ${status}"
  test "${status}" = "200" || exit 1
done
grep -q "n3-story-part5.js" /tmp/n3-n3-book.html
grep -q "data-mode" /tmp/n3-n3-book.js
grep -q '"actualRows":879' /tmp/n3-n3-source-ledger.json
echo "PUBLIC SITE N3 ASSETS VERIFIED"
