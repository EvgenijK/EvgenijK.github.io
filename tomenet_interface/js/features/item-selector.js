(() => {
  const SOURCE_ORDER = ["inventory","equipment","bags","floor"];
  const SOURCE_META = {
    inventory:{label:"Inventory",key:"/"},
    equipment:{label:"Equipment",key:"/"},
    bags:{label:"Bags",key:"!"},
    floor:{label:"Floor",key:"−"}
  };
  const DEMO_ACTIONS = {
    inspect:{title:"Inspect which item?",sources:["inventory","equipment","bags","floor"]},
    drop:{title:"Drop which item?",sources:["inventory","equipment","bags"]},
    destroy:{title:"Destroy which item?",sources:["inventory","equipment","bags"]},
    throw:{title:"Throw which item?",sources:["inventory","equipment","bags","floor"]},
    wield:{title:"Wield or wear which item?",sources:["inventory","floor"]},
    "wield-secondary":{title:"Wield or wear in the secondary slot?",sources:["inventory","floor"]},
    "take-off":{title:"Take off which item?",sources:["equipment"]},
    swap:{title:"Swap which item?",sources:["inventory","equipment"]}
  };

  window.TomeNetPrototype.createItemSelectorFeature = ({
    state,$,$$,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,EQUIPMENT_ITEMS,EQUIPMENT_ICONS,
    TERM_COLORS,BAGS,FLOOR_ITEMS,windowManager,canInvokeSelectionAction,getSelectionActionAvailability,invokeSelectionAction
  }) => {
    const overlay = $("#itemSelectorOverlay");
    const dialog = $("#itemSelectorWindow");
    const sourceTabs = $("#itemSelectorSources");
    const list = $("#itemSelectorList");
    const title = $("#itemSelectorTitle");
    const path = $("#itemSelectorPath");
    const help = $("#itemSelectorHelp");
    let session = null;

    windowManager.register({
      kind:"item-selector",layer:"dialog",blocksGameplay:true,allowsChat:true,
      focusTarget:() => currentRow() || $("#itemSelectorClose"),
      onClose:() => finalizeClose()
    });

    function equipmentItem(index) {
      const entry = EQUIPMENT_ITEMS[index];
      if (!entry?.name) return null;
      return {...entry,type:entry.type || "equipment",equipped:true,quantity:entry.quantity || 1,color:TERM_COLORS[entry.tone || "white"] || TERM_COLORS.white};
    }

    function selectionFor(source,index,bagSlot = null) {
      let item = null;
      if (source === "inventory") item = INVENTORY_ITEMS[index];
      else if (source === "equipment") item = equipmentItem(index);
      else if (source === "floor") item = FLOOR_ITEMS[index];
      else if (source === "bag") item = BAGS.find(bag => bag.slot === bagSlot)?.items[index];
      return item ? {source,item,index,...(bagSlot ? {bagSlot} : {})} : null;
    }

    function availabilityFor(selection) {
      if (!selection) return {enabled:false,reason:"Item data is unavailable."};
      if (session.options.availability) return session.options.availability(selection);
      return {enabled:!session.options.filter || Boolean(session.options.filter(selection)),reason:"This item is not valid for the selected action."};
    }

    function isEligible(selection) {
      return Boolean(availabilityFor(selection).enabled);
    }

    function sourceSelections(source) {
      if (source === "inventory") return INVENTORY_ITEMS.map((item,index) => item && selectionFor(source,index)).filter(Boolean);
      if (source === "equipment") return EQUIPMENT_ITEMS.map((item,index) => item?.name && selectionFor(source,index)).filter(Boolean);
      if (source === "floor") return FLOOR_ITEMS.map((item,index) => item && selectionFor(source,index)).filter(Boolean);
      return [];
    }

    function visibleSources() {
      return SOURCE_ORDER.filter(source => session.options.allowedSources.includes(source));
    }

    function firstAvailableSource(preferred) {
      const sources = visibleSources();
      return sources.includes(preferred) ? preferred : sources[0];
    }

    function rowKey(index) { return String.fromCharCode(97 + index); }

    function renderTabs() {
      sourceTabs.innerHTML = visibleSources().map(source => {
        const meta = SOURCE_META[source];
        const active = session.source === source;
        return `<button type="button" role="tab" aria-selected="${active}" class="${active ? "is-active" : ""}" data-selector-source="${source}"><span>${meta.label}</span><kbd>${meta.key}</kbd></button>`;
      }).join("");
    }

    function itemIcon(selection) {
      if (selection.source === "equipment") return EQUIPMENT_ICONS[selection.item.slot] || INVENTORY_ICONS.weapon;
      return INVENTORY_ICONS[selection.item.icon] || INVENTORY_ICONS.bag;
    }

    function selectionKey(selection) {
      if (selection.source === "equipment") return selection.item.key || rowKey(selection.index);
      return rowKey(selection.index);
    }

    function itemRows(selections) {
      return selections.map(selection => {
        const availability = availabilityFor(selection);
        const enabled = availability.enabled;
        const key = selectionKey(selection);
        return `<button class="item-selector-row ${enabled ? "" : "is-disabled"}" type="button" role="option" data-selector-row data-selector-key="${key}" data-source="${selection.source}" data-index="${selection.index}" ${selection.bagSlot ? `data-bag-slot="${selection.bagSlot}"` : ""} ${enabled ? "" : `disabled title="${escapeHtml(availability.reason || "Unavailable")}"`} style="--item-color:${selection.item.color || TERM_COLORS.white}"><kbd>${key})</kbd><span class="item-selector-icon">${itemIcon(selection)}</span><span class="item-selector-name">${escapeHtml(selection.item.name)}</span><span class="item-selector-weight">${enabled ? `${Number(selection.item.weight || 0).toFixed(1)} lb` : escapeHtml(availability.reason || "Unavailable")}</span></button>`;
      }).join("");
    }

    function renderBagContainers() {
      path.textContent = "Choose a container";
      const rows = BAGS.map(bag => {
        const eligibleCount = bag.items.filter((item,index) => isEligible(selectionFor("bag",index,bag.slot))).length;
        const enabled = eligibleCount > 0;
        return `<button class="item-selector-row item-selector-bag ${enabled ? "" : "is-disabled"}" type="button" role="option" data-selector-row data-selector-key="${bag.slot}" data-open-bag="${bag.slot}" ${enabled ? "" : "disabled"} style="--item-color:${bag.color}"><kbd>${bag.slot})</kbd><span class="item-selector-icon">${INVENTORY_ICONS[bag.icon]}</span><span class="item-selector-name">${escapeHtml(bag.name)}</span><span class="item-selector-weight">${eligibleCount} eligible · ${bag.items.length}/${bag.capacity}</span></button>`;
      }).join("");
      list.innerHTML = rows || emptyMarkup("No containers are available.");
    }

    function emptyMarkup(message) {
      return `<div class="item-selector-empty" role="status"><strong>NO ELIGIBLE ITEMS</strong><span>${escapeHtml(message)}</span></div>`;
    }

    function renderList() {
      renderTabs();
      if (session.source === "bags" && !session.bagSlot) {
        renderBagContainers();
      } else {
        const selections = session.source === "bags"
          ? BAGS.find(bag => bag.slot === session.bagSlot)?.items.map((item,index) => selectionFor("bag",index,session.bagSlot)).filter(Boolean) || []
          : sourceSelections(session.source);
        if (session.source === "bags") path.textContent = `${BAGS.find(bag => bag.slot === session.bagSlot)?.name || "Bag"} · Backspace to containers`;
        else path.textContent = `${SOURCE_META[session.source].label} · ${selections.filter(isEligible).length} eligible`;
        list.innerHTML = selections.length ? itemRows(selections) : emptyMarkup(`There are no items in ${SOURCE_META[session.source].label}.`);
        if (selections.length && !selections.some(isEligible)) list.insertAdjacentHTML("beforeend",emptyMarkup("This source has no item valid for the selected action."));
      }
      session.selected = Math.max(0,Math.min(session.selected,enabledRows().length - 1));
      updateSelection(false);
    }

    function enabledRows() { return $$(`#itemSelectorList [data-selector-row]:not(:disabled)`); }
    function currentRow() { return enabledRows()[session?.selected || 0] || null; }

    function updateSelection(focus = true) {
      const rows = enabledRows();
      if (!rows.length) return;
      session.selected = Math.max(0,Math.min(session.selected,rows.length - 1));
      $$(`#itemSelectorList [data-selector-row]`).forEach(row => {
        const selected = row === rows[session.selected];
        row.classList.toggle("is-selected",selected);
        row.setAttribute("aria-selected",selected ? "true" : "false");
        row.tabIndex = selected ? 0 : -1;
      });
      if (focus) requestAnimationFrame(() => rows[session.selected]?.focus());
    }

    function selectSource(source) {
      if (!session || !visibleSources().includes(source)) return;
      session.source = source;
      session.bagSlot = null;
      session.selected = 0;
      renderList();
      updateSelection();
    }

    function cycleSource(direction = 1) {
      const sources = visibleSources();
      const next = (sources.indexOf(session.source) + direction + sources.length) % sources.length;
      selectSource(sources[next]);
    }

    function openBag(slot) {
      if (!session || session.source !== "bags") return;
      session.bagSlot = slot;
      session.selected = 0;
      renderList();
      updateSelection();
    }

    function selectionFromRow(row) {
      return selectionFor(row.dataset.source,Number(row.dataset.index),row.dataset.bagSlot || null);
    }

    function activateRow(row = currentRow()) {
      if (!row || row.disabled) return;
      if (row.dataset.openBag) { openBag(row.dataset.openBag);return; }
      const selection = selectionFromRow(row);
      if (!selection || !isEligible(selection)) return;
      const {onSelect} = session.options;
      close(false);
      onSelect?.(selection);
    }

    function finalizeClose() {
      if (!session) return;
      const closing = session;
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      session = null;
      closing.options.onCancel?.();
    }

    function close(cancelled = true) {
      if (!session) return;
      if (!cancelled) session.options.onCancel = null;
      if (!windowManager.closeKind("item-selector",{restoreFocus:true,force:true})) finalizeClose();
    }

    function openItemSelector(options = {}) {
      if (session) close(false);
      const allowedSources = (options.allowedSources || SOURCE_ORDER).filter(source => SOURCE_ORDER.includes(source));
      if (!allowedSources.length) return false;
      const opener = options.opener || document.activeElement;
      session = {
        source:null,bagSlot:null,selected:0,
        options:{title:"Select an item",filter:null,availability:null,onSelect:null,onCancel:null,preferredSource:"inventory",...options,allowedSources}
      };
      session.source = firstAvailableSource(session.options.preferredSource);
      title.textContent = session.options.title;
      help.textContent = "Letters select · ↑↓ move · Tab sources · / pack/equipment · ! bags · − floor · Esc cancel";
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      windowManager.push("item-selector",{allowedSources,source:session.source},{opener});
      renderList();
      requestAnimationFrame(() => (currentRow() || $("#itemSelectorClose"))?.focus());
      return true;
    }

    function openDemo(actionId = state.itemSelectorDemoAction, opener = document.activeElement) {
      const config = DEMO_ACTIONS[actionId] || DEMO_ACTIONS.inspect;
      return openItemSelector({
        title:config.title,allowedSources:config.sources,preferredSource:"inventory",opener,
        availability:selection => getSelectionActionAvailability(selection,actionId),
        filter:selection => canInvokeSelectionAction(selection,actionId),
        onSelect:selection => invokeSelectionAction(selection,actionId,opener)
      });
    }

    function handleKeydown(event,editing) {
      if (!session) return false;
      if (editing) return true;
      if (event.key === "Escape") {
        if (session.source === "bags" && session.bagSlot) { session.bagSlot = null;session.selected = 0;renderList();updateSelection(); }
        else close(true);
      } else if (event.key === "Backspace" && session.source === "bags" && session.bagSlot) {
        session.bagSlot = null;session.selected = 0;renderList();updateSelection();
      } else if (event.key === "ArrowUp") { session.selected--;if (session.selected < 0) session.selected = enabledRows().length - 1;updateSelection(); }
      else if (event.key === "ArrowDown") { session.selected = (session.selected + 1) % Math.max(1,enabledRows().length);updateSelection(); }
      else if (["Enter"," "].includes(event.key)) activateRow();
      else if (event.key === "Tab") cycleSource(event.shiftKey ? -1 : 1);
      else if (event.key === "!") selectSource("bags");
      else if (event.key === "-") selectSource("floor");
      else if (event.key === "/") {
        const sources = visibleSources();
        if (sources.includes("inventory") && sources.includes("equipment")) selectSource(session.source === "inventory" ? "equipment" : "inventory");
        else if (sources.includes("inventory")) selectSource("inventory");
        else if (sources.includes("equipment")) selectSource("equipment");
      } else if (/^[a-z]$/i.test(event.key)) {
        const row = $$(`#itemSelectorList [data-selector-row]`).find(candidate => candidate.dataset.selectorKey === event.key.toLowerCase());
        if (row && !row.disabled) activateRow(row);
      }
      return true;
    }

    sourceTabs.addEventListener("click",event => {
      const button = event.target.closest("[data-selector-source]");
      if (button) selectSource(button.dataset.selectorSource);
    });
    list.addEventListener("click",event => activateRow(event.target.closest("[data-selector-row]")));
    overlay.addEventListener("click",event => { if (event.target === overlay) close(true); });
    $("#itemSelectorClose").addEventListener("click",() => close(true));

    window.TomeNetPrototype.openItemSelector = openItemSelector;
    return {openItemSelector,openDemo,close,handleKeydown,isOpen:() => Boolean(session),DEMO_ACTIONS};
  };
})();
