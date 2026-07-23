import { createRoot } from "react-dom/client";
import { App } from "./app.js";

const root = createRoot(
  document.querySelector("#app-container") as HTMLElement,
);
document.body.classList.add("bg-[#1F2335]");
document.body.classList.add("text-slate-100");
root.render(<App />);
