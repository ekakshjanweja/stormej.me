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
#   ./scripts/build-trove-demo.sh app-text-field
#   ./scripts/build-trove-demo.sh app-selectable-chip
#   ./scripts/build-trove-demo.sh app-progress-bar
#   ./scripts/build-trove-demo.sh app-spinner
#   ./scripts/build-trove-demo.sh app-header
#   ./scripts/build-trove-demo.sh app-bottom-sheet
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
    app-text-field) echo "lib/demo_app_text_field.dart" ;;
    app-selectable-chip) echo "lib/demo_app_selectable_chip.dart" ;;
    app-progress-bar) echo "lib/demo_app_progress_bar.dart" ;;
    app-spinner) echo "lib/demo_app_spinner.dart" ;;
    app-header) echo "lib/demo_app_header.dart" ;;
    app-bottom-sheet) echo "lib/demo_app_bottom_sheet.dart" ;;
    *) return 1 ;;
  esac
}

ALL_DEMOS=(
  app-toast
  app-button
  app-popup
  app-dialog
  app-text-field
  app-selectable-chip
  app-progress-bar
  app-spinner
  app-header
  app-bottom-sheet
)

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

  # Demos share the trove app chrome (pixel wordmark + sans UI), so keep Geist
  # Pixel / Sans. Drop unused pixel variants and prune FontManifest so flutter
  # doesn't 404 on families we removed.
  python3 - <<'PY'
import json
import pathlib

manifest = pathlib.Path("assets/FontManifest.json")
fonts_dir = pathlib.Path("assets/assets/fonts")

keep_families = {
    "MaterialIcons",
    "packages/cupertino_icons/CupertinoIcons",
    "GeistPixel",
    "GeistSans",
}
families = json.loads(manifest.read_text())
manifest.write_text(
    json.dumps([f for f in families if f["family"] in keep_families])
)

if fonts_dir.is_dir():
    keep_files = {
        "GeistPixel-Square.ttf",
        "Geist-Regular.ttf",
        "Geist-Medium.ttf",
        "Geist-SemiBold.ttf",
        "Geist-Bold.ttf",
    }
    for path in fonts_dir.iterdir():
        if path.name not in keep_files:
            path.unlink(missing_ok=True)
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
