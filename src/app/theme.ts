import { createTheme } from "@mantine/core";

export const theme = createTheme({
  primaryColor: "amber",
  primaryShade: { light: 6, dark: 4 },
  fontFamily: "'Inter Variable', Inter, system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
  cursorType: "pointer",
  colors: {
    amber: ["#fff8e6", "#ffefc2", "#ffe08a", "#ffd052", "#ffb224", "#fba90a", "#f5a300", "#c98500", "#8a5300", "#5f3900"],
  },
});
