# Orbit Notes

Chrome extension (Manifest V3) for taking notes in the browser side panel. Built with Vite, React, and TypeScript, using CRXJS to bundle the extension.

## Commands

- `npm run dev`: start Vite on port 5175 with HMR. Load `dist/` as an unpacked extension.
- `npm run build`: typecheck, then produce the production extension in `dist/`.
- `npm run typecheck`: run `tsc -b` only.
- `npm run lint`: run oxlint.

To load the extension, open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select `dist/`.

## Structure

- `manifest.config.ts`: source of truth for the manifest. The version comes from `package.json`. Do not add a static `manifest.json`.
- `src/background/service-worker.ts`: MV3 service worker. It opens the side panel when the toolbar icon is clicked.
- `src/panel/`: side panel entry (`index.html`, `main.tsx`) and root `App` component.
- `src/app/tokens.css`: global design tokens and base styles, with light and dark values.
- `public/icons/`: extension icons, referenced from the manifest.

Import from `src` with the `@/` alias, for example `@/app/tokens.css`.

## Conventions

- Style components with CSS Modules (`name.module.css`) next to the component, using variables from `tokens.css`.
- The service worker can be stopped at any time, so do not keep state in its module variables. Persist data with `chrome.storage`.
- Keep `chrome.*` calls in small helper modules or hooks instead of calling them directly from UI components.
- Request only the permissions a feature needs, and add them in `manifest.config.ts`.
- Do not commit secrets. `.env` is gitignored.

## Related

`../orbit-ai-extension` uses the same stack. Check it for existing patterns before adding new ones, but it is a separate package, so copy code rather than importing across repos.
