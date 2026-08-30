(() => {
  window.TomeNetPrototype.createCharacterWindowFeature = ({
    state,$,$$,clamp,persist,renderCharacter,setCharacterPage,CHARACTER_PAGES,windowManager,
    guideFeature,appendGameMessage,escapeHtml,CHARACTER_DATA,
    characterFieldsForPage,getSelectedCharacterField,selectCharacterField
  }) => {
    const overlay = $("#characterWindowOverlay");
    const characterWindow = $("#characterWindow");
    const content = $("#characterWindowContent");
    const shortcut = $("#characterShortcut");

    function isOpen() { return windowManager.has("character"); }
    function focusContent() { requestAnimationFrame(() => content.focus()); }
    function showWindow() {
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      shortcut.setAttribute("aria-expanded","true");
      renderCharacter();
      focusContent();
    }
    function hideWindow() {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      shortcut.setAttribute("aria-expanded","false");
    }

    windowManager.register({
      kind:"character",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:() => content,onOpen:showWindow,onClose:hideWindow
    });

    function openWindow(opener = shortcut) {
      if (isOpen()) return windowManager.closeKind("character");
      return windowManager.open("character",{}, {opener});
    }
    function closeWindow() { return windowManager.closeKind("character"); }
    function applyControls() {
      state.characterWindowFontSize = clamp(Math.round(state.characterWindowFontSize),8,20);
      characterWindow.style.setProperty("--character-font-size",`${state.characterWindowFontSize}px`);
      $("#characterWindowFontSizeControl").value = state.characterWindowFontSize;
      $("#characterWindowFontSizeValue").value = `${state.characterWindowFontSize}px`;
    }
    function trapFocus(event) {
      const focusable = [...characterWindow.querySelectorAll('button:not([disabled]), [tabindex="0"]')]
        .filter(element => element.offsetParent !== null && element.tabIndex >= 0);
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusable.length - 1 : current - 1)
        : (current === focusable.length - 1 ? 0 : current + 1);
      focusable[next].focus();
    }
    function cyclePage(direction) {
      const index = CHARACTER_PAGES.indexOf(state.characterPage);
      setCharacterPage(CHARACTER_PAGES[(index + direction + CHARACTER_PAGES.length) % CHARACTER_PAGES.length]);
      focusContent();
    }
    function moveSequential(direction) {
      const fields = characterFieldsForPage();
      if (!fields.length) return false;
      const selected = getSelectedCharacterField();
      const index = Math.max(0,fields.indexOf(selected));
      selectCharacterField(fields[(index + direction + fields.length) % fields.length]);
      focusContent();
      return true;
    }
    function moveHorizontal(direction) {
      const currentId = getSelectedCharacterField();
      const current = currentId && content.querySelector(`[data-character-field="${currentId}"]`);
      if (!current) return false;
      const from = current.getBoundingClientRect();
      const fromX = from.left + from.width / 2;
      const fromY = from.top + from.height / 2;
      const candidates = [...content.querySelectorAll("[data-character-field]")].map(element => {
        const rect = element.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        return {element,dx:x-fromX,dy:y-fromY};
      }).filter(candidate => direction < 0 ? candidate.dx < -4 : candidate.dx > 4);
      candidates.sort((a,b) => (Math.abs(a.dy) * 3 + Math.abs(a.dx)) - (Math.abs(b.dy) * 3 + Math.abs(b.dx)));
      const next = candidates[0]?.element.dataset.characterField;
      if (!next) return false;
      selectCharacterField(next);
      focusContent();
      return true;
    }
    function createDump() {
      const fileName = `${CHARACTER_DATA.name}.txt`;
      appendGameMessage({markup:escapeHtml(`Character dump to file '${fileName}' successful. (prototype only)`) });
    }
    function openSelectedGuide() {
      if (state.characterPage === "resists") return false;
      const selected = getSelectedCharacterField();
      return selected ? guideFeature.openArticle(selected,content) : false;
    }
    function handleKeydown(event) {
      const editing = event.target.matches?.("input, textarea, select, [contenteditable='true']");
      const shortcutPressed = event.code === "KeyC" && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
      if (shortcutPressed && !editing) {
        const higherLayerOpen = windowManager.snapshot().some(entry => ["context","dialog","target","system","technical"].includes(entry.layer));
        if (!isOpen() && higherLayerOpen) return false;
        openWindow(shortcut);
        return true;
      }
      if (!isOpen()) return false;
      if (event.key === "Escape") { closeWindow();return true; }
      if (editing) return false;
      if (event.code === "KeyH" && !event.ctrlKey && !event.altKey && !event.metaKey) { cyclePage(1);return true; }
      if (event.code === "KeyF" && !event.ctrlKey && !event.altKey && !event.metaKey) { createDump();return true; }
      if (event.key === "?") { openSelectedGuide();return true; }
      if (event.key === "2" || event.key === "ArrowDown") return moveSequential(1);
      if (event.key === "8" || event.key === "ArrowUp") return moveSequential(-1);
      if (event.key === "4" || event.key === "ArrowLeft") return moveHorizontal(-1);
      if (event.key === "6" || event.key === "ArrowRight") return moveHorizontal(1);
      if (event.key === "Tab") { trapFocus(event);return true; }
      return false;
    }

    shortcut.addEventListener("click",event => openWindow(event.currentTarget));
    $("#characterWindowClose").addEventListener("click",closeWindow);
    $("#characterWindowDump").addEventListener("click",createDump);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeWindow(); });
    $("#characterWindowTabs").addEventListener("click",event => {
      const button = event.target.closest("[data-character-tab]");
      if (button) { setCharacterPage(button.dataset.characterTab);focusContent(); }
    });
    content.addEventListener("click",event => {
      const field = event.target.closest("[data-character-field]");
      if (!field) return;
      selectCharacterField(field.dataset.characterField);
      focusContent();
    });

    return {openWindow,closeWindow,isOpen,handleKeydown,applyControls};
  };
})();
