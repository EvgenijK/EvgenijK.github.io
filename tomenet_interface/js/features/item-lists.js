(() => {
  window.TomeNetPrototype.createItemListFeature = ({$,INVENTORY_CAPACITY,INVENTORY_ITEMS,INVENTORY_ICONS,EQUIPMENT_ITEMS,EQUIPMENT_ICONS,TERM_COLORS,BAGS}) => {
  function inventoryRowsMarkup(mode = "panel") {
    const windowMode = mode !== "panel";
    const idPrefix = mode === "combined" ? "combined-inventory-slot" : "inventory-window-slot";
    return Array.from({length:INVENTORY_CAPACITY}, (_, index) => {
      const item = INVENTORY_ITEMS[index];
      const role = windowMode ? "option" : "button";
      if (!item) {
        return `<div class="inventory-row is-empty" role="${windowMode ? "option" : "listitem"}" aria-label="Empty inventory slot"${windowMode ? ' aria-disabled="true"' : ""}><span></span><span></span><span></span><span></span></div>`;
      }
      const label = String.fromCharCode(97 + index);
      const classes = ["inventory-row", item.magic ? "is-magic" : "", item.rare ? "is-rare" : "", item.trueArtifact ? "is-true-artifact" : ""].filter(Boolean).join(" ");
      const interactiveAttributes = windowMode
        ? ` id="${idPrefix}-${label}" data-inventory-slot="${index}" aria-selected="false" tabindex="-1"`
        : ` tabindex="0"`;
      return `<div class="${classes}" role="${role}" data-item-source="inventory" data-item-index="${index}"${interactiveAttributes} aria-haspopup="menu" aria-label="${label}) ${item.name}${item.trueArtifact ? ", true artifact" : ""}, ${item.weight.toFixed(1)} pounds" style="--inventory-item-color:${item.color}"><span class="inventory-item-icon" aria-hidden="true">${INVENTORY_ICONS[item.icon]}</span><span class="inventory-item-key">${label})</span><span class="inventory-item-name" title="${item.name}">${item.name}${item.rare ? '<i class="inventory-rare-dot" aria-hidden="true"></i>' : ""}</span><span class="inventory-item-weight">${item.weight.toFixed(1)} lb</span></div>`;
    }).join("");
  }

  function buildInventoryUi() {
    $("#inventoryList").innerHTML = inventoryRowsMarkup("panel");
    $("#inventoryWindowList").innerHTML = inventoryRowsMarkup("window");
    $("#combinedInventoryList").innerHTML = inventoryRowsMarkup("combined");
    const count = `${INVENTORY_ITEMS.length} / ${INVENTORY_CAPACITY}`;
    $("#inventoryCount").textContent = count;
    $("#inventoryWindowCount").textContent = count;
    $("#combinedInventoryCount").textContent = count;
  }

  function equipmentSetTone(level = 0) {
    if (level <= 1) return "white";
    if (level === 2) return "green";
    if (level === 3) return "l-blue";
    if (level === 4) return "violet";
    if (level === 5) return "l-red";
    if (level === 6) return "orange";
    return "l-umber";
  }

  function equipmentRowsMarkup(mode = "panel") {
    const windowMode = mode !== "panel";
    const idPrefix = mode === "combined" ? "combined-equipment-slot" : "equipment-window-slot";
    return EQUIPMENT_ITEMS.map((item,index) => {
      const empty = !item.name;
      const name = item.name || item.slotName;
      const itemTone = item.unavailable || empty ? "l-dark" : item.tone || "white";
      const keyTone = item.unavailable || empty ? "l-dark" : equipmentSetTone(item.setLevel);
      const weightTone = item.unavailable ? "l-dark" : item.ironTrade ? "slate" : "white";
      const classes = ["equipment-row",empty ? "is-empty" : "",item.unavailable ? "is-unavailable" : "",item.ironTrade ? "is-iron-trade" : ""].filter(Boolean).join(" ");
      const weight = empty || !item.weight ? "" : `${item.weight.toFixed(1)} lb`;
      const attributes = windowMode
        ? ` id="${idPrefix}-${item.key}" data-equipment-slot="${index}"${empty ? "" : ` data-item-source="equipment" data-item-index="${index}" aria-haspopup="menu"`} aria-selected="false" tabindex="-1"`
        : empty ? "" : ` data-equipment-slot="${index}" data-item-source="equipment" data-item-index="${index}" aria-haspopup="menu" tabindex="0"`;
      const role = windowMode ? "option" : empty ? "listitem" : "button";
      return `<div class="${classes}" role="${role}"${attributes} aria-label="${item.key}) ${name}${weight ? `, ${item.weight.toFixed(1)} pounds` : ""}" style="--equipment-item-color:${TERM_COLORS[itemTone]};--equipment-key-color:${TERM_COLORS[keyTone]};--equipment-weight-color:${TERM_COLORS[weightTone]}"><span class="equipment-item-icon" aria-hidden="true">${EQUIPMENT_ICONS[item.slot]}</span><span class="equipment-item-key">${item.key})</span><span class="equipment-item-name" title="${name}">${name}</span><span class="equipment-item-weight">${weight}</span></div>`;
    }).join("");
  }

  function equipmentMapMarkup() {
    return EQUIPMENT_ITEMS.map((item,index) => {
      const empty = !item.name;
      const name = item.name || item.slotName;
      const itemTone = item.unavailable || empty ? "l-dark" : item.tone || "white";
      const keyTone = item.unavailable || empty ? "l-dark" : equipmentSetTone(item.setLevel);
      return `<button class="equipment-map-slot${empty ? " is-empty" : ""}" type="button" data-equipment-slot="${index}"${empty ? "" : ` data-item-source="equipment" data-item-index="${index}" aria-haspopup="menu"`} aria-pressed="false" aria-label="${item.key}) ${name}" title="${name}" style="--equipment-item-color:${TERM_COLORS[itemTone]};--equipment-key-color:${TERM_COLORS[keyTone]}">${EQUIPMENT_ICONS[item.slot]}<b>${item.key}</b></button>`;
    }).join("");
  }

  function buildEquipmentUi() {
    $("#equipmentList").innerHTML = equipmentRowsMarkup("panel");
    $("#equipmentWindowList").innerHTML = equipmentRowsMarkup("window");
    $("#combinedEquipmentList").innerHTML = equipmentRowsMarkup("combined");
    $("#equipmentSlotMap").innerHTML = equipmentMapMarkup();
    $("#combinedEquipmentSlotMap").innerHTML = equipmentMapMarkup();
  }

  function buildBagsUi() {
    $("#bagsList").innerHTML = BAGS.map(bag => {
      const items = bag.items.map((item, index) => {
        const label = String.fromCharCode(97 + index);
        const classes = ["bag-item-row", item.magic ? "is-magic" : "", item.rare ? "is-rare" : ""].filter(Boolean).join(" ");
        return `<div class="${classes}" role="button" tabindex="0" data-item-source="bag" data-bag-slot="${bag.slot}" data-item-index="${index}" aria-haspopup="menu" aria-label="${label}) ${item.name}, ${item.weight.toFixed(1)} pounds" style="--bag-color:${item.color}"><span class="bag-item-indent"></span><span class="bag-item-icon" aria-hidden="true">${INVENTORY_ICONS[item.icon]}</span><span class="bag-item-key">${label})</span><span class="bag-item-name" title="${item.name}">${item.name}${item.rare ? '<i class="inventory-rare-dot" aria-hidden="true"></i>' : ""}</span><span class="bag-item-weight">${item.weight.toFixed(1)} lb</span></div>`;
      }).join("");
      return `<section class="bag-section" aria-label="${bag.name}"><header class="bag-section-head" role="button" tabindex="0" data-browse-bag="${bag.slot}" aria-label="Browse ${bag.name}" style="--bag-color:${bag.color}"><span class="bag-section-icon" aria-hidden="true">${INVENTORY_ICONS[bag.icon]}</span><strong><b>[${bag.slot}]</b> ${bag.name}</strong><span>${bag.items.length} / ${bag.capacity}</span></header><div class="bag-items" role="list" aria-label="Contents of ${bag.name}">${items}</div></section>`;
    }).join("");
    $("#bagsCount").textContent = `${BAGS.length} CONTAINERS`;
  }

  return {buildInventoryUi,buildEquipmentUi,buildBagsUi};
  };
})();
