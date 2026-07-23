#!/usr/bin/env bash
# Rebuilds a flutter web demo embedded on /trove/<slug>.
#
# Run this whenever the source file changes, otherwise the live demo drifts
# from the source shown on the page.
#
#   ./scripts/build-trove-demo.sh app-toast
#   ./scripts/build-trove-demo.sh app-button
#   ./scripts/build-trove-demo.sh app-popup
#   ./scripts/build-trove-demo.sh app-dialog
#   ./scripts/build-trove-demo.sh            # rebuilds every demo
#
# Set TROVE_DIR if the flutter repo lives somewhere else.

set -euo pipefail

TROVE_DIR="${TROVE_DIR:-$HOME/dev/experiments/trove}"
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# slug -> flutter entrypoint. add a line here when a new trove entry ships a
# demo.
demo_target() {
  case "$1" in
    app-toast) echo "lib/demo_main.dart" ;;
    app-button) echo "lib/demo_app_button.dart" ;;
    app-popup) echo "lib/demo_app_popup.dart" ;;
    app-dialog) echo "lib/demo_app_dialog.dart" ;;
    *) return 1 ;;
  esac
}

ALL_DEMOS=(app-toast app-button app-popup app-dialog)

build_demo() {
  local slug="$1"
  local target="$2"
  local out_dir="$SITE_DIR/public/trove/demo/$slug"
  local base_href="/trove/demo/$slug/"

  echo "building $slug from $TROVE_DIR ($target)"
  cd "$TROVE_DIR"
  flutter build web --release \
    --target "$target" \
    --base-href "$base_href"

  echo "copying to $out_dir"
  rm -rf "$out_dir"
  mkdir -p "$(dirname "$out_dir")"
  cp -R "$TROVE_DIR/build/web" "$out_dir"

  cd "$out_dir"

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

  echo "done: $slug is $(du -sh "$out_dir" | cut -f1)"
}

if [ ! -d "$TROVE_DIR" ]; then
  echo "trove repo not found at $TROVE_DIR (set TROVE_DIR)" >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  DEMOS=("$@")
else
  DEMOS=("${ALL_DEMOS[@]}")
fi

for SLUG in "${DEMOS[@]}"; do
  if ! TARGET="$(demo_target "$SLUG")"; then
    echo "unknown demo '$SLUG' (known: ${ALL_DEMOS[*]})" >&2
    exit 1
  fi
  build_demo "$SLUG" "$TARGET"
done
