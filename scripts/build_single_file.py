from __future__ import annotations

import argparse
import re
from pathlib import Path


def inline_assets(index_html: str, css: str, data_js: str, app_js: str) -> str:
    html = index_html
    html = re.sub(
        r'<link rel="manifest" href="\.\/manifest\.webmanifest(?:\?v=[^"]+)?" />\s*',
        "",
        html,
    )
    html = re.sub(
        r'<link rel="icon" href="\.\/icon\.svg(?:\?v=[^"]+)?" type="image/svg\+xml" />\s*',
        "",
        html,
    )
    html = re.sub(
        r'<link rel="stylesheet" href="\.\/styles\.css(?:\?v=[^"]+)?" />',
        lambda _: "<style>\n" + css + "\n</style>",
        html,
    )
    html = re.sub(
        r'<script src="\.\/data\.js(?:\?v=[^"]+)?"></script>\s*<script src="\.\/app\.js(?:\?v=[^"]+)?"></script>',
        lambda _: "<script>\n"
        + data_js
        + "\n</script>\n<script>\n"
        + app_js
        + "\n</script>",
        html,
    )
    return html


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a single-file mobile HTML bundle.")
    parser.add_argument(
        "--app-dir",
        default=r"D:\Development\thai_phrase_web\app",
        help="Directory containing index.html, styles.css, data.js, app.js",
    )
    parser.add_argument(
        "--output",
        default=r"D:\Development\thai_phrase_web\dist\thai-pocketbook-mobile.html",
        help="Path to the generated standalone HTML file",
    )
    args = parser.parse_args()

    app_dir = Path(args.app_dir)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    index_html = (app_dir / "index.html").read_text(encoding="utf-8")
    css = (app_dir / "styles.css").read_text(encoding="utf-8")
    data_js = (app_dir / "data.js").read_text(encoding="utf-8")
    app_js = (app_dir / "app.js").read_text(encoding="utf-8")

    bundled = inline_assets(index_html, css, data_js, app_js)
    output_path.write_text(bundled, encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
