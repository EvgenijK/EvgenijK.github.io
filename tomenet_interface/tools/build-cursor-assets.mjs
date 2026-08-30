import {mkdir, rm, writeFile} from "node:fs/promises";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const themes = {
  mithril:{light:"#e8f0ea",mid:"#91a69f",dark:"#111815",accent:"#43e4df",motif:"rune"},
  gondor:{light:"#d6d1bd",mid:"#6f736d",dark:"#111312",accent:"#e0ad35",danger:"#ef493d",motif:"forge"},
  mallorn:{light:"#d7c77a",mid:"#778b46",dark:"#182015",accent:"#b9d85c",motif:"leaf"},
  dunedain:{light:"#d8d5c6",mid:"#76888a",dark:"#111719",accent:"#55c9cd",motif:"compass"},
  palantir:{light:"#cbd6dc",mid:"#687079",dark:"#100f18",accent:"#a871ff",motif:"orb"}
};

function arrow(theme) {
  if (theme.motif === "leaf") return `<path d="M4 3C17 4 25 11 27 26C16 23 8 16 4 3Z" fill="${theme.mid}" stroke="${theme.dark}" stroke-width="3"/><path d="M6 5L23 23" stroke="${theme.light}" stroke-width="2"/><path d="M11 10L18 9M15 15L14 21" stroke="${theme.accent}" stroke-width="1.5"/>`;
  if (theme.motif === "compass") return `<path d="M3 2L25 16L15 18L11 28Z" fill="${theme.light}" stroke="${theme.dark}" stroke-width="3"/><path d="M6 6L15 18" stroke="${theme.mid}" stroke-width="2"/><path d="M17 11L21 15L17 17" fill="none" stroke="${theme.accent}" stroke-width="1.5"/>`;
  if (theme.motif === "orb") return `<circle cx="9" cy="9" r="6" fill="${theme.mid}" stroke="${theme.dark}" stroke-width="3"/><circle cx="9" cy="9" r="2.5" fill="${theme.accent}" stroke="${theme.light}"/><path d="M12 13L25 26L21 29L9 15Z" fill="${theme.light}" stroke="${theme.dark}" stroke-width="3"/>`;
  if (theme.motif === "forge") return `<path d="M3 2L27 13L17 17L13 28L3 2Z" fill="${theme.mid}" stroke="${theme.dark}" stroke-width="3"/><path d="M6 6L15 22M9 8L22 14" stroke="${theme.light}" stroke-width="2"/><path d="M15 16L19 20" stroke="${theme.accent}" stroke-width="2"/>`;
  return `<path d="M3 2L26 14L16 17L12 28L3 2Z" fill="${theme.light}" stroke="${theme.dark}" stroke-width="3"/><path d="M7 7L14 22" stroke="${theme.mid}" stroke-width="2"/><path d="M10 11L16 13L13 17" fill="none" stroke="${theme.accent}" stroke-width="1.7"/>`;
}

function compass(theme, target = false) {
  const danger = target && theme.danger ? theme.danger : theme.accent;
  if (theme.motif === "leaf") return `<circle cx="16" cy="16" r="8" fill="${theme.dark}" stroke="${danger}" stroke-width="2"/><path d="M7 16H25M16 7V25" stroke="${theme.light}" stroke-width="1.5"/><path d="M16 10C21 11 22 15 21 20C17 19 14 16 16 10Z" fill="${theme.mid}"/>`;
  if (theme.motif === "orb") return `<circle cx="16" cy="16" r="9" fill="${theme.dark}" stroke="${theme.light}" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="${danger}" stroke="${theme.mid}"/><path d="M16 2V8M16 24V30M2 16H8M24 16H30" stroke="${danger}" stroke-width="2"/>`;
  return `<path d="M16 2L19 12L30 16L19 20L16 30L13 20L2 16L13 12Z" fill="${theme.dark}" stroke="${theme.light}" stroke-width="2"/><circle cx="16" cy="16" r="${target ? 5 : 3}" fill="none" stroke="${danger}" stroke-width="2"/><path d="M16 7V11M16 21V25M7 16H11M21 16H25" stroke="${danger}" stroke-width="1.5"/>`;
}

function hand(theme) {
  return `<path d="M9 15V7C9 5 12 5 12 7V13V5C12 3 15 3 15 5V13V6C15 4 18 4 18 6V14V9C18 7 21 7 21 9V18C21 25 17 29 11 27C7 26 5 22 4 18C4 16 6 15 7 17L9 20" fill="${theme.mid}" stroke="${theme.dark}" stroke-width="3" stroke-linejoin="round"/><path d="M11 9H12M15 8H18M8 22C12 20 17 20 21 22" stroke="${theme.light}" stroke-width="1.5"/><circle cx="15" cy="19" r="2" fill="${theme.accent}"/>`;
}

function svg(theme, state) {
  let body = arrow(theme);
  if (state === "interactive") body += `<circle cx="24" cy="24" r="5" fill="${theme.dark}" stroke="${theme.accent}" stroke-width="2"/><path d="M21 24H27M24 21V27" stroke="${theme.light}"/>`;
  if (state === "target") body = compass(theme, true);
  if (state === "pan") body = hand(theme);
  if (state === "unavailable") body += `<path d="M7 25L26 6" stroke="${theme.dark}" stroke-width="5"/><path d="M7 25L26 6" stroke="#d04a3e" stroke-width="2.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${body}</svg>\n`;
}

for (const [name, theme] of Object.entries(themes)) {
  const directory = resolve(root, "assets/cursors", name);
  await mkdir(directory, {recursive:true});
  await rm(resolve(directory, "map.svg"), {force:true});
  for (const state of ["default","interactive","target","pan","unavailable"])
    await writeFile(resolve(directory, `${state}.svg`), svg(theme,state));
}
