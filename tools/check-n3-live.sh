#!/usr/bin/env bash
set -euo pipefail
BASE="https://ngocbabby.github.io/japan_study"
for path in "index.html" "n3-book.html" "n3-book.js" "n3-story-part5.js" "n3-source-ledger.json"; do
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
