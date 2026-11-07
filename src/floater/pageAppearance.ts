export type PageAppearance = "light" | "dark";

const OPAQUE_ALPHA = 0.5;
const DARK_LUMINANCE = 0.4;
const MEDIA_TAGS = new Set(["IMG", "VIDEO", "CANVAS", "PICTURE", "IFRAME", "EMBED", "OBJECT"]);

function getSystemAppearance(): PageAppearance {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function parseColor(value: string): { luminance: number; alpha: number } | null {
  const match = value.match(/rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[,/ ]+([\d.]+))?\)/);
  if (!match) return null;
  const [red, green, blue] = match.slice(1, 4).map(Number);
  return {
    luminance: (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255,
    alpha: match[4] === undefined ? 1 : Number(match[4]),
  };
}

function getCanvasAppearance(): PageAppearance {
  const scheme = getComputedStyle(document.documentElement).colorScheme;
  return scheme.includes("dark") && !scheme.includes("light") ? "dark" : "light";
}

export function detectPageAppearance(host: Element, point: { x: number; y: number }): PageAppearance {
  for (const element of document.elementsFromPoint(point.x, point.y)) {
    if (element === host) continue;
    if (MEDIA_TAGS.has(element.tagName)) return getSystemAppearance();

    const style = getComputedStyle(element);
    if (style.backgroundImage !== "none") return getSystemAppearance();

    const color = parseColor(style.backgroundColor);
    if (color && color.alpha >= OPAQUE_ALPHA) return color.luminance < DARK_LUMINANCE ? "dark" : "light";
  }
  return getCanvasAppearance();
}
