# Direct homepage access and mobile tools menu

## What will change
- Remove the first-visit light/dark choice so every visitor opens directly on the homepage.
- Keep the theme button in the header and default new visitors to their device’s preferred appearance.
- Add a compact menu button on the right side of the mobile header.
- Open a right-side tools panel with search, grouped tool links, and quick links to the full tools page, instructions, and privacy page.
- Refine the mobile header and homepage spacing so controls and content fit cleanly on narrow screens.

## Technical details
- Replace the blocking theme gate with a non-blocking theme initializer that remembers later changes.
- Reuse the existing tools catalogue and right-side sheet component; no new data collection or server work.
- Validate the homepage in both mobile and desktop sizes and check the current build status.
