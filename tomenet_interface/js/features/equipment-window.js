(() => {
  window.TomeNetPrototype.createEquipmentWindowFeature = ({state,$,$$,clamp,persist,EQUIPMENT_ITEMS,windowManager,openItemContextMenu,closeItemContextMenu,getCombinedItemsFeature}) => {
    const overlay = $("#equipmentOverlay");
    const equipmentWindow = $("#equipmentWindow");
    const list = $("#equipmentWindowList");
    const shortcut = $("#equipmentShortcut");
    let selectedSlot = null;
    let returnFocus = null;

    function isOpen() { return windowManager.has("equipment"); }
    function selectedRow() { return selectedSlot === null ? null : list.querySelector(`[data-equipment-slot="${selectedSlot}"]`); }

    function selectSlot(index,focus = true) {
      if (!Number.isInteger(index) || index < 0 || index >= EQUIPMENT_ITEMS.length) return;
      selectedSlot = index;
      $$('[data-equipment-slot]').forEach(element => {
        if (!element.closest("#equipmentWindow")) return;
        const selected = Number(element.dataset.equipmentSlot) === index;
        element.classList.toggle("is-selected",selected);
        if (element.matches(".equipment-row")) {
          element.setAttribute("aria-selected",selected ? "true" : "false");
          element.tabIndex = selected ? 0 : -1;
        } else {
          element.setAttribute("aria-pressed",selected ? "true" : "false");
          element.tabIndex = -1;
        }
      });
      const row = selectedRow();
      list.setAttribute("aria-activedescendant",row?.id || "");
      if (focus && row) requestAnimationFrame(() => {
        row.focus();
        row.scrollIntoView({block:"nearest"});
      });
    }

    function showWindow() {
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      shortcut.setAttribute("aria-expanded","true");
      selectSlot(EQUIPMENT_ITEMS.findIndex(item => item.name));
    }

    function finalizeClosedUi() {
      closeItemContextMenu(false);
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      shortcut.setAttribute("aria-expanded","false");
      selectedSlot = null;
      list.removeAttribute("aria-activedescendant");
      requestAnimationFrame(() => returnFocus?.focus());
    }

    windowManager.register({
      kind:"equipment",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:selectedRow,onOpen:showWindow,onClose:finalizeClosedUi
    });

    function openWindow(opener = shortcut) {
      if (isOpen()) return closeWindow();
      returnFocus = opener;
      return windowManager.open("equipment",{}, {opener});
    }

    function closeWindow() { return windowManager.closeKind("equipment"); }

    function moveSelection(direction) {
      const current = selectedSlot === null ? 0 : selectedSlot;
      selectSlot(clamp(current + direction,0,EQUIPMENT_ITEMS.length - 1));
    }

    function openSelectedContext() {
      const item = EQUIPMENT_ITEMS[selectedSlot];
      if (item?.name) openItemContextMenu(selectedRow());
    }

    function trapFocus(event) {
      const focusable = [...equipmentWindow.querySelectorAll('button:not([disabled]), [tabindex="0"]')]
        .filter(element => element.offsetParent !== null && element.tabIndex >= 0);
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement);
      const next = event.shiftKey
        ? (current <= 0 ? focusable.length - 1 : current - 1)
        : (current === focusable.length - 1 ? 0 : current + 1);
      event.preventDefault();
      focusable[next].focus();
    }

    function handleKeydown(event,editing) {
      if (event.key === "e" && !editing && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
        if (state.combinedItemsWindow) return false;
        if (isOpen()) closeWindow(); else openWindow(shortcut);
        return true;
      }
      if (!isOpen() || editing) return false;
      if (event.key === "Escape") { closeWindow();return true; }
      if (event.key === "ArrowUp") moveSelection(-1);
      else if (event.key === "ArrowDown") moveSelection(1);
      else if (["Enter"," "].includes(event.key)) openSelectedContext();
      else if (event.key === "Tab") trapFocus(event);
      else if (/^[a-n]$/.test(event.key) && event.key !== "e") selectSlot(event.key.charCodeAt(0) - 97);
      else return true;
      return true;
    }

    function applyControls() {
      state.equipmentWindowFontSize = clamp(Math.round(state.equipmentWindowFontSize),8,24);
      equipmentWindow.style.setProperty("--equipment-font-size",`${state.equipmentWindowFontSize}px`);
      $("#equipmentWindowFontSizeControl").value = state.equipmentWindowFontSize;
      $("#equipmentWindowFontSizeValue").value = `${state.equipmentWindowFontSize}px`;
    }

    shortcut.addEventListener("click",event => {
      if (state.combinedItemsWindow) getCombinedItemsFeature()?.openSection("equipment",event.currentTarget);
      else openWindow(event.currentTarget);
    });
    $("#equipmentWindowClose").addEventListener("click",closeWindow);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeWindow(); });
    equipmentWindow.addEventListener("click",event => {
      const slot = event.target.closest("[data-equipment-slot]");
      if (!slot) return;
      selectSlot(Number(slot.dataset.equipmentSlot),false);
      if (slot.dataset.itemSource === "equipment") openItemContextMenu(slot,{clientX:event.clientX,clientY:event.clientY});
    });

    return {openWindow,closeWindow,isOpen,handleKeydown,applyControls,restoreFocus:() => selectedRow()?.focus()};
  };
})();
