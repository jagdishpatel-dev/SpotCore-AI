"""
Zoning corpus ingestion
=======================
Parses raw Municode text dumps (backend/app/data/zoning/<jurisdiction>/*.txt,
produced by scraping library.municode.com) into citable, section-level chunks
ready for embedding.

Each source file is the plain-text render of one "chunk group" (a subchapter
or article) as returned by the site's SPA, prefixed with a get_page_text
boilerplate header (Title:/URL:/Source element:/---) and suffixed with a
"Loading complete" marker plus repeated nav breadcrumbs — both stripped here.

The only citable unit in the Land Development Code is the "§" section, so
splitting happens on section headers (e.g. "§ 25-2-491 - PERMITTED,
CONDITIONAL, AND PROHIBITED USES.") while SUBCHAPTER / ARTICLE / Division
headers are tracked as breadcrumb context and prefixed onto every chunk
belonging to them, so a chunk is self-contained and citable on its own.
"""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data" / "zoning"

# Long sections (e.g. the permitted-use and site-development tables) are
# split further so no single embedding input is unreasonably large.
MAX_CHUNK_CHARS = 6000

_SECTION_RE = re.compile(r"^§\s*([\w.\-]+)\s*-\s*(.+?)\.?\s*$")
_SUBCHAPTER_RE = re.compile(r"^(SUBCHAPTER\s+[A-Z]\.\s*-\s*.+?)\.?\s*$")
_ARTICLE_RE = re.compile(r"^(ARTICLE\s+\d+\.\s*-\s*.+?)\.?\s*$")
_DIVISION_RE = re.compile(r"^(Division\s+\d+\.\s*-\s*.+?)\.?\s*$")
_NAV_ONLY_RE = re.compile(r"^(CHAPTER|SUBCHAPTER|ARTICLE)\s+\S.*[.:]?\s*$")


@dataclass
class ZoningChunk:
    id: str
    jurisdiction: str
    citation: str
    title: str
    subchapter: str | None
    article: str | None
    division: str | None
    text: str
    source_file: str

    def to_dict(self) -> dict:
        return asdict(self)


def _strip_footer(raw: str) -> str:
    idx = raw.find("\nLoading complete")
    if idx != -1:
        raw = raw[:idx]
    return raw


def _strip_header(lines: list[str]) -> list[str]:
    # get_page_text prefixes: "Title: ...", "URL: ...", "Source element: ...", "---"
    for i, line in enumerate(lines):
        if line.strip() == "---":
            return lines[i + 1 :]
    return lines


def _trim_trailing_nav(body_lines: list[str]) -> list[str]:
    while body_lines and (
        not body_lines[-1].strip() or _NAV_ONLY_RE.match(body_lines[-1].strip())
    ):
        body_lines.pop()
    return body_lines


def _collapse_short_line_runs(text: str, min_run: int = 4, max_line_len: int = 20) -> str:
    """
    Municode renders wide-table column headers as one value per line, each
    separated by a blank line (e.g. district codes "LA", "", "RR", "", "SF-1", ...).
    Collapse runs of 4+ such short tokens into a single comma-joined line so
    they survive chunking as usable context instead of being split away from
    the data rows that reference them.
    """
    lines = text.split("\n")
    out: list[str] = []
    i = 0
    while i < len(lines):
        tokens: list[str] = []
        j = i
        while j < len(lines):
            stripped = lines[j].strip()
            if stripped and len(stripped) <= max_line_len and "\t" not in lines[j]:
                tokens.append(stripped)
                j += 1
                if j < len(lines) and not lines[j].strip():
                    j += 1
                continue
            break
        if len(tokens) >= min_run:
            out.append(", ".join(tokens))
            i = j
        else:
            out.append(lines[i])
            i += 1
    return "\n".join(out)


def _split_long_text(header: str, text: str, max_chars: int) -> list[str]:
    """Split `text` into chunks no larger than max_chars, re-prefixing `header`
    onto every part so each is self-contained and independently citable."""
    if len(header) + 2 + len(text) <= max_chars:
        return [f"{header}\n\n{text}"]
    parts: list[str] = []
    remaining = text
    budget = max_chars - len(header) - 2
    while len(remaining) > budget:
        cut = remaining.rfind("\n", 0, budget)
        if cut < budget // 2:
            cut = budget
        parts.append(remaining[:cut].strip())
        remaining = remaining[cut:].strip()
    if remaining:
        parts.append(remaining)
    return [f"{header}\n\n(part {i + 1}/{len(parts)})\n{p}" if len(parts) > 1 else f"{header}\n\n{p}" for i, p in enumerate(parts)]


def parse_file(path: Path, jurisdiction: str) -> list[ZoningChunk]:
    raw = _strip_footer(path.read_text(encoding="utf-8"))
    lines = _strip_header(raw.splitlines())

    chunks: list[ZoningChunk] = []
    subchapter: str | None = None
    article: str | None = None
    division: str | None = None

    current_citation: str | None = None
    current_title: str | None = None
    current_body: list[str] = []

    def flush() -> None:
        nonlocal current_citation, current_title, current_body
        if current_citation is None:
            current_body = []
            return
        body_lines = _trim_trailing_nav(list(current_body))
        body_text = _collapse_short_line_runs("\n".join(body_lines).strip())
        if body_text:
            breadcrumb = " > ".join(
                b for b in (subchapter, article, division) if b
            )
            header = f"§ {current_citation} - {current_title}"
            full_header = f"{breadcrumb}\n{header}" if breadcrumb else header
            parts = _split_long_text(full_header, body_text, MAX_CHUNK_CHARS)
            for i, part in enumerate(parts):
                suffix = f":{i}" if len(parts) > 1 else ""
                chunks.append(
                    ZoningChunk(
                        id=f"{jurisdiction}:{current_citation}{suffix}",
                        jurisdiction=jurisdiction,
                        citation=current_citation,
                        title=current_title or "",
                        subchapter=subchapter,
                        article=article,
                        division=division,
                        text=part,
                        source_file=path.name,
                    )
                )
        current_citation = None
        current_title = None
        current_body = []

    for line in lines:
        stripped = line.strip()

        m = _SECTION_RE.match(stripped)
        if m:
            flush()
            current_citation, current_title = m.group(1), m.group(2)
            continue

        if _SUBCHAPTER_RE.match(stripped):
            flush()
            subchapter = _SUBCHAPTER_RE.match(stripped).group(1)
            continue
        if _ARTICLE_RE.match(stripped):
            flush()
            article = _ARTICLE_RE.match(stripped).group(1)
            division = None
            continue
        if _DIVISION_RE.match(stripped):
            flush()
            division = _DIVISION_RE.match(stripped).group(1)
            continue

        if current_citation is not None:
            current_body.append(line)

    flush()
    return chunks


def load_zoning_chunks(jurisdiction: str) -> list[ZoningChunk]:
    juris_dir = DATA_DIR / jurisdiction
    if not juris_dir.is_dir():
        return []
    chunks: list[ZoningChunk] = []
    for path in sorted(juris_dir.glob("*.txt")):
        chunks.extend(parse_file(path, jurisdiction))
    return chunks


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Parse a jurisdiction's scraped zoning text into chunks.")
    parser.add_argument("--jurisdiction", default="austin_tx")
    parser.add_argument("--dump", action="store_true", help="Print chunks as JSON instead of a summary.")
    args = parser.parse_args()

    result = load_zoning_chunks(args.jurisdiction)
    if args.dump:
        print(json.dumps([c.to_dict() for c in result], indent=2))
    else:
        print(f"{len(result)} chunks parsed for jurisdiction={args.jurisdiction!r}")
        total_chars = sum(len(c.text) for c in result)
        print(f"total text: {total_chars:,} chars, avg chunk: {total_chars // max(len(result), 1):,} chars")
        for c in result[:5]:
            print(f"  [{c.id}] {c.title[:70]}")
