#!/usr/bin/env bash
# Rebuilds the flutter web demo embedded on /trove/app-toast.
#
# Run this whenever app_toast.dart changes, otherwise the live demo drifts from
# the source shown on the page.
#
#   ./scripts/build-trove-demo.sh
#
# Set TROVE_DIR if the flutter repo lives somewhere else.

set -euo pipefail

TROVE_DIR="${TROVE_DIR:-$HOME/dev/experiments/trove}"
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$SITE_DIR/public/trove/demo/app-toast"
BASE_HREF="/trove/demo/app-toast/"

if [ ! -d "$TROVE_DIR" ]; then
  echo "trove repo not found at $TROVE_DIR (set TROVE_DIR)" >&2
  exit 1
fi

echo "building flutter web demo from $TROVE_DIR"
cd "$TROVE_DIR"
flutter build web --release \
  --target lib/demo_main.dart \
  --base-href "$BASE_HREF"

echo "copying to $OUT_DIR"
rm -rf "$OUT_DIR"
mkdir -p "$(dirname "$OUT_DIR")"
cp -R "$TROVE_DIR/build/web" "$OUT_DIR"

cd "$OUT_DIR"

# canvaskit is fetched from the gstatic CDN at runtime, so the local copy is
# ~37MB of dead weight.
rm -rf canvaskit

# The demo uses the ambient font. Dropping the app's font assets saves ~2.8MB,
# but flutter preloads every family in FontManifest.json, so prune that too or
# the console fills with 404s.
rm -rf assets/assets/fonts
python3 - <<'PY'
import json

path = "assets/FontManifest.json"
keep = {"MaterialIcons", "packages/cupertino_icons/CupertinoIcons"}
families = json.load(open(path))
json.dump([f for f in families if f["family"] in keep], open(path, "w"))
PY

echo "done: $(du -sh "$OUT_DIR" | cut -f1)"
