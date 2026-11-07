import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/app/tokens.css";
import { App } from "./App";
import { isEmbedded } from "./embedding";

document.documentElement.toggleAttribute("data-embedded", isEmbedded);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
