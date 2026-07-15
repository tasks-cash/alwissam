# Accessibility Report

## Implemented

- Semantic headers/nav/footer/main structure in public chrome
- Visible focus via public CSS focus rings
- Required field indicators + `aria-invalid` / `aria-describedby` on contact form
- Mobile menu: `aria-expanded`, `aria-controls`, Escape close, scroll lock
- Contact tabs: `role="tablist"`, selected state
- FAQ preview: native `<details>` / `<summary>`
- Phone fields: `type="text"` + `inputMode="numeric"` (not `type="number"`)
- Locale `lang` + `dir` via layout/`HtmlLangDir`
- LTR isolation for phone/time/date in RTL pages

## Pending formal audit

- Full keyboard pass across all public pages
- Screen-reader walkthrough (NVDA/VoiceOver)
- Contrast measurement against WCAG AA for all soft-green combinations
- Focus trap audit if dialogs are expanded beyond mobile drawer

## Known gaps

- Some listing pages may still need dedicated loading skeleton components
- Global toast provider not yet unified across public forms
