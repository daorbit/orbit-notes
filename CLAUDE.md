# Orbit Notes

Notes app that runs in the browser's native side panel (Chrome `sidePanel` API, Manifest V3). Built with Vite, React, TypeScript, and Mantine, using CRXJS to bundle the extension. It follows the same project structure as `../orbit-ai-extension` but has its own identity, so don't reuse Orbit AI's mascot or colors.

Notes are plain text and stored only on the device, in `chrome.storage.local`.

## Commands

- `npm run dev`: start Vite on port 5175 with HMR.
- `npm run build`: typecheck, then produce the production extension in `dist/`.
- `npm run typecheck`: run `tsc -b` only.
- `npm run lint`: run oxlint.

To load the extension, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist/`. Selecting the repo root fails because the manifest only exists in `dist/`.

## Structure

- `manifest.config.ts`: source of truth for the manifest, compiled to `dist/manifest.json`. The version comes from `package.json`. Do not add a static `manifest.json`.
- `src/background/service-worker.ts`: opens the side panel from the toolbar icon and the `Alt+Shift+N` command.
- `src/panel/`: side panel entry and `App`, which owns navigation and the delete flow.
- `src/notes/`: the notes feature.
  - `useNotes.ts`: note state and mutations. Each mutation writes to storage before updating state.
  - `noteStorage.ts`, `noteDraftStorage.ts`: the only modules that touch `chrome.storage`.
  - `useDraftPersistence.ts`: keeps unsaved editor text so closing the panel doesn't lose it.
  - `noteSelectors.ts`, `formatNoteDate.ts`: pure helpers for titles, search, grouping, and dates.
  - `components/`: the list, detail, and editor screens.
- `src/ui/`: reusable components with no notes knowledge (`TopBar`, `ActionButton`, `IconButton`, `IconAction`, `ConfirmDialog`, `EmptyState`).
- `public/icons/`: `icon.svg` is the source artwork. Re-render the PNG sizes whenever it changes.
- `src/shared/notify.ts`: toast messages.
- `src/app/`: the Mantine `theme.ts` and the design tokens in `tokens.css`.

Import from `src` with the `@/` alias, for example `@/ui/PrimaryButton`.

## Note flow

Keep this flow intact. Notes never save implicitly.

1. **List** is the home screen. It has New note, search, and a `...` menu on each row with Edit, Pin, and Delete.
2. **Detail** opens when a row is clicked. It is read-only, with Back, Pin, Delete, and Edit.
3. **Editor** opens only from New note or Edit. Changes persist only through **Save** (`Ctrl+Enter` also works). **Cancel** or `Esc` asks for confirmation when there are unsaved changes.
4. **Delete** always asks for confirmation through `ConfirmDialog`, from the list or the detail screen.

After Save, the app shows the saved note on the detail screen. If the panel closes mid-edit, the draft reopens in the editor, and it is still unsaved until the user presses Save.

## Design system

The UI follows Apple's Human Interface Guidelines: inset grouped lists, a large screen title, a plain writing page, and compact alerts. Mantine supplies behavior (`Modal`, `Menu`, `Tooltip`, `ScrollArea`, `Notifications`). Buttons and fields are our own components in `src/ui/`, so Mantine's inline color variables can't override their colors.

- **Colors:** use the tokens in `tokens.css`, with light and dark values for each. Text needs at least 4.5:1 against its background, in both themes. Check the rendered result, not just the values.
- **Highlighter amber:** the signature color, drawn from a highlighter pen. It is for the one primary action per screen (`ActionButton`), search matches, selection, the caret, and focus rings. Don't use it for decoration.
- **Controls:** 20px at the smallest. Icons come from `lucide-react`. Use `IconAction` for icon-only buttons so each one has a label and tooltip.
- **Motion:** keep it brief and honor `prefers-reduced-motion`.
- **Appearance:** follow the system light or dark setting. Don't add an in-app theme switch.
- **Labels:** use sentence case ("New note"), and keep an action's name consistent ("Delete" leads to "Note deleted").

## Conventions

- Style components with CSS Modules (`name.module.css`) next to the component. Don't use inline styles or CSS comments.
- The service worker can be stopped at any time, so do not keep state in its module variables.
- Call `chrome.sidePanel.open()` synchronously inside the user gesture, or Chrome rejects it.
- Request only the permissions a feature needs, and add them in `manifest.config.ts`.
- Do not commit secrets. `.env` is gitignored.

## Related

`../orbit-ai-extension` uses the same stack. Check it for existing patterns before adding new ones, but it is a separate package, so copy code rather than importing across repos.
