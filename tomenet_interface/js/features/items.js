(() => {
  window.TomeNetPrototype.createItemsFeature = ({state,$, $$, clamp, escapeHtml, INVENTORY_ITEMS, INVENTORY_ICONS, EQUIPMENT_ITEMS, TERM_COLORS, BAGS, FLOOR_ITEMS, mapCanvas, mapViewport, mapPointerCell, mapState, renderMap, openMapChatEditor, windowManager,itemUseFeature,itemDeviceFeature,itemEquipFeature,getItemSelectorFeature,getCombinedItemsFeature,getBrowseFeature}) => {
  let inventoryOpen = false;
  let selectedInventorySlot = null;
  let inventoryReturnFocus = null;
  let itemActionState = null;
  let itemActionBackState = null;
  let throwReturnItemActionState = null;
  let throwTargetState = null;
  let activeItemContext = null;
  const inventoryOverlay = $("#inventoryOverlay");
  const equipmentOverlay = $("#equipmentOverlay");
  const combinedItemsOverlay = $("#combinedItemsOverlay");
  const browseOverlay = $("#browseOverlay");
  const inventoryWindow = $("#inventoryWindow");
  const inventoryWindowList = $("#inventoryWindowList");
  const inventoryShortcut = $("#inventoryShortcut");
  const inventoryContextMenu = $("#inventoryContextMenu");
  const itemActionLayer = $("#itemActionLayer");
  const itemActionDialog = $("#itemActionDialog");
  const throwTargeting = $("#throwTargeting");
  const throwTargetCell = $("#throwTargetCell");

  windowManager.register({kind:"inventory",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:selectedInventoryRow,onClose:finalizeInventoryClosedUi});
  windowManager.register({kind:"item-context",layer:"context",blocksGameplay:true,allowsChat:true,focusTarget:() => activeItemContext?.row});
  windowManager.register({kind:"item-action",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:() => itemActionDialog.querySelector("input,button:not([disabled])")});
  windowManager.register({kind:"map-target",layer:"target",blocksGameplay:true,allowsChat:false,focusTarget:() => throwTargeting});

  const COMMON_INVENTORY_ACTIONS = [
    {id:"inspect",label:"Inspect",key:"I"},
    {id:"throw",label:"Throw",key:"v"},
    {id:"drop",label:"Drop",key:"d"},
    {id:"inscribe",label:"Inscribe",key:"{"},
    {id:"auto-inscribe",label:"Apply auto-inscription",key:"H"},
    {id:"paste",label:"Paste to chat",key:"⇧"},
    {id:"destroy",label:"Destroy",key:"k",danger:true}
  ];
  const USE_ACTION_IDS = new Set(["quaff","eat","read","activate"]);
  const DEVICE_ACTION_IDS = new Set(["aim","use-staff","zap"]);
  const EQUIP_ACTION_IDS = new Set(["wield","wield-secondary","take-off","swap"]);
  const USE_COMMANDS = {
    q:{actionId:"quaff",title:"Quaff which potion?",sources:["inventory","bags"]},
    E:{actionId:"eat",title:"Eat what?",sources:["inventory","bags"]},
    r:{actionId:"read",title:"Read which scroll?",sources:["inventory"]},
    a:{actionId:"aim",title:"Aim which wand?",sources:["inventory","equipment"]},
    u:{actionId:"use-staff",title:"Use which staff?",sources:["inventory","equipment","bags"]},
    z:{actionId:"zap",title:"Zap which rod?",sources:["inventory","equipment","bags"]},
    A:{actionId:"activate",title:"Activate what?",sources:["equipment","inventory","bags"],preferredSource:"equipment"}
  };
  const EQUIP_COMMANDS = {
    w:{actionId:"wield",title:"Wield or wear which item?",sources:["inventory","floor"]},
    W:{actionId:"wield-secondary",title:"Wield or wear in the secondary slot?",sources:["inventory","floor"]},
    t:{actionId:"take-off",title:"Take off which item?",sources:["equipment"],preferredSource:"equipment"},
    x:{actionId:"swap",title:"Swap which item?",sources:["inventory","equipment"],preferredSource:"inventory"}
  };

  function bagAcceptsItem(bag,item) {
    return Boolean(bag?.acceptsTypes?.includes(item.type)) && (!bag.requiresDirectionless || !item.usesDirection);
  }

  function equipAction(id,label,key,item,source) {
    const availability = itemEquipFeature.availability(id,item,source,{inventoryFull:state.browseInventoryFull});
    return {id,label,key,disabled:!availability.enabled,reason:availability.reason};
  }

  function inventoryActionsFor(item,source = "inventory",bag = null) {
    let primary = null;
    if (item.equipped) primary = equipAction("take-off","Take off","t",item,source);
    if (item.type === "bag") primary = {id:"open-bag",label:"Open contents",key:"b"};
    if (item.type === "book") primary = {id:"browse-book",label:"Browse",key:"b"};
    if (item.type === "scroll") primary = {id:"read",label:"Read",key:"r"};
    if (["rod","wand","staff"].includes(item.type)) {
      const actionId = {rod:"zap",wand:"aim",staff:"use-staff"}[item.type];
      const availability = itemDeviceFeature.availability(actionId,item,source,bag);
      primary = {id:actionId,label:{rod:"Zap",wand:"Aim",staff:"Use"}[item.type],key:{rod:"z",wand:"a",staff:"u"}[item.type],disabled:!availability.enabled,reason:availability.reason};
    }
    if (item.type === "potion") primary = {id:"quaff",label:"Quaff",key:"q"};
    if (item.type === "food") primary = {id:"eat",label:"Eat",key:"E"};
    if (item.type === "trap") primary = {id:"set-trap",label:"Set trap",key:"S"};
    if (item.type === "equipment" && !item.equipped) primary = equipAction("wield",item.slot === "weapon" ? "Wield" : "Wear","w",item,source);
    let common = COMMON_INVENTORY_ACTIONS.map(action => {
      if (action.id !== "inscribe") return {...action};
      return item.inscription
        ? {id:"uninscribe",label:"Uninscribe",key:"}"}
        : {...action};
    });
    if (item.equipped) {
      const inscription = common.find(action => ["inscribe","uninscribe"].includes(action.id));
      const compatibleFuelAvailable = !item.finiteFuel || INVENTORY_ITEMS.some(candidate => candidate.type === "fuel" && candidate.subtype === item.fuelType);
      const equipmentActions = [
        {...primary,group:"primary"},
        {...equipAction("swap","Swap","x",item,source),group:"primary"},
        {id:"inspect",label:"Inspect",key:"I",group:"common"},
        ...(item.activatable ? [{id:"activate",label:"Activate",key:"A",group:"use",disabled:(item.activationCooldownRemaining || 0) > 0,reason:`The item is still charging (${item.activationCooldownRemaining || 0} turns).`}] : []),
        ...(item.throwable ? [{id:"throw",label:"Throw",key:"v",group:"use"}] : []),
        ...(item.finiteFuel ? [{id:"refill",label:"Refill",key:"F",group:"use",disabled:!compatibleFuelAvailable,reason:"No compatible fuel is available in Inventory."}] : []),
        {id:"drop",label:"Drop",key:"d",group:"common"},
        {...inscription,group:"common"},
        {id:"auto-inscribe",label:"Apply auto-inscription",key:"H",group:"common"},
        {id:"paste",label:"Paste to chat",key:"⇧",group:"common"},
        {id:"destroy",label:"Destroy",key:"k",danger:true,group:"danger"}
      ];
      return equipmentActions;
    }
    const actions = primary ? [{...primary,group:"primary"},...common.map(action => ({...action,group:"common"}))] : common.map(action => ({...action,group:"common"}));
    if (item.type === "equipment" && !item.equipped) {
      actions.splice(1,0,
        {...equipAction("wield-secondary",item.slot === "weapon" ? "Wield secondary" : "Wear secondary","W",item,source),group:"primary"},
        {...equipAction("swap","Swap","x",item,source),group:"primary"}
      );
    }
    if (source === "inventory") {
      const destination = BAGS.find(bag => bagAcceptsItem(bag,item));
      if (destination) actions.splice(primary ? 1 : 0,0,{id:"stow",label:"Stow",key:"s",group:"transfer",disabled:destination.items.length >= destination.capacity,reason:`${destination.name} is full.`});
    } else if (source === "bag") {
      actions.splice(primary ? 1 : 0,0,{id:"unstow",label:"Unstow",key:"s",group:"transfer",disabled:state.browseInventoryFull,reason:"Inventory is full."});
    }
    return actions;
  }

  function selectedInventoryRow() {
    return selectedInventorySlot === null
      ? null
      : inventoryWindowList.querySelector(`[data-inventory-slot="${selectedInventorySlot}"]`);
  }

  function selectInventorySlot(index, focus = true) {
    if (!INVENTORY_ITEMS[index]) return;
    selectedInventorySlot = index;
    $$(`#inventoryWindowList [data-inventory-slot]`).forEach(row => {
      const selected = Number(row.dataset.inventorySlot) === index;
      row.classList.toggle("is-selected", selected);
      row.setAttribute("aria-selected", selected ? "true" : "false");
      row.tabIndex = selected ? 0 : -1;
    });
    const row = selectedInventoryRow();
    inventoryWindowList.setAttribute("aria-activedescendant", row?.id || "");
    if (focus && row) requestAnimationFrame(() => {
      row.focus();
      row.scrollIntoView({block:"nearest"});
    });
  }

  function closeInventoryContextMenu(returnFocus = true) {
    if (inventoryContextMenu.hidden) return;
    windowManager.closeKind("item-context",{restoreFocus:false,force:true});
    inventoryContextMenu.hidden = true;
    inventoryContextMenu.innerHTML = "";
    if (returnFocus) activeItemContext?.row?.focus();
  }

  function itemContextFromRow(row) {
    if (!row) return null;
    const index = Number(row.dataset.itemIndex);
    if (!Number.isInteger(index)) return null;
    if (row.dataset.itemSource === "inventory") {
      const item = INVENTORY_ITEMS[index];
      return item ? {item,index,row,source:"inventory"} : null;
    }
    if (row.dataset.itemSource === "bag") {
      const bag = BAGS.find(entry => entry.slot === row.dataset.bagSlot);
      const item = bag?.items[index];
      return item ? {item,index,row,source:"bag",bag} : null;
    }
    if (row.dataset.itemSource === "equipment") {
      const equipped = EQUIPMENT_ITEMS[index];
      if (!equipped?.name) return null;
      const item = {
        ...equipped,type:equipped.type || "equipment",equipped:true,quantity:equipped.quantity || 1,
        color:TERM_COLORS[equipped.tone || "white"] || TERM_COLORS.white
      };
      return {item,index,row,source:"equipment"};
    }
    if (row.dataset.itemSource === "floor") {
      const item = FLOOR_ITEMS[index];
      return item ? {item,index,row,source:"floor"} : null;
    }
    return null;
  }

  function itemContextFromSelection(selection, row = null) {
    if (!selection || !Number.isInteger(selection.index)) return null;
    if (selection.source === "inventory") {
      const item = INVENTORY_ITEMS[selection.index];
      return item ? {item,index:selection.index,row,source:"inventory"} : null;
    }
    if (selection.source === "bag") {
      const bag = BAGS.find(entry => entry.slot === selection.bagSlot);
      const item = bag?.items[selection.index];
      return item ? {item,index:selection.index,row,source:"bag",bag} : null;
    }
    if (selection.source === "equipment") {
      const equipped = EQUIPMENT_ITEMS[selection.index];
      if (!equipped?.name) return null;
      const item = {
        ...equipped,type:equipped.type || "equipment",equipped:true,quantity:equipped.quantity || 1,
        color:TERM_COLORS[equipped.tone || "white"] || TERM_COLORS.white
      };
      return {item,index:selection.index,row,source:"equipment"};
    }
    if (selection.source === "floor") {
      const item = FLOOR_ITEMS[selection.index];
      return item ? {item,index:selection.index,row,source:"floor"} : null;
    }
    return null;
  }

  function getSelectionActionAvailability(selection,actionId) {
    const context = itemContextFromSelection(selection);
    if (!context) return {enabled:false,reason:"Item data is unavailable."};
    const action = inventoryActionsFor(context.item,context.source,context.bag).find(candidate => candidate.id === actionId);
    if (!action) return {enabled:false,reason:"This item does not support the selected action."};
    return {enabled:!action.disabled,reason:action.reason || "This action is unavailable."};
  }

  function canInvokeSelectionAction(selection, actionId) {
    return getSelectionActionAvailability(selection,actionId).enabled;
  }

  function invokeSelectionAction(selection, actionId, returnFocus = null) {
    const context = itemContextFromSelection(selection,returnFocus);
    if (!context) return false;
    const action = inventoryActionsFor(context.item,context.source,context.bag)
      .find(candidate => candidate.id === actionId && !candidate.disabled);
    if (!action) return false;
    activeItemContext = context;
    invokeInventoryAction(actionId);
    return true;
  }

  function openInventoryContextMenu(row = selectedInventoryRow(), anchorPoint = null) {
    if (!row) return;
    const context = itemContextFromRow(row);
    if (!context) return;
    const {item,index} = context;
    activeItemContext = context;
    windowManager.closeKind("item-context",{restoreFocus:false,force:true});
    windowManager.push("item-context",{source:context.source,index:context.index},{opener:row});
    if (row.closest("#inventoryWindowList")) selectInventorySlot(index, false);
    const actions = inventoryActionsFor(item,context.source,context.bag);
    inventoryContextMenu.innerHTML = actions.map((action, position) => {
      const separator = position && actions[position - 1].group !== action.group
        ? '<div class="inventory-context-separator" role="separator"></div>'
        : "";
      return `${separator}<button type="button" role="menuitem" data-inventory-action="${action.id}" data-action-key="${action.key}" class="${action.danger ? "is-danger" : ""}" ${action.disabled ? `disabled title="${action.reason}"` : ""}>${action.label}</button>`;
    }).join("");
    inventoryContextMenu.hidden = false;
    requestAnimationFrame(() => {
      const menuRect = inventoryContextMenu.getBoundingClientRect();
      const cursorAnchor = anchorPoint
        && Number.isFinite(anchorPoint.clientX)
        && Number.isFinite(anchorPoint.clientY);
      let left;
      let top;
      if (cursorAnchor) {
        const offset = 8;
        left = anchorPoint.clientX + offset;
        if (left + menuRect.width > window.innerWidth - 6) left = anchorPoint.clientX - menuRect.width - offset;
        top = anchorPoint.clientY + offset;
        if (top + menuRect.height > window.innerHeight - 6) top = anchorPoint.clientY - menuRect.height - offset;
      } else {
        left = (window.innerWidth - menuRect.width) / 2;
        top = (window.innerHeight - menuRect.height) / 2;
      }
      inventoryContextMenu.style.left = `${clamp(left, 6, window.innerWidth - menuRect.width - 6)}px`;
      inventoryContextMenu.style.top = `${clamp(top, 6, window.innerHeight - menuRect.height - 6)}px`;
      inventoryContextMenu.querySelector("button:not(:disabled)")?.focus();
    });
  }

  function bagContentsMarkup(item) {
    const bag = BAGS.find(entry => entry.slot === item.bagId);
    if (!bag) return '<p>Container data is unavailable.</p>';
    const rows = Array.from({length:bag.capacity}, (_, index) => {
      const content = bag.items[index];
      if (!content) return '<div class="action-bag-row is-empty"><span></span><span></span><span></span></div>';
      return `<div class="action-bag-row" role="button" tabindex="0" data-item-source="bag" data-bag-slot="${bag.slot}" data-item-index="${index}" aria-haspopup="menu" aria-label="${escapeHtml(content.name)}, ${content.weight.toFixed(1)} pounds" style="color:${content.color}"><span>${INVENTORY_ICONS[content.icon]}</span><span style="color:#c8c6bc">${escapeHtml(content.name)}</span><span style="color:#8d9088">${content.weight.toFixed(1)} lb</span></div>`;
    }).join("");
    return `<p class="action-bag-meta">${bag.items.length} / ${bag.capacity} slots</p><div class="action-bag-list">${rows}</div>`;
  }

  function inspectReportMarkup(item) {
    const lines = [];
    const bag = item.type === "bag" ? BAGS.find(entry => entry.slot === item.bagId) : null;
    if (item.type === "bag") {
      lines.push(["is-info", "It is a subinventory container."]);
      if (bag) {
        lines.push(["", `It can hold up to ${bag.capacity} items or stacks.`]);
        lines.push(["is-dim", `It currently contains ${bag.items.length} ${bag.items.length === 1 ? "stack" : "stacks"}.`]);
      }
    } else if (item.type === "scroll") {
      lines.push(["is-info", "It can be read."]);
      lines.push(["", item.effect === "recharge"
        ? "It attempts to recharge a wand, staff or rod."
        : "It teleports you a great distance."]);
      lines.push(["is-warn", "Reading it consumes one scroll from the stack."]);
    } else if (item.type === "rod") {
      const device = itemDeviceFeature.inspectLines(item);
      lines.push(["is-info", "It can be activated for..."]);
      lines.push(["is-indent is-good", device.effect]);
      lines.push(["", device.target ? "It must be aimed at a target cell." : "It affects the user or surrounding area without a target."]);
      lines.push([item.readyCount > 0 ? "is-good" : "is-warn", device.resource]);
    } else if (item.type === "wand") {
      const device = itemDeviceFeature.inspectLines(item);
      lines.push(["is-info", "It can be aimed for..."]);
      lines.push(["is-indent is-good", device.effect]);
      lines.push(["", device.target ? "It must be aimed at a target cell." : "It requires no target."]);
      lines.push([item.charges > 0 ? "is-good" : "is-warn", `It has ${item.charges} charges remaining.`]);
    } else if (item.type === "staff") {
      const device = itemDeviceFeature.inspectLines(item);
      lines.push(["is-info", "It can be used."]);
      lines.push(["is-indent is-good", device.effect]);
      lines.push([item.charges > 0 ? "is-good" : "is-warn", `It has ${item.charges} charges remaining.`]);
    } else if (item.type === "potion") {
      lines.push(["is-info", "It can be quaffed."]);
      lines.push(["", "Drinking it consumes one potion from the stack."]);
    } else if (item.type === "food") {
      lines.push(["is-info", "It can be eaten."]);
      lines.push(["", "Eating it consumes one item from the stack."]);
    } else if (item.type === "trap") {
      lines.push(["is-info", "It can be used to assemble a monster trap."]);
      lines.push(["", "Placement requires a valid nearby location in the game."]);
    } else if (item.type === "ingredient") {
      lines.push(["is-info", "It is an alchemy ingredient."]);
      lines.push(["", "It has no direct use action in this prototype."]);
    } else if (item.type === "fuel") {
      lines.push(["is-info", "It can be used to refill a compatible lantern."]);
      lines.push(["", `Each flask provides up to ${item.fuelPerItem} turns of fuel.`]);
    } else if (item.type === "equipment") {
      lines.push(["is-info", item.equipped ? "It is currently equipped." : item.slot === "weapon" ? "It can be wielded." : "It can be worn."]);
      lines.push(["", `Equipment slot: ${item.slot}.`]);
      if (item.finiteFuel) {
        lines.push(["is-good", `Fuel: ${item.fuelTurns} / ${item.maxFuelTurns} turns.`]);
        lines.push(["", `It can be refilled with ${item.fuelType}.`]);
      }
      (item.properties || []).forEach(property => lines.push(["is-good", property]));
      if (item.activatable) {
        lines.push(["is-info", "It can be activated for..."]);
        lines.push(["is-indent is-good", `${item.activationText}.`]);
        if (item.usesDirection) lines.push(["", "It must be aimed in a direction."]);
      }
      if (item.trueArtifact) {
        lines.push(["is-good", "It is a true artifact and can never be generated twice."]);
        lines.push(["is-warn", `Artifact level: ${item.artifactLevel}.`]);
      } else if (item.itemLevel !== undefined) lines.push(["is-dim", `Object level: ${item.itemLevel}.`]);
    }
    lines.push(["is-dim", `The stack weighs ${item.weight.toFixed(1)} lb.`]);
    lines.push(["is-info", "It is fully identified."]);
    return `<div class="item-inspect-screen"><h3 class="item-inspect-name" style="color:${item.color}">${escapeHtml(item.name)}</h3><div class="item-inspect-lines">${lines.map(([className,text]) => `<p class="${className}">${escapeHtml(text)}</p>`).join("")}</div><p class="item-inspect-source">Object Information</p></div>`;
  }

  function rememberOpenBagParent() {
    if (!activeItemContext?.row?.closest("#itemActionDialog") || itemActionState?.action.id !== "open-bag") return;
    itemActionBackState = {
      ...itemActionState,
      focusBagSlot:activeItemContext.bag?.slot,
      focusItemIndex:activeItemContext.index
    };
  }

  function renderUseResult(action,item,details = {}) {
    const result = itemUseFeature.complete(action,item,details);
    itemActionState.result = true;
    itemActionDialog.classList.remove("is-compact","is-inspect");
    $("#itemActionTitle").textContent = result.title;
    $("#itemActionBody").innerHTML = itemUseFeature.resultMarkup(result);
    $("#itemActionFooter").innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    requestAnimationFrame(() => $("#itemActionFooter button")?.focus());
  }

  function renderDeviceResult(action,item,details = {}) {
    const result = itemDeviceFeature.complete(action,item,details);
    itemActionState.result = true;
    itemActionDialog.classList.remove("is-compact","is-inspect");
    $("#itemActionTitle").textContent = result.title;
    $("#itemActionBody").innerHTML = itemDeviceFeature.resultMarkup(result);
    $("#itemActionFooter").innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    requestAnimationFrame(() => $("#itemActionFooter button")?.focus());
  }

  function showDeviceResult(action,item,index,details = {}) {
    rememberOpenBagParent();
    openItemActionDialog(action,item,index);
    renderDeviceResult(action,item,details);
  }

  function showUseResult(action,item,index,details = {}) {
    rememberOpenBagParent();
    openItemActionDialog(action,item,index);
    renderUseResult(action,item,details);
  }

  function openUseCommand(command,opener = document.activeElement) {
    const selector = getItemSelectorFeature?.();
    if (!selector) return false;
    return selector.openItemSelector({
      title:command.title,
      allowedSources:command.sources,
      preferredSource:command.preferredSource || "inventory",
      opener,
      availability:selection => getSelectionActionAvailability(selection,command.actionId),
      filter:selection => canInvokeSelectionAction(selection,command.actionId),
      onSelect:selection => invokeSelectionAction(selection,command.actionId,opener)
    });
  }

  function renderEquipResult(action,item,details = {}) {
    const result = itemEquipFeature.complete(action,item,{source:itemActionState?.source || activeItemContext?.source,...details});
    itemActionState.result = true;
    itemActionDialog.classList.remove("is-compact","is-inspect");
    $("#itemActionTitle").textContent = result.title;
    $("#itemActionBody").innerHTML = itemEquipFeature.resultMarkup(result);
    $("#itemActionFooter").innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    requestAnimationFrame(() => $("#itemActionFooter button")?.focus());
  }

  function showEquipResult(action,item,index,details = {}) {
    openItemActionDialog(action,item,index);
    renderEquipResult(action,item,details);
  }

  function openEquipCommand(command,opener = document.activeElement) {
    const selector = getItemSelectorFeature?.();
    if (!selector) return false;
    return selector.openItemSelector({
      title:command.title,
      allowedSources:command.sources,
      preferredSource:command.preferredSource || "inventory",
      opener,
      availability:selection => getSelectionActionAvailability(selection,command.actionId),
      filter:selection => canInvokeSelectionAction(selection,command.actionId),
      onSelect:selection => invokeSelectionAction(selection,command.actionId,opener)
    });
  }

  function openItemActionDialog(action, item, index, track = true) {
    closeInventoryContextMenu(false);
    if (track) windowManager.push("item-action",{action:action.id,index},{opener:activeItemContext?.row});
    itemActionState = {action,item,index,source:activeItemContext?.source,bag:activeItemContext?.bag,result:false};
    const title = $("#itemActionTitle");
    const body = $("#itemActionBody");
    const footer = $("#itemActionFooter");
    itemActionDialog.classList.toggle("is-compact", ["drop","destroy"].includes(action.id));
    itemActionDialog.classList.toggle("is-inspect", action.id === "inspect");
    title.textContent = `${action.label.toUpperCase()} · ${item.name}`;
    footer.innerHTML = "";

    if (action.id === "open-bag") {
      body.innerHTML = bagContentsMarkup(item);
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    } else if (["stow","unstow"].includes(action.id)) {
      const destination = action.id === "stow" ? BAGS.find(bag => bagAcceptsItem(bag,item)) : null;
      const destinationText = action.id === "stow" ? destination?.name || "a compatible container" : "Inventory";
      body.innerHTML = `<p>${action.id === "stow" ? "The client automatically chooses a compatible container." : "The item will be returned to the normal Inventory."}</p><dl class="item-action-details"><dt>Item</dt><dd>${escapeHtml(item.name)}</dd><dt>Destination</dt><dd>${escapeHtml(destinationText)}</dd></dl>${item.quantity > 1 ? `<div class="item-action-form"><label for="itemActionAmount">Amount to ${action.id}</label><input id="itemActionAmount" type="number" min="1" max="${item.quantity}" value="${item.quantity}" /></div>` : ""}`;
      footer.innerHTML = `<button class="item-action-button" type="button" data-action-cancel>Cancel</button><button class="item-action-button" type="button" data-action-confirm>${action.label}</button>`;
    } else if (action.id === "inspect") {
      title.textContent = "OBJECT INFORMATION";
      body.innerHTML = inspectReportMarkup(item);
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    } else if (action.id === "read" && item.effect === "recharge") {
      const targets = INVENTORY_ITEMS.map((candidate, targetIndex) => ({candidate,targetIndex})).filter(({candidate}) => ["wand","rod","staff"].includes(candidate.type));
      body.innerHTML = `<p>Select a device to recharge.</p><div class="action-target-list">${targets.map(({candidate,targetIndex}) => `<button type="button" data-action-target="${targetIndex}"><span>${INVENTORY_ICONS[candidate.icon]}</span><span>${escapeHtml(candidate.name)}</span><span>${candidate.type === "rod" ? `${candidate.readyCount || 0} ready` : `${candidate.charges || 0} charges`}</span></button>`).join("")}</div>`;
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button>';
    } else if (action.id === "refill") {
      const fuels = INVENTORY_ITEMS.map((candidate, targetIndex) => ({candidate,targetIndex}))
        .filter(({candidate}) => candidate.type === "fuel" && candidate.subtype === item.fuelType);
      body.innerHTML = fuels.length
        ? `<p>Select fuel for ${escapeHtml(item.name)}.</p><div class="action-target-list">${fuels.map(({candidate,targetIndex}) => `<button type="button" data-action-target="${targetIndex}"><span>${INVENTORY_ICONS[candidate.icon]}</span><span>${escapeHtml(candidate.name)}</span><span>+${candidate.fuelPerItem} turns</span></button>`).join("")}</div>`
        : `<p class="is-warn">No compatible fuel is available in Inventory.</p>`;
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button>';
    } else if (action.id === "take-off" && item.quantity > 1) {
      body.innerHTML = `<div class="item-action-form"><label for="itemActionAmount">Amount to take off</label><input id="itemActionAmount" type="number" min="1" max="${item.quantity}" value="${item.quantity}" /></div>`;
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button><button class="item-action-button" type="button" data-action-confirm>Take off</button>';
    } else if (action.id === "drop") {
      body.innerHTML = `<div class="item-action-form"><label for="itemActionAmount">Amount to drop</label><input id="itemActionAmount" type="number" min="1" max="${item.quantity}" value="${item.quantity}" /></div>`;
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button><button class="item-action-button" type="button" data-action-confirm>Drop</button>';
    } else if (action.id === "destroy") {
      body.innerHTML = `<p>Destroying items cannot be undone in the game.</p><div class="item-action-form"><label for="itemActionAmount">Amount to destroy</label><input id="itemActionAmount" type="number" min="1" max="${item.quantity}" value="${item.quantity}" /></div>`;
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button><button class="item-action-button danger" type="button" data-action-confirm>Destroy</button>';
    } else if (action.id === "inscribe") {
      body.innerHTML = '<div class="item-action-form"><label for="itemActionInscription">Inscription</label><input id="itemActionInscription" type="text" maxlength="59" autocomplete="off" spellcheck="false" /><label class="inscription-mode" for="itemActionInscriptionAdd"><input id="itemActionInscriptionAdd" type="checkbox" /><span>Add to existing inscription</span><output id="itemActionInscriptionMode">REPLACE</output></label><p class="inscription-mode-note">Unchecked replaces the complete current inscription.</p></div>';
      footer.innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Cancel</button><button class="item-action-button" type="button" data-action-confirm>Apply</button>';
    }

    itemActionLayer.hidden = false;
    itemActionLayer.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => {
      const amountInput = $("#itemActionAmount");
      const initialFocus = amountInput
        || body.querySelector("input:not([disabled]), button:not([disabled])")
        || footer.querySelector("button:not([disabled])")
        || $("#itemActionClose");
      initialFocus?.focus();
      amountInput?.select();
    });
  }

  function showTransferResult() {
    if (!itemActionState || !["stow","unstow"].includes(itemActionState.action.id)) return false;
    const {action,item} = itemActionState;
    const amountInput = $("#itemActionAmount");
    const amount = amountInput ? clamp(Math.round(+amountInput.value || 1),1,item.quantity) : 1;
    const destination = action.id === "stow" ? BAGS.find(bag => bagAcceptsItem(bag,item))?.name : "Inventory";
    $("#itemActionBody").innerHTML = `<div class="item-transfer-result" role="status"><strong>${action.id === "stow" ? "STOW READY" : "UNSTOW READY"}</strong><p>${amount} × ${escapeHtml(item.name)}</p><span>Destination: ${escapeHtml(destination || "compatible container")}</span><small>Prototype result only — item data was not changed.</small></div>`;
    $("#itemActionFooter").innerHTML = '<button class="item-action-button" type="button" data-action-cancel>Close</button>';
    itemActionState.result = true;
    requestAnimationFrame(() => $("#itemActionFooter button")?.focus());
    return true;
  }

  function showTakeOffResult() {
    if (!itemActionState || itemActionState.action.id !== "take-off" || itemActionState.result) return false;
    const amountInput = $("#itemActionAmount");
    if (!amountInput) return false;
    const amount = clamp(Math.round(+amountInput.value || 1),1,itemActionState.item.quantity || 1);
    renderEquipResult(itemActionState.action,itemActionState.item,{amount});
    return true;
  }

  function closeItemActionDialog(returnFocus = true) {
    if (itemActionLayer.hidden) return;
    windowManager.closeKind("item-action",{restoreFocus:false,force:true});
    if (itemActionBackState && itemActionState?.action.id !== "open-bag") {
      const parent = itemActionBackState;
      itemActionBackState = null;
      openItemActionDialog(parent.action,parent.item,parent.index,false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const row = itemActionDialog.querySelector(`[data-bag-slot="${parent.focusBagSlot}"][data-item-index="${parent.focusItemIndex}"]`);
        if (row) {
          activeItemContext = itemContextFromRow(row);
          row.focus();
        }
      }));
      return;
    }
    itemActionLayer.hidden = true;
    itemActionLayer.setAttribute("aria-hidden", "true");
    itemActionState = null;
    itemActionDialog.classList.remove("is-compact","is-inspect");
    $("#itemActionBody").innerHTML = "";
    $("#itemActionFooter").innerHTML = "";
    if (returnFocus) activeItemContext?.row?.focus();
  }

  function updateThrowTarget(col,row) {
    if (!throwTargetState) return;
    const viewport = mapViewport();
    throwTargetState.col = clamp(col,0,viewport.width - 1);
    throwTargetState.row = clamp(row,0,viewport.height - 1);
    throwTargetState.worldX = mapState.cameraX + throwTargetState.col;
    throwTargetState.worldY = mapState.cameraY + throwTargetState.row;
    const canvasRect = mapCanvas.getBoundingClientRect();
    const overlayRect = throwTargeting.getBoundingClientRect();
    const cellWidth = canvasRect.width / viewport.width;
    const cellHeight = canvasRect.height / viewport.height;
    throwTargetCell.style.setProperty("--target-x", `${canvasRect.left - overlayRect.left + throwTargetState.col * cellWidth}px`);
    throwTargetCell.style.setProperty("--target-y", `${canvasRect.top - overlayRect.top + throwTargetState.row * cellHeight}px`);
    throwTargetCell.style.setProperty("--target-width", `${cellWidth}px`);
    throwTargetCell.style.setProperty("--target-height", `${cellHeight}px`);
    throwTargeting.setAttribute("aria-label", `${throwTargetState.action.label} ${throwTargetState.item.name}; target cell ${throwTargetState.worldX}, ${throwTargetState.worldY}`);
  }

  function beginMapTargeting(action,item,index) {
    closeInventoryContextMenu(false);
    if (!itemActionLayer.hidden && itemActionState?.action.id === "open-bag") {
      throwReturnItemActionState = {
        ...itemActionState,
        focusBagSlot:activeItemContext?.bag?.slot,
        focusItemIndex:activeItemContext?.index
      };
      itemActionLayer.hidden = true;
      itemActionLayer.setAttribute("aria-hidden","true");
      itemActionState = null;
    }
    const viewport = mapViewport();
    const playerCol = mapState.playerX - mapState.cameraX;
    const playerRow = mapState.playerY - mapState.cameraY;
    const hostWindow = activeItemContext?.row?.closest("#browseWindow") ? "browse" : activeItemContext?.row?.closest("#combinedItemsWindow") ? "combined" : activeItemContext?.source;
    throwTargetState = {
      action,item,index,
      hostWindow,
      inventoryWasVisible:!inventoryOverlay.hidden,
      equipmentWasVisible:!equipmentOverlay.hidden,
      combinedWasVisible:!combinedItemsOverlay.hidden,
      browseWasVisible:!browseOverlay.hidden,
      col:playerCol >= 0 && playerCol < viewport.width ? playerCol : Math.floor(viewport.width / 2),
      row:playerRow >= 0 && playerRow < viewport.height ? playerRow : Math.floor(viewport.height / 2)
    };
    windowManager.push("map-target",{action:action.id,index},{opener:activeItemContext?.row});
    if (hostWindow !== "browse") {
      inventoryOverlay.hidden = true;
      inventoryOverlay.setAttribute("aria-hidden","true");
    }
    if (activeItemContext?.source === "equipment") {
      equipmentOverlay.hidden = true;
      equipmentOverlay.setAttribute("aria-hidden","true");
    }
    if (hostWindow === "combined") {
      combinedItemsOverlay.hidden = true;
      combinedItemsOverlay.setAttribute("aria-hidden","true");
    }
    if (hostWindow === "browse") {
      browseOverlay.hidden = true;
      browseOverlay.setAttribute("aria-hidden","true");
    }
    throwTargeting.hidden = false;
    throwTargeting.setAttribute("aria-hidden","false");
    $("#throwTargetAction").textContent = action.label.toUpperCase();
    $("#throwTargetText").textContent = `${action.label}: choose a target cell for ${item.name}`;
    $("#throwTargetHelp").textContent = `Mouse or arrows · Enter to ${action.label.toLowerCase()} · Esc to cancel`;
    updateThrowTarget(throwTargetState.col,throwTargetState.row);
    renderMap();
    requestAnimationFrame(() => {
      if (throwTargetState) throwTargeting.focus();
    });
  }

  function requestMapTarget({label="Target",subject="power",opener=document.activeElement,onConfirm,onCancel}={}) {
    if (throwTargetState) return false;
    const viewport = mapViewport();
    const playerCol = mapState.playerX - mapState.cameraX;
    const playerRow = mapState.playerY - mapState.cameraY;
    const action = {id:"external",label};
    const item = {name:subject};
    throwTargetState = {
      action,item,index:-1,hostWindow:"external",external:true,onConfirm,onCancel,
      col:playerCol >= 0 && playerCol < viewport.width ? playerCol : Math.floor(viewport.width / 2),
      row:playerRow >= 0 && playerRow < viewport.height ? playerRow : Math.floor(viewport.height / 2)
    };
    windowManager.push("map-target",{action:"external"},{opener});
    throwTargeting.hidden = false;
    throwTargeting.setAttribute("aria-hidden","false");
    $("#throwTargetAction").textContent = label.toUpperCase();
    $("#throwTargetText").textContent = `${label}: choose a target cell for ${subject}`;
    $("#throwTargetHelp").textContent = `Mouse or arrows · Enter to use · Esc to cancel`;
    updateThrowTarget(throwTargetState.col,throwTargetState.row);
    renderMap();
    requestAnimationFrame(() => { if (throwTargetState) throwTargeting.focus(); });
    return true;
  }

  function endThrowTargeting(restoreInventory = true,completeAction = false) {
    if (!throwTargetState) return;
    const completedTarget = {...throwTargetState};
    const targetSource = activeItemContext?.source;
    const hostWindow = throwTargetState.hostWindow;
    windowManager.closeKind("map-target",{restoreFocus:false,force:true});
    throwTargetState = null;
    throwTargeting.hidden = true;
    throwTargeting.setAttribute("aria-hidden","true");
    renderMap();
    if (completedTarget.external) {
      if (completeAction) completedTarget.onConfirm?.(completedTarget);
      else completedTarget.onCancel?.();
      return;
    }
    if (restoreInventory && completedTarget.browseWasVisible && hostWindow === "browse") {
      browseOverlay.hidden = false;
      browseOverlay.setAttribute("aria-hidden","false");
      requestAnimationFrame(() => activeItemContext?.row?.focus());
    } else if (restoreInventory && completedTarget.combinedWasVisible && hostWindow === "combined") {
      combinedItemsOverlay.hidden = false;
      combinedItemsOverlay.setAttribute("aria-hidden","false");
      requestAnimationFrame(() => activeItemContext?.row?.focus());
    } else if (restoreInventory && completedTarget.inventoryWasVisible && inventoryOpen) {
      inventoryOverlay.hidden = false;
      inventoryOverlay.setAttribute("aria-hidden","false");
      requestAnimationFrame(() => selectedInventoryRow()?.focus());
    } else if (restoreInventory && completedTarget.equipmentWasVisible && targetSource === "equipment") {
      equipmentOverlay.hidden = false;
      equipmentOverlay.setAttribute("aria-hidden","false");
      requestAnimationFrame(() => activeItemContext?.row?.focus());
    } else if (restoreInventory) requestAnimationFrame(() => activeItemContext?.row?.focus());
    if (restoreInventory && throwReturnItemActionState) {
      const parent = throwReturnItemActionState;
      throwReturnItemActionState = null;
      openItemActionDialog(parent.action,parent.item,parent.index,false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const row = itemActionDialog.querySelector(`[data-bag-slot="${parent.focusBagSlot}"][data-item-index="${parent.focusItemIndex}"]`);
        if (row) {
          activeItemContext = itemContextFromRow(row);
          row.focus();
        }
      }));
    }
    if (restoreInventory && completeAction && (USE_ACTION_IDS.has(completedTarget.action.id) || DEVICE_ACTION_IDS.has(completedTarget.action.id))) {
      if (throwReturnItemActionState === null && itemActionState?.action.id === "open-bag") {
        itemActionBackState = {
          ...itemActionState,
          focusBagSlot:activeItemContext?.bag?.slot,
          focusItemIndex:activeItemContext?.index
        };
      }
      if (DEVICE_ACTION_IDS.has(completedTarget.action.id)) showDeviceResult(completedTarget.action,completedTarget.item,completedTarget.index,{target:completedTarget});
      else showUseResult(completedTarget.action,completedTarget.item,completedTarget.index,{target:completedTarget});
    }
  }

  function invokeInventoryAction(actionId) {
    const item = activeItemContext?.item;
    if (!item) return;
    const action = inventoryActionsFor(item,activeItemContext.source,activeItemContext.bag).find(candidate => candidate.id === actionId);
    if (!action || action.disabled) return;
    if (action.id === "open-bag") {
      const opener = activeItemContext.row;
      closeInventoryContextMenu(false);
      getBrowseFeature()?.openBag(item.bagId,opener);
      return;
    }
    if (action.id === "browse-book") {
      const opener = activeItemContext.row;
      closeInventoryContextMenu(false);
      getBrowseFeature()?.openBook(activeItemContext.index,opener);
      return;
    }
    if (["throw","activate","zap","aim"].includes(action.id)
        && (action.id === "throw" || (DEVICE_ACTION_IDS.has(action.id) ? itemDeviceFeature.profileFor(item).target : item.usesDirection))) {
      beginMapTargeting(action,item,activeItemContext.index);
      return;
    }
    if (EQUIP_ACTION_IDS.has(action.id)) {
      closeInventoryContextMenu(false);
      if (action.id === "take-off" && item.quantity > 1) openItemActionDialog(action,item,activeItemContext.index);
      else showEquipResult(action,item,activeItemContext.index);
      return;
    }
    if (DEVICE_ACTION_IDS.has(action.id)) {
      closeInventoryContextMenu(false);
      showDeviceResult(action,item,activeItemContext.index);
      return;
    }
    if (USE_ACTION_IDS.has(action.id) && !(action.id === "read" && item.effect === "recharge")) {
      closeInventoryContextMenu(false);
      showUseResult(action,item,activeItemContext.index);
      return;
    }
    if (action.id === "set-trap") {
      closeInventoryContextMenu();
      return;
    }
    if (action.id === "drop" && item.quantity === 1) {
      closeInventoryContextMenu();
      return;
    }
    if (["uninscribe","auto-inscribe"].includes(action.id)) {
      closeInventoryContextMenu();
      return;
    }
    if (action.id === "paste") {
      closeInventoryContextMenu(false);
      openMapChatEditor(item.name);
      return;
    }
    rememberOpenBagParent();
    openItemActionDialog(action,item,activeItemContext.index);
  }

  function invokeItemActionForRow(row,actionId) {
    const context = itemContextFromRow(row);
    if (!context || !inventoryActionsFor(context.item,context.source,context.bag).some(action => action.id === actionId && !action.disabled)) return false;
    openInventoryContextMenu(row);
    invokeInventoryAction(actionId);
    return true;
  }

  function openInventoryWindow(opener = inventoryShortcut) {
    if (inventoryOpen) return;
    inventoryOpen = true;
    inventoryReturnFocus = opener;
    windowManager.open("inventory",{}, {opener});
    inventoryOverlay.hidden = false;
    inventoryOverlay.setAttribute("aria-hidden", "false");
    inventoryShortcut.setAttribute("aria-expanded", "true");
    selectInventorySlot(INVENTORY_ITEMS.findIndex(Boolean));
  }

  function closeInventoryWindow() {
    if (!inventoryOpen) return;
    endThrowTargeting(false);
    closeInventoryContextMenu(false);
    itemActionBackState = null;
    throwReturnItemActionState = null;
    while (windowManager.has("item-action")) windowManager.closeKind("item-action",{restoreFocus:false,force:true});
    itemActionLayer.hidden = true;
    itemActionLayer.setAttribute("aria-hidden", "true");
    itemActionState = null;
    itemActionDialog.classList.remove("is-compact","is-inspect");
    $("#itemActionBody").innerHTML = "";
    $("#itemActionFooter").innerHTML = "";
    if (!windowManager.closeKind("inventory",{restoreFocus:false,force:true})) finalizeInventoryClosedUi();
  }

  function finalizeInventoryClosedUi() {
    inventoryOpen = false;
    inventoryOverlay.hidden = true;
    inventoryOverlay.setAttribute("aria-hidden", "true");
    inventoryShortcut.setAttribute("aria-expanded", "false");
    selectedInventorySlot = null;
    inventoryWindowList.removeAttribute("aria-activedescendant");
    requestAnimationFrame(() => inventoryReturnFocus?.focus());
  }

  function moveInventorySelection(direction) {
    const occupiedSlots = INVENTORY_ITEMS.map((item, index) => item ? index : -1).filter(index => index >= 0);
    const current = Math.max(0, occupiedSlots.indexOf(selectedInventorySlot));
    const target = clamp(current + direction, 0, occupiedSlots.length - 1);
    selectInventorySlot(occupiedSlots[target]);
  }

  function trapInventoryFocus(event) {
    const focusable = [...inventoryWindow.querySelectorAll('button:not([disabled]), [tabindex="0"]')].filter(element => element.offsetParent !== null);
    if (!focusable.length) return;
    const current = focusable.indexOf(document.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusable.length - 1 : current - 1)
      : (current === focusable.length - 1 ? 0 : current + 1);
    event.preventDefault();
    focusable[next].focus();
  }

  function trapFocusWithin(container,event) {
    const focusable = [...container.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(element => element.offsetParent !== null);
    if (!focusable.length) return;
    const current = focusable.indexOf(document.activeElement);
    const next = event.shiftKey
      ? (current <= 0 ? focusable.length - 1 : current - 1)
      : (current === focusable.length - 1 ? 0 : current + 1);
    event.preventDefault();
    focusable[next].focus();
  }

  function moveContextMenuFocus(direction) {
    const buttons = [...inventoryContextMenu.querySelectorAll("button:not(:disabled)")];
    if (!buttons.length) return;
    const current = Math.max(0,buttons.indexOf(document.activeElement));
    buttons[(current + direction + buttons.length) % buttons.length].focus();
  }

  inventoryShortcut.addEventListener("click", event => {
    if (state.combinedItemsWindow) getCombinedItemsFeature()?.openSection("inventory",event.currentTarget);
    else if (inventoryOpen) closeInventoryWindow();
    else openInventoryWindow(event.currentTarget);
  });
  $("#inventoryWindowClose").addEventListener("click", closeInventoryWindow);
  inventoryOverlay.addEventListener("click", event => {
    if (event.target === inventoryOverlay) closeInventoryWindow();
  });
  inventoryWindowList.addEventListener("click", event => {
    const row = event.target.closest("[data-item-source]");
    if (row) openInventoryContextMenu(row,{clientX:event.clientX,clientY:event.clientY});
  });
  [$("#inventoryList"),$("#equipmentList"),$("#bagsList"),$("#combinedInventoryList"),$("#combinedEquipmentList")].forEach(list => {
    list.addEventListener("click", event => {
      const row = event.target.closest("[data-item-source]");
      if (row) openInventoryContextMenu(row,{clientX:event.clientX,clientY:event.clientY});
    });
    list.addEventListener("keydown", event => {
      const row = event.target.closest("[data-item-source]");
      if (row && ["Enter"," "].includes(event.key)) {
        event.preventDefault();
        openInventoryContextMenu(row);
      } else if (row && event.key === "s" && ["inventory","bag"].includes(row.dataset.itemSource)) {
        event.preventDefault();
        invokeItemActionForRow(row,row.dataset.itemSource === "bag" ? "unstow" : "stow");
      } else if (row && event.key === "b" && row.dataset.itemSource === "inventory") {
        const item = INVENTORY_ITEMS[Number(row.dataset.itemIndex)];
        if (["bag","book"].includes(item?.type)) {
          event.preventDefault();
          invokeItemActionForRow(row,item.type === "bag" ? "open-bag" : "browse-book");
        }
      }
    });
  });
  itemActionDialog.addEventListener("click", event => {
    const row = event.target.closest(".action-bag-row[data-item-source]");
    if (row) openInventoryContextMenu(row,{clientX:event.clientX,clientY:event.clientY});
  });
  itemActionDialog.addEventListener("keydown", event => {
    const row = event.target.closest(".action-bag-row[data-item-source]");
    if (row && ["Enter"," "].includes(event.key)) {
      event.preventDefault();
      openInventoryContextMenu(row);
    }
  });
  inventoryWindow.addEventListener("click", event => {
    if (!event.target.closest("[data-item-source]")) closeInventoryContextMenu(false);
  });
  document.addEventListener("click", event => {
    if (!inventoryContextMenu.hidden && !event.target.closest("#inventoryContextMenu, [data-item-source]"))
      closeInventoryContextMenu(false);
  });
  window.addEventListener("resize", () => closeInventoryContextMenu(false));
  document.addEventListener("scroll", () => closeInventoryContextMenu(false),true);
  inventoryContextMenu.addEventListener("click", event => {
    const action = event.target.closest("[data-inventory-action]");
    if (action && !action.disabled) invokeInventoryAction(action.dataset.inventoryAction);
  });
  $("#itemActionClose").addEventListener("click", () => closeItemActionDialog());
  itemActionLayer.addEventListener("click", event => {
    if (event.target === itemActionLayer || event.target.closest("[data-action-cancel]")) {
      closeItemActionDialog();
      return;
    }
    if (event.target.closest("[data-action-confirm]") && showTransferResult()) return;
    if (event.target.closest("[data-action-confirm]") && showTakeOffResult()) return;
    const target = event.target.closest("[data-action-target]");
    if (target && itemActionState?.action.id === "read" && itemActionState.item.effect === "recharge") {
      const secondaryItem = INVENTORY_ITEMS[Number(target.dataset.actionTarget)];
      if (secondaryItem) renderUseResult(itemActionState.action,itemActionState.item,{secondaryItem});
      return;
    }
    if (target || event.target.closest("[data-action-confirm]")) closeItemActionDialog();
  });
  itemActionLayer.addEventListener("change", event => {
    if (event.target.id !== "itemActionInscriptionAdd") return;
    $("#itemActionInscriptionMode").textContent = event.target.checked ? "ADD" : "REPLACE";
    $(".inscription-mode-note").textContent = event.target.checked
      ? "The entered text is appended to the current inscription."
      : "Unchecked replaces the complete current inscription.";
  });
  itemActionLayer.addEventListener("keydown", event => {
    if (event.key !== "Enter" || !event.target.matches("#itemActionAmount")) return;
    const confirm = itemActionDialog.querySelector("[data-action-confirm]:not(:disabled)");
    if (!confirm) return;
    event.preventDefault();
    confirm.click();
  });
  throwTargeting.addEventListener("pointermove", event => {
    const cell = mapPointerCell(event.clientX,event.clientY);
    if (cell) updateThrowTarget(cell.col,cell.row);
  });
  throwTargeting.addEventListener("click", event => {
    const cell = mapPointerCell(event.clientX,event.clientY);
    if (!cell) return;
    updateThrowTarget(cell.col,cell.row);
    endThrowTargeting(true,true);
  });

  function restoreFocus() {
    if (!itemActionLayer.hidden && itemActionState?.action.id === "open-bag") activeItemContext?.row?.focus();
    else if (inventoryOpen) selectInventorySlot(selectedInventorySlot);
  }

  function handleEscape() {
    if (!inventoryContextMenu.hidden) { closeInventoryContextMenu();return true; }
    if (!itemActionLayer.hidden) { closeItemActionDialog();return true; }
    if (throwTargetState) { endThrowTargeting();return true; }
    if (!browseOverlay.hidden) return false;
    if (inventoryOpen) { closeInventoryWindow();return true; }
    return false;
  }

  function handleKeydown(event, editing) {
    if (throwTargetState) {
      if (event.key === "ArrowLeft") updateThrowTarget(throwTargetState.col - 1,throwTargetState.row);
      else if (event.key === "ArrowRight") updateThrowTarget(throwTargetState.col + 1,throwTargetState.row);
      else if (event.key === "ArrowUp") updateThrowTarget(throwTargetState.col,throwTargetState.row - 1);
      else if (event.key === "ArrowDown") updateThrowTarget(throwTargetState.col,throwTargetState.row + 1);
      else if (["Enter"," "].includes(event.key)) endThrowTargeting(true,true);
      return true;
    }
    if (!itemActionLayer.hidden) {
      if (event.key === "Tab") trapFocusWithin(itemActionDialog,event);
      else if (["Enter"," "].includes(event.key) && document.activeElement.matches("button:not([disabled])")) document.activeElement.click();
      return !editing;
    }
    if (!inventoryContextMenu.hidden) {
      if (event.key === "ArrowUp") moveContextMenuFocus(-1);
      else if (event.key === "ArrowDown") moveContextMenuFocus(1);
      else if (["Enter"," "].includes(event.key)) document.activeElement.closest("[data-inventory-action]")?.click();
      else {
        const actions = [...inventoryContextMenu.querySelectorAll("[data-inventory-action]:not(:disabled)")];
        const action = actions.find(button => button.dataset.actionKey === event.key)
          || actions.find(button => button.dataset.actionKey?.toLowerCase() === event.key.toLowerCase());
        if (action) action.click();
      }
      if (event.key === "Tab") trapFocusWithin(inventoryContextMenu,event);
      return true;
    }
    if (!browseOverlay.hidden) return false;
    if (event.key === "i" && !editing) {
      if (state.combinedItemsWindow) return false;
      if (inventoryOpen) closeInventoryWindow(); else openInventoryWindow();
      return true;
    }
    if (inventoryOpen && !editing) {
      if (["b","e"].includes(event.key)) return false;
      if (event.key === "ArrowUp") moveInventorySelection(-1);
      else if (event.key === "ArrowDown") moveInventorySelection(1);
      else if (["Enter"," "].includes(event.key)) openInventoryContextMenu();
      else if (event.key === "s") {
        const row = selectedInventoryRow();
        if (row) invokeItemActionForRow(row,"stow");
      }
      else if (event.key === "Tab") trapInventoryFocus(event);
      else if (/^[a-w]$/.test(event.key) && !["e","i"].includes(event.key)) selectInventorySlot(event.key.charCodeAt(0) - 97);
      return true;
    }
    if (!editing && !windowManager.gameplayBlocked() && !event.ctrlKey && !event.altKey && !event.metaKey) {
      const equipCommand = EQUIP_COMMANDS[event.key];
      if (equipCommand) return openEquipCommand(equipCommand,event.target);
      const command = USE_COMMANDS[event.key];
      if (command) return openUseCommand(command,event.target);
    }
    return false;
  }

  return {
    getThrowTarget:() => throwTargetState, updateThrowTarget,requestMapTarget,restoreFocus,
    openItemContextMenu:openInventoryContextMenu,closeItemContextMenu:closeInventoryContextMenu,
    invokeItemActionForRow,canInvokeSelectionAction,getSelectionActionAvailability,invokeSelectionAction,
    openInventoryWindow,closeInventoryWindow,isInventoryOpen:() => inventoryOpen,
    handleEscape,handleKeydown,isGameplayBlocked:() => inventoryOpen || Boolean(itemActionState) || Boolean(throwTargetState)
  };
  };
})();
