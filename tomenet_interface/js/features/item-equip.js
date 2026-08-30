(() => {
  window.TomeNetPrototype.createItemEquipFeature = ({escapeHtml,appendGameMessage,EQUIPMENT_ITEMS,EQUIPMENT_SLOT_META}) => {
    const slotEntry = slotId => EQUIPMENT_ITEMS.find(entry => entry.equipSlotId === slotId) || null;
    const slotLabel = slotId => EQUIPMENT_SLOT_META[slotId]?.label || slotId || "Unknown slot";
    const eligibleSlots = item => (item.eligibleEquipSlots || []).filter(slotId => EQUIPMENT_SLOT_META[slotId]);
    const sourceLabel = source => ({inventory:"Inventory",equipment:"Equipment",floor:"Floor"})[source] || source;
    const cleanStackName = item => item.name.replace(/^\d+\s*[×x]?\s*/i,"");
    const amountName = (item,amount) => amount > 1 ? `${amount} × ${cleanStackName(item)}` : cleanStackName(item);

    function availability(actionId,item,source,options = {}) {
      const equipable = item?.type === "equipment" && eligibleSlots(item).length > 0;
      if (["wield","wield-secondary"].includes(actionId)) {
        if (!equipable || item.equipped) return {enabled:false,reason:"This item cannot be worn or wielded."};
        if (item.equipBlockedReason) return {enabled:false,reason:item.equipBlockedReason};
        return {enabled:true};
      }
      if (actionId === "take-off") {
        if (!item?.equipped || !item.equipSlotId) return {enabled:false,reason:"The item is not equipped."};
        if (item.takeOffBlockedReason) return {enabled:false,reason:item.takeOffBlockedReason};
        if (options.inventoryFull) return {enabled:false,reason:"Inventory is full."};
        return {enabled:true};
      }
      if (actionId === "swap") {
        if (source === "equipment" && handExchange(item)) return item.takeOffBlockedReason
          ? {enabled:false,reason:item.takeOffBlockedReason}
          : {enabled:true};
        if (source === "equipment") return availability("take-off",item,source,options);
        if (source !== "inventory" || !equipable) return {enabled:false,reason:"Swap accepts wearable Inventory items or equipped items."};
        if (item.equipBlockedReason) return {enabled:false,reason:item.equipBlockedReason};
        return {enabled:true};
      }
      return {enabled:false,reason:"Unsupported equipment action."};
    }

    function preferredSlot(item,secondary = false) {
      const slots = eligibleSlots(item);
      return secondary && slots[1] ? slots[1] : slots[0];
    }

    function smartSwapSlot(item) {
      const slots = eligibleSlots(item);
      if (!item.swapTag || slots.length < 2) return slots[0];
      const primary = slotEntry(slots[0]);
      const secondary = slotEntry(slots[1]);
      if (secondary?.name && secondary.swapTag === item.swapTag && primary?.swapTag !== item.swapTag) return slots[1];
      return slots[0];
    }

    function handExchange(item) {
      if (item.equipSlotId !== "main-hand" || item.equipKind !== "weapon" || !item.swapTag) return null;
      const other = slotEntry("off-hand");
      if (!other?.name || other.equipKind !== "weapon" || other.swapTag !== item.swapTag) return null;
      return other;
    }

    function equipPlan(action,item,details) {
      const secondary = action.id === "wield-secondary";
      const targetSlotId = action.id === "swap" ? smartSwapSlot(item) : preferredSlot(item,secondary);
      const occupied = slotEntry(targetSlotId);
      const verb = item.equipKind === "weapon" ? "WIELD" : "WEAR";
      return {
        title:secondary ? `SECONDARY ${verb} COMPLETE` : action.id === "swap" ? "SWAP COMPLETE" : `${verb} COMPLETE`,
        itemName:item.name,source:sourceLabel(details.source),slot:slotLabel(targetSlotId),
        changes:[{slot:slotLabel(targetSlotId),before:occupied?.name || "Empty",after:item.name}],
        displaced:occupied?.name ? `${occupied.name} → Inventory` : null,
        message:action.id === "swap"
          ? `You swap in ${item.name}.`
          : item.equipKind === "weapon" ? `You wield ${item.name}.` : `You wear ${item.name}.`
      };
    }

    function takeOffPlan(action,item,details) {
      const requested = details.amount === undefined && action.id === "swap" ? item.quantity || 1 : Number(details.amount) || 1;
      const amount = Math.max(1,Math.min(requested,item.quantity || 1));
      const remaining = Math.max(0,(item.quantity || 1) - amount);
      return {
        title:action.id === "swap" ? "SWAP COMPLETE" : "TAKE OFF COMPLETE",
        itemName:item.name,source:"Equipment",slot:slotLabel(item.equipSlotId),amount,
        changes:[{slot:slotLabel(item.equipSlotId),before:item.name,after:remaining ? amountName(item,remaining) : "Empty"}],
        displaced:`${amountName(item,amount)} → Inventory`,
        message:action.id === "swap" ? `You swap out ${amountName(item,amount)}.` : `You take off ${amountName(item,amount)}.`
      };
    }

    function exchangePlan(action,item,other) {
      return {
        title:"SWAP COMPLETE",itemName:item.name,source:"Equipment",slot:"Main hand ↔ Off-hand",
        changes:[
          {slot:slotLabel("main-hand"),before:item.name,after:other.name},
          {slot:slotLabel("off-hand"),before:other.name,after:item.name}
        ],
        displaced:null,message:`You exchange ${item.name} and ${other.name} between hands.`
      };
    }

    function complete(action,item,details = {}) {
      let result;
      if (action.id === "take-off") result = takeOffPlan(action,item,details);
      else if (action.id === "swap" && details.source === "equipment") {
        const other = handExchange(item);
        result = other ? exchangePlan(action,item,other) : takeOffPlan(action,item,details);
      } else result = equipPlan(action,item,details);
      appendGameMessage?.({type:"world",markup:`<b class="gold">You:</b> ${escapeHtml(result.message)}`});
      return result;
    }

    function resultMarkup(result) {
      const changes = result.changes.map(change => `<div class="item-equip-change"><strong>${escapeHtml(change.slot)}</strong><span>${escapeHtml(change.before)}</span><b>→</b><span>${escapeHtml(change.after)}</span></div>`).join("");
      return `<div class="item-equip-result" role="status"><strong>${escapeHtml(result.title)}</strong><p class="item-equip-name">${escapeHtml(result.itemName)}</p><dl class="item-equip-meta"><dt>Source</dt><dd>${escapeHtml(result.source)}</dd><dt>Slot</dt><dd>${escapeHtml(result.slot)}</dd></dl><div class="item-equip-changes">${changes}</div>${result.displaced ? `<p class="item-equip-displaced">${escapeHtml(result.displaced)}</p>` : ""}<p class="item-equip-message">${escapeHtml(result.message)}</p><small>Prototype result only — Inventory and Equipment were not changed.</small></div>`;
    }

    return {availability,complete,resultMarkup,eligibleSlots};
  };
})();
