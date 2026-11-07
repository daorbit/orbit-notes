import { createElement } from "./floaterDom";
import { startFloaterController } from "./floaterController";
import floaterStyles from "./floater.css?inline";

const HOST_TAG = "orbit-notes-floaters";

document.querySelector(HOST_TAG)?.remove();

const host = document.createElement(HOST_TAG);
const shadow = host.attachShadow({ mode: "closed" });
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(floaterStyles);
shadow.adoptedStyleSheets = [styleSheet];

const stack = createElement("div", "stack");
stack.setAttribute("role", "complementary");
stack.setAttribute("aria-label", "Important notes");

const announcer = createElement("div", "visuallyHidden");
announcer.setAttribute("role", "status");

shadow.append(stack, announcer);

startFloaterController({ host, shadow, stack, announcer });
