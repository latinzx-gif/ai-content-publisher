#!/usr/bin/env python3
"""Extract named functions from page.tsx into target files (verbatim body)."""

from __future__ import annotations

import re
import sys
from pathlib import Path

PAGE = Path("src/app/page.tsx")


def find_function_block(lines: list[str], name: str) -> tuple[int, int] | None:
    start = None
    for i, line in enumerate(lines):
        if re.match(rf"^function {re.escape(name)}\b", line):
            start = i
            break
    if start is None:
        return None

    depth = 0
    started = False
    for i in range(start, len(lines)):
        for ch in lines[i]:
            if ch == "{":
                depth += 1
                started = True
            elif ch == "}":
                depth -= 1
                if started and depth == 0:
                    return start, i
    return None


def extract_functions(names: list[str]) -> dict[str, str]:
    text = PAGE.read_text()
    lines = text.splitlines(keepends=True)
    out: dict[str, str] = {}
    for name in names:
        span = find_function_block(lines, name)
        if not span:
            raise SystemExit(f"function not found: {name}")
        s, e = span
        body = "".join(lines[s : e + 1])
        out[name] = body
    return out


def remove_functions(names: list[str]) -> None:
    text = PAGE.read_text()
    lines = text.splitlines(keepends=True)
    spans: list[tuple[int, int]] = []
    for name in names:
        span = find_function_block(lines, name)
        if not span:
            raise SystemExit(f"function not found for removal: {name}")
        spans.append(span)
    for s, e in sorted(spans, reverse=True):
        del lines[s : e + 1]
        if s > 0 and lines[s - 1].strip() == "" and (s >= len(lines) or lines[s].strip() == ""):
            del lines[s - 1]
    PAGE.write_text("".join(lines))


def add_imports(imports: list[str]) -> None:
    text = PAGE.read_text()
    for imp in imports:
        if imp in text:
            continue
        anchor = "import type { AgentRuntimePreference }"
        if anchor not in text:
            raise SystemExit("import anchor not found")
        text = text.replace(anchor, f"{imp}\n{anchor}", 1)
    PAGE.write_text(text)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "extract":
        names = sys.argv[2:]
        for n, body in extract_functions(names).items():
            print(f"=== {n} ({len(body.splitlines())} lines) ===")
    elif cmd == "remove":
        remove_functions(sys.argv[2:])
    elif cmd == "add-imports":
        add_imports(sys.argv[2:])
    else:
        raise SystemExit("usage: p1-04-extract.py extract|remove|add-imports ...")
