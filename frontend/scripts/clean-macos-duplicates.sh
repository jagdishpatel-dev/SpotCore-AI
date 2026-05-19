#!/usr/bin/env sh
# Remove macOS/iCloud "file 2.ext" duplicates under src/ (breaks SvelteKit + routes).
set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
count=0
for path in $(find "$root/src" \( -name '* 2' -o -name '* 2.*' -o -name '* 3.*' -o -name '* 4.*' \) -type f 2>/dev/null); do
  rm -f "$path"
  count=$((count + 1))
  echo "removed: ${path#"$root/"}"
done
if [ "$count" -eq 0 ]; then
  echo "No macOS duplicate files in src/."
else
  echo "Removed $count duplicate file(s)."
fi
