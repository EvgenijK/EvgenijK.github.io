(() => {
  window.TomeNetPrototype.createGameMenuFeature = ({$,windowManager,openMessages,openMiniMap}) => {
    const overlay = $("#gameMenuOverlay");
    const menu = $("#gameMenuWindow");
    const shortcut = $("#gameMenuShortcut");
    const closeButton = $("#gameMenuClose");
    const status = $("#gameMenuStatus");
    const entries = [...menu.querySelectorAll("[data-game-menu-entry]")];
    const actions = {messages:openMessages,"mini-map":openMiniMap};
    const defaultIndex = Math.max(0,entries.findIndex(entry => entry.dataset.gameMenuEntry === "messages"));
    let selectedIndex = defaultIndex;

    function isOpen() { return windowManager.has("game-menu"); }
    function selectedEntry() { return entries[selectedIndex] || entries[0]; }
    function setStatus(text,unavailable=false) {
      status.textContent = text;
      status.classList.toggle("is-unavailable",unavailable);
    }
    function select(index,{focus=true}={}) {
      selectedIndex = (index + entries.length) % entries.length;
      entries.forEach((entry,entryIndex) => {
        const active = entryIndex === selectedIndex;
        entry.classList.toggle("is-selected",active);
        entry.tabIndex = active ? 0 : -1;
      });
      const entry = selectedEntry();
      const label = entry.querySelector("span")?.textContent || "This section";
      const unavailable = entry.getAttribute("aria-disabled") === "true";
      setStatus(unavailable
        ? `${label} is planned but not implemented in this prototype iteration.`
        : `${label} is available. Press Enter to open.`,unavailable);
      entry.scrollIntoView({block:"nearest"});
      if (focus) entry.focus();
    }
    function restoreFocus() {
      if (isOpen()) requestAnimationFrame(() => select(selectedIndex));
    }
    function showWindow() {
      selectedIndex = defaultIndex;
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      shortcut.setAttribute("aria-expanded","true");
      requestAnimationFrame(() => select(defaultIndex));
    }
    function hideWindow() {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      shortcut.setAttribute("aria-expanded","false");
    }

    windowManager.register({
      kind:"game-menu",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:selectedEntry,onOpen:showWindow,onClose:hideWindow
    });

    function openWindow(opener=shortcut) {
      if (isOpen()) return windowManager.closeKind("game-menu");
      return windowManager.open("game-menu",{},{opener});
    }
    function closeWindow() { return windowManager.closeKind("game-menu"); }
    function activate(entry=selectedEntry()) {
      const index = entries.indexOf(entry);
      if (index >= 0) select(index);
      const action = actions[entry.dataset.gameMenuEntry];
      if (!action || entry.getAttribute("aria-disabled") === "true") {
        return true;
      }
      action(shortcut);
      return true;
    }
    function trapFocus() {
      const entry = selectedEntry();
      const target = document.activeElement === closeButton ? entry : closeButton;
      target.focus();
    }
    function handleKeydown(event) {
      const editing = event.target.matches?.("input, textarea, select, [contenteditable='true']");
      if (!isOpen()) {
        if (event.key !== "Escape" || editing || windowManager.gameplayBlocked()) return false;
        openWindow(shortcut);
        return true;
      }
      if (editing) return false;
      if (event.key === ":" && !event.ctrlKey && !event.altKey && !event.metaKey) return false;
      if (event.key === "Escape") { closeWindow();return true; }
      if (event.key === "ArrowDown" || event.key === "2") { select(selectedIndex+1);return true; }
      if (event.key === "ArrowUp" || event.key === "8") { select(selectedIndex-1);return true; }
      if (event.key === "Home") { select(0);return true; }
      if (event.key === "End") { select(entries.length-1);return true; }
      if (event.key === "Enter" || event.key === " ") return activate();
      if (event.key === "Tab") { trapFocus();return true; }
      if (!event.ctrlKey && !event.altKey && !event.metaKey) {
        const index = entries.findIndex(entry => entry.dataset.gameMenuKey === event.key.toLowerCase());
        if (index >= 0) return activate(entries[index]);
      }
      return true;
    }

    shortcut.addEventListener("click",event => openWindow(event.currentTarget));
    closeButton.addEventListener("click",closeWindow);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeWindow(); });
    menu.addEventListener("click",event => {
      const entry = event.target.closest("[data-game-menu-entry]");
      if (entry) activate(entry);
    });
    menu.addEventListener("focusin",event => {
      const entry = event.target.closest("[data-game-menu-entry]");
      if (entry) select(entries.indexOf(entry),{focus:false});
    });

    return {openWindow,closeWindow,isOpen,handleKeydown,restoreFocus};
  };
})();
