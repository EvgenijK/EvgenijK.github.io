(() => {
  window.TomeNetPrototype.createCombinedItemsWindowFeature = ({
    state,$,$$,clamp,EQUIPMENT_ITEMS,INVENTORY_ITEMS,windowManager,
    openItemContextMenu,closeItemContextMenu,invokeItemActionForRow,getInventoryFeature,getEquipmentFeature
  }) => {
    const overlay = $("#combinedItemsOverlay");
    const windowElement = $("#combinedItemsWindow");
    const inventoryList = $("#combinedInventoryList");
    const equipmentList = $("#combinedEquipmentList");
    const inventoryShortcut = $("#inventoryShortcut");
    const equipmentShortcut = $("#equipmentShortcut");
    let activeSection = "inventory";
    let selectedInventorySlot = null;
    let selectedEquipmentSlot = null;
    let returnFocus = null;

    function isOpen() { return windowManager.has("combined-items"); }
    function selectedInventoryRow() {
      return selectedInventorySlot === null ? null : inventoryList.querySelector(`[data-inventory-slot="${selectedInventorySlot}"]`);
    }
    function selectedEquipmentRow() {
      return selectedEquipmentSlot === null ? null : equipmentList.querySelector(`[data-equipment-slot="${selectedEquipmentSlot}"]`);
    }
    function selectedRow() { return activeSection === "equipment" ? selectedEquipmentRow() : selectedInventoryRow(); }
    function updateSectionUi() {
      $$('[data-combined-section]').forEach(section => section.classList.toggle("is-active",section.dataset.combinedSection === activeSection));
    }

    function selectInventory(index,focus = true) {
      if (!INVENTORY_ITEMS[index]) return;
      selectedInventorySlot = index;
      $$('#combinedInventoryList [data-inventory-slot]').forEach(row => {
        const selected = Number(row.dataset.inventorySlot) === index;
        row.classList.toggle("is-selected",selected);
        row.setAttribute("aria-selected",selected ? "true" : "false");
        row.tabIndex = selected ? 0 : -1;
      });
      const row = selectedInventoryRow();
      inventoryList.setAttribute("aria-activedescendant",row?.id || "");
      if (focus && row) requestAnimationFrame(() => { row.focus();row.scrollIntoView({block:"nearest"}); });
    }

    function selectEquipment(index,focus = true) {
      if (!Number.isInteger(index) || index < 0 || index >= EQUIPMENT_ITEMS.length) return;
      selectedEquipmentSlot = index;
      $$('#combinedItemsWindow [data-equipment-slot]').forEach(element => {
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
      const row = selectedEquipmentRow();
      equipmentList.setAttribute("aria-activedescendant",row?.id || "");
      if (focus && row) requestAnimationFrame(() => { row.focus();row.scrollIntoView({block:"nearest"}); });
    }

    function setActiveSection(section,focus = true) {
      activeSection = section === "equipment" ? "equipment" : "inventory";
      updateSectionUi();
      if (activeSection === "equipment") {
        if (selectedEquipmentSlot === null) selectedEquipmentSlot = EQUIPMENT_ITEMS.findIndex(item => item.name);
        selectEquipment(selectedEquipmentSlot,focus);
      } else {
        if (selectedInventorySlot === null) selectedInventorySlot = INVENTORY_ITEMS.findIndex(Boolean);
        selectInventory(selectedInventorySlot,focus);
      }
    }

    function showWindow(entry) {
      activeSection = entry.payload?.section === "equipment" ? "equipment" : "inventory";
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      inventoryShortcut.setAttribute("aria-expanded","true");
      equipmentShortcut.setAttribute("aria-expanded","true");
      setActiveSection(activeSection);
    }
    function finalizeClosedUi() {
      closeItemContextMenu(false);
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      inventoryShortcut.setAttribute("aria-expanded","false");
      equipmentShortcut.setAttribute("aria-expanded","false");
      inventoryList.removeAttribute("aria-activedescendant");
      equipmentList.removeAttribute("aria-activedescendant");
      requestAnimationFrame(() => returnFocus?.focus());
    }

    windowManager.register({kind:"combined-items",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:selectedRow,onOpen:showWindow,onClose:finalizeClosedUi});

    function openSection(section,opener = section === "equipment" ? equipmentShortcut : inventoryShortcut) {
      returnFocus = opener;
      if (isOpen()) {
        if (activeSection === section) return closeWindow();
        setActiveSection(section);
        return true;
      }
      windowManager.open("combined-items",{section},{opener});
      return true;
    }
    function closeWindow() { return windowManager.closeKind("combined-items"); }

    function moveSelection(direction) {
      if (activeSection === "equipment") {
        const occupied = EQUIPMENT_ITEMS.map((item,index) => item.name ? index : -1).filter(index => index >= 0);
        const current = Math.max(0,occupied.indexOf(selectedEquipmentSlot));
        selectEquipment(occupied[clamp(current + direction,0,occupied.length - 1)]);
      } else {
        const occupied = INVENTORY_ITEMS.map((item,index) => item ? index : -1).filter(index => index >= 0);
        const current = Math.max(0,occupied.indexOf(selectedInventorySlot));
        selectInventory(occupied[clamp(current + direction,0,occupied.length - 1)]);
      }
    }
    function openSelectedContext() { const row = selectedRow();if (row?.dataset.itemSource) openItemContextMenu(row); }

    function handleKeydown(event,editing) {
      if (!state.combinedItemsWindow || editing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return false;
      if (event.key === "i") { openSection("inventory",inventoryShortcut);return true; }
      if (event.key === "e") { openSection("equipment",equipmentShortcut);return true; }
      if (!isOpen()) return false;
      if (event.key === "b") return false;
      if (event.key === "Escape") { closeWindow();return true; }
      if (event.key === "Tab") { event.preventDefault();setActiveSection(activeSection === "inventory" ? "equipment" : "inventory");return true; }
      if (event.key === "ArrowUp") { moveSelection(-1);return true; }
      if (event.key === "ArrowDown") { moveSelection(1);return true; }
      if (["Enter"," "].includes(event.key)) { openSelectedContext();return true; }
      if (activeSection === "inventory" && event.key === "s") { const row = selectedInventoryRow();if (row) invokeItemActionForRow(row,"stow");return true; }
      if (activeSection === "equipment" && /^[a-n]$/.test(event.key)) { selectEquipment(event.key.charCodeAt(0) - 97);return true; }
      if (activeSection === "inventory" && /^[a-w]$/.test(event.key)) { selectInventory(event.key.charCodeAt(0) - 97);return true; }
      return true;
    }

    function applyControls() {
      state.inventoryWindowFontSize = clamp(Math.round(state.inventoryWindowFontSize),8,24);
      state.equipmentWindowFontSize = clamp(Math.round(state.equipmentWindowFontSize),8,24);
      windowElement.style.setProperty("--combined-inventory-font-size",`${state.inventoryWindowFontSize}px`);
      windowElement.style.setProperty("--combined-equipment-font-size",`${state.equipmentWindowFontSize}px`);
      $("#combinedItemsWindowControl").checked = state.combinedItemsWindow;
      inventoryShortcut.setAttribute("aria-controls",state.combinedItemsWindow ? "combinedItemsOverlay" : "inventoryOverlay");
      equipmentShortcut.setAttribute("aria-controls",state.combinedItemsWindow ? "combinedItemsOverlay" : "equipmentOverlay");
    }
    function applyModeChange(enabled) {
      const inventoryFeature = getInventoryFeature();
      const equipmentFeature = getEquipmentFeature();
      if (enabled) {
        if (inventoryFeature?.isInventoryOpen()) {
          inventoryFeature.closeInventoryWindow();
          openSection("inventory",inventoryShortcut);
        } else if (equipmentFeature?.isOpen()) {
          equipmentFeature.closeWindow();
          openSection("equipment",equipmentShortcut);
        }
      } else if (isOpen()) {
        const section = activeSection;
        closeWindow();
        if (section === "equipment") equipmentFeature?.openWindow(equipmentShortcut);
        else inventoryFeature?.openInventoryWindow(inventoryShortcut);
      }
      applyControls();
    }

    $("#combinedItemsWindowClose").addEventListener("click",closeWindow);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeWindow(); });
    windowElement.addEventListener("focusin",event => {
      if (event.target.closest("#combinedEquipmentList, #combinedEquipmentSlotMap")) setActiveSection("equipment",false);
      else if (event.target.closest("#combinedInventoryList")) setActiveSection("inventory",false);
    });
    windowElement.addEventListener("click",event => {
      const equipmentSlot = event.target.closest("[data-equipment-slot]");
      const inventorySlot = event.target.closest("[data-inventory-slot]");
      if (equipmentSlot) {
        setActiveSection("equipment",false);
        selectEquipment(Number(equipmentSlot.dataset.equipmentSlot),false);
        if (equipmentSlot.closest("#combinedEquipmentSlotMap") && equipmentSlot.dataset.itemSource === "equipment") openItemContextMenu(equipmentSlot,{clientX:event.clientX,clientY:event.clientY});
      } else if (inventorySlot?.dataset.itemSource) {
        setActiveSection("inventory",false);
        selectInventory(Number(inventorySlot.dataset.inventorySlot),false);
      }
    });

    return {openSection,closeWindow,isOpen,getActiveSection:() => activeSection,handleKeydown,applyControls,applyModeChange,restoreFocus:() => selectedRow()?.focus()};
  };
})();
