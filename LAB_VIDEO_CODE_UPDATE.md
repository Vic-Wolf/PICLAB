# PICLAB Lab Video and Code Presentation Update

- Added the supplied YouTube demonstration link to each of Experiments 1–10.
- Added a dedicated Experiment Video section and a link in the experiment section navigation.
- Kept firmware source in the Example Code section, not in the Theory text. Code-like source lines and document headers were removed from theory paragraphs where detected; the separate `code` field remains the source of truth for the code block.
- Added a selectable `<pre><code>` source block, preserved whitespace/line breaks, and a Copy code button that copies the exact code text. A selection fallback is provided when clipboard permissions are unavailable.
- Added automated tests for all ten video URLs, theory/code separation, and the code/video UI.

Verification: `npm test` passed (24 tests); `npm run check` passed. No physical-device or live-hosting test was performed in this update.
