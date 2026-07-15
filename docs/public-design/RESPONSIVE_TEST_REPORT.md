# Responsive Test Report

## Target widths

360 · 390 · 430 · 768 · 1024 · 1280 · 1440 · 1600

## Verified in implementation (code-level)

- Full-bleed sections + `.pub-container`
- Header sticky; mobile drawer with Escape + body scroll lock
- Contact info grid + tabs collapse to single column ≤900px
- Wizard time-slot grid wraps; date input native mobile
- Footer grid stacks ≤560px

## Manual / Playwright status

| Check | Result |
|-------|--------|
| Automated breakpoint screenshots | **Not run** (Playwright suite scaffolding pending runner install) |
| Visual overflow audit | **Pending** live browser pass |
| French label overflow | **Pending** live browser pass |

Do not treat this document as full device sign-off until a live responsive pass is recorded.
