#!/usr/bin/env python3
"""Sync trove widget sources into stormej.me MDX CopyFile blocks."""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

TROVE_DIR = Path(os.environ.get("TROVE_DIR", Path.home() / "dev/experiments/trove"))
SITE_DIR = Path(__file__).resolve().parent.parent

COMPONENTS = [
    {
        "slug": "app-toast",
        "src": "lib/src/core/ui/toast/app_toast.dart",
        "mdx": "content/trove/app-toast.mdx",
        "copy_name": "app_toast.dart",
        "source_file": "lib/app_toast.dart",
    },
    {
        "slug": "app-button",
        "src": "lib/src/core/ui/widgets/app_button/app_button.dart",
        "mdx": "content/trove/app-button.mdx",
        "copy_name": "app_button.dart",
        "source_file": "lib/app_button.dart",
    },
    {
        "slug": "app-popup",
        "src": "lib/src/core/ui/widgets/app_popup/app_popup.dart",
        "mdx": "content/trove/app-popup.mdx",
        "copy_name": "app_popup.dart",
        "source_file": "lib/app_popup.dart",
    },
    {
        "slug": "app-dialog",
        "src": "lib/src/core/ui/widgets/app_dialog/app_dialog.dart",
        "mdx": "content/trove/app-dialog.mdx",
        "copy_name": "app_dialog.dart",
        "source_file": "lib/app_dialog.dart",
    },
    {
        "slug": "app-text-field",
        "src": "lib/src/core/ui/widgets/app_text_field/app_text_field.dart",
        "mdx": "content/trove/app-text-field.mdx",
        "copy_name": "app_text_field.dart",
        "source_file": "lib/app_text_field.dart",
    },
    {
        "slug": "app-selectable-chip",
        "src": "lib/src/core/ui/widgets/app_selectable_chip/app_selectable_chip.dart",
        "mdx": "content/trove/app-selectable-chip.mdx",
        "copy_name": "app_selectable_chip.dart",
        "source_file": "lib/app_selectable_chip.dart",
    },
    {
        "slug": "app-progress-bar",
        "src": "lib/src/core/ui/widgets/app_progress_bar/app_progress_bar.dart",
        "mdx": "content/trove/app-progress-bar.mdx",
        "copy_name": "app_progress_bar.dart",
        "source_file": "lib/app_progress_bar.dart",
    },
    {
        "slug": "app-spinner",
        "src": "lib/src/core/ui/widgets/app_spinner/app_spinner.dart",
        "mdx": "content/trove/app-spinner.mdx",
        "copy_name": "app_spinner.dart",
        "source_file": "lib/app_spinner.dart",
    },
    {
        "slug": "app-header",
        "src": "lib/src/core/ui/widgets/app_header/app_header.dart",
        "mdx": "content/trove/app-header.mdx",
        "copy_name": "app_header.dart",
        "source_file": "lib/app_header.dart",
    },
    {
        "slug": "app-bottom-sheet",
        "src": "lib/src/core/ui/widgets/app_bottom_sheet/app_bottom_sheet.dart",
        "mdx": "content/trove/app-bottom-sheet.mdx",
        "copy_name": "app_bottom_sheet.dart",
        "source_file": "lib/app_bottom_sheet.dart",
    },
]


def line_count(text: str) -> int:
    if not text:
        return 0
    return text.count("\n") + (0 if text.endswith("\n") else 1)


def sync_copy_block(mdx: str, copy_name: str, source: str) -> str:
    lines = line_count(source)
    mdx = re.sub(r"^lines: \d+$", f"lines: {lines}", mdx, count=1, flags=re.MULTILINE)
    mdx = re.sub(
        rf'(<CopyFile name="{re.escape(copy_name)}" lines=\{{)\d+(\}}>)',
        rf"\g<1>{lines}\2",
        mdx,
        count=1,
    )

    pattern = (
        rf'(<CopyFile name="{re.escape(copy_name)}" lines=\{{\d+\}}>\s*\n```dart\n)'
        rf"(.*?)"
        rf"(\n```\s*\n</CopyFile>)"
    )

    def repl(match: re.Match[str]) -> str:
        return f"{match.group(1)}{source.rstrip()}{match.group(3)}"

    updated, count = re.subn(pattern, repl, mdx, count=1, flags=re.DOTALL)
    if count != 1:
        raise RuntimeError(f"CopyFile block for {copy_name} not found or ambiguous")
    return updated


def sync_component(comp: dict) -> None:
    src_path = TROVE_DIR / comp["src"]
    mdx_path = SITE_DIR / comp["mdx"]
    if not src_path.is_file():
        raise FileNotFoundError(src_path)
    if not mdx_path.is_file():
        raise FileNotFoundError(mdx_path)

    source = src_path.read_text()
    mdx = mdx_path.read_text()
    updated = sync_copy_block(mdx, comp["copy_name"], source)
    mdx_path.write_text(updated)
    print(f"synced {comp['slug']}: {line_count(source)} lines")


def main() -> int:
    if not TROVE_DIR.is_dir():
        print(f"trove repo not found at {TROVE_DIR}", file=sys.stderr)
        return 1

    slugs = sys.argv[1:] or [c["slug"] for c in COMPONENTS]
    by_slug = {c["slug"]: c for c in COMPONENTS}

    for slug in slugs:
        comp = by_slug.get(slug)
        if comp is None:
            print(f"unknown slug '{slug}'", file=sys.stderr)
            return 1
        sync_component(comp)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
