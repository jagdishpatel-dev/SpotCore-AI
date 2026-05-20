#!/usr/bin/env sh
# Remove macOS/iCloud "file 2.ext" duplicates (sync conflict copies).
set -e
root="$(cd "$(dirname "$0")/.." && pwd)"
paths=$(mktemp)
trap 'rm -f "$paths"' EXIT

collect() {
  dir=$1
  shift
  [ -d "$dir" ] || return 0
  # shellcheck disable=SC2086
  find "$dir" "$@" \( \
    -name '* 2' -o -name '* 2.*' \
    -o -name '* 3' -o -name '* 3.*' \
    -o -name '* 4' -o -name '* 4.*' \
  \) -print0 2>/dev/null >> "$paths"
}

collect "$root/src"
collect "$root/.svelte-kit"
collect "$root/node_modules/.vite"
collect "$root/node_modules" -maxdepth 6

# Discourage iCloud from syncing heavy generated trees (harmless if not on iCloud)
for dir in "$root/node_modules" "$root/.svelte-kit"; do
  mkdir -p "$dir"
  : > "$dir/.nosync"
done

if [ ! -s "$paths" ]; then
  exit 0
fi

count=0
while IFS= read -r -d '' path; do
  rm -rf "$path"
  echo "removed: ${path#"$root/"}"
  count=$((count + 1))
done < "$paths"
echo "Removed $count macOS duplicate(s)."
