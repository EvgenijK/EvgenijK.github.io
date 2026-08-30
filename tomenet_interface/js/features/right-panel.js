(() => {
  window.TomeNetPrototype.createRightPanelFeature = ({root,state,$,$$,clamp,BAGS,DEFAULT_RIGHT_PANEL_ORDER,RIGHT_PANEL_WIDGETS,fitMapCanvas,renderCharacter}) => {
  function applyLayout() {
    root.style.setProperty("--left-w", `${state.leftWidth}px`);
    root.style.setProperty("--right-w", `${state.rightWidth}px`);
    $("#leftWidth").value = state.leftWidth;
    $("#rightWidth").value = state.rightWidth;
    $("#leftWidthValue").value = `${state.leftWidth}px`;
    $("#rightWidthValue").value = `${state.rightWidth}px`;
    requestAnimationFrame(fitMapCanvas);
  }

  function normalizedRightPanelOrder(order) {
    const valid = new Set(DEFAULT_RIGHT_PANEL_ORDER);
    const normalized = [];
    const hadEquipment = Array.isArray(order) && order.includes("equipment");
    for (const id of Array.isArray(order) ? order : []) {
      if (valid.has(id) && !normalized.includes(id)) normalized.push(id);
    }
    for (const id of DEFAULT_RIGHT_PANEL_ORDER) {
      if (!normalized.includes(id)) normalized.push(id);
    }
    if (!hadEquipment) {
      normalized.splice(normalized.indexOf("equipment"), 1);
      normalized.splice(normalized.indexOf("inventory") + 1, 0, "equipment");
    }
    return normalized;
  }

  function applyRightPanelOrder() {
    const previousOrder = JSON.stringify(state.rightPanelOrder);
    state.rightPanelOrder = normalizedRightPanelOrder(state.rightPanelOrder);
    if (JSON.stringify(state.rightPanelOrder) !== previousOrder) {
      localStorage.setItem("tomenet.rightPanelOrder", JSON.stringify(state.rightPanelOrder));
    }
    const panel = $(".configurable-right-panel");
    for (const id of state.rightPanelOrder) {
      const widget = RIGHT_PANEL_WIDGETS.find(item => item.id === id);
      panel.appendChild($(`#${widget.elementId}`));
    }
    $("#rightPanelOrderControls").innerHTML = state.rightPanelOrder.map((id,index) => {
      const widget = RIGHT_PANEL_WIDGETS.find(item => item.id === id);
      return `<div class="right-panel-order-row"><span><b>${index + 1}</b>${widget.label}</span><span class="right-panel-order-buttons"><button type="button" data-order-move="up" data-order-id="${id}" aria-label="Move ${widget.label} up" ${index === 0 ? "disabled" : ""}>▲</button><button type="button" data-order-move="down" data-order-id="${id}" aria-label="Move ${widget.label} down" ${index === state.rightPanelOrder.length - 1 ? "disabled" : ""}>▼</button></span></div>`;
    }).join("");
  }

  function applyRightPanel() {
    applyRightPanelOrder();
    state.rightPanelHeaderHeight = clamp(Math.round(state.rightPanelHeaderHeight), 18, 48);
    state.msgChatRows = clamp(Math.round(state.msgChatRows), 3, 30);
    state.msgChatFontSize = clamp(Math.round(state.msgChatFontSize), 8, 20);
    if (!["chat","all"].includes(state.rightPanelMessageMode)) state.rightPanelMessageMode = "all";
    state.inventoryFontSize = clamp(Math.round(state.inventoryFontSize), 8, 20);
    state.inventoryWindowFontSize = clamp(Math.round(state.inventoryWindowFontSize), 8, 24);
    state.equipmentFontSize = clamp(Math.round(state.equipmentFontSize), 8, 20);
    state.bagsFontSize = clamp(Math.round(state.bagsFontSize), 8, 20);
    state.characterHeight = clamp(Math.round(state.characterHeight), 20, 100);
    state.characterFontSize = clamp(Math.round(state.characterFontSize), 8, 20);
    if (!["profile","skills","resists"].includes(state.characterPage)) state.characterPage = "profile";
    const bagsCapacity = BAGS.reduce((sum, bag) => sum + bag.capacity, 0);
    state.bagsRowLimit = clamp(Math.round(state.bagsRowLimit), 1, bagsCapacity);
    const widget = $("#msgChatWidget");
    const inventoryWidget = $("#inventoryWidget");
    const equipmentWidget = $("#equipmentWidget");
    const bagsWidget = $("#bagsWidget");
    const characterWidget = $("#characterWidget");
    const rightPanel = $(".configurable-right-panel");
    const compact = window.innerHeight <= 760;
    rightPanel.style.setProperty("--right-widget-head-height", `${state.rightPanelHeaderHeight}px`);
    rightPanel.classList.toggle("hide-widget-heads", state.rightPanelHeadersHidden);
    const messageHeaderHeight = state.rightPanelHeadersHidden ? 0 : state.rightPanelHeaderHeight;
    const messageFeedPadding = compact ? 14 : 19;
    const messageLineHeight = compact ? 1.16 : 1.2;
    const messageRowPadding = compact ? 0 : 1;
    const messageHeights = (fontSize, rows) => ({
      minimum:messageHeaderHeight + messageFeedPadding + 3 * (fontSize * messageLineHeight + messageRowPadding),
      desired:messageHeaderHeight + messageFeedPadding + rows * (fontSize * messageLineHeight + messageRowPadding)
    });
    const msgChatHeights = messageHeights(state.msgChatFontSize, state.msgChatRows);
    widget.hidden = !state.msgChatVisible;
    widget.style.setProperty("--msg-chat-font-size", `${state.msgChatFontSize}px`);
    widget.style.setProperty("--msg-chat-line-height", messageLineHeight);
    widget.style.setProperty("--msg-chat-row-padding", compact ? "0px" : ".5px");
    widget.style.setProperty("--msg-chat-min-height", `${Math.ceil(msgChatHeights.minimum)}px`);
    inventoryWidget.hidden = !state.inventoryVisible;
    inventoryWidget.style.setProperty("--inventory-font-size", `${state.inventoryFontSize}px`);
    $("#inventoryWindow").style.setProperty("--inventory-font-size", `${state.inventoryWindowFontSize}px`);
    equipmentWidget.hidden = !state.equipmentVisible;
    equipmentWidget.style.setProperty("--equipment-font-size", `${state.equipmentFontSize}px`);
    bagsWidget.hidden = !state.bagsVisible;
    bagsWidget.style.setProperty("--bags-font-size", `${state.bagsFontSize}px`);
    characterWidget.hidden = !state.characterVisible;
    characterWidget.style.setProperty("--character-font-size", `${state.characterFontSize}px`);
    renderCharacter();
    $("#rightPanelHeadersHiddenControl").checked = state.rightPanelHeadersHidden;
    $("#rightPanelHeaderHeightControl").value = state.rightPanelHeaderHeight;
    $("#rightPanelHeaderHeightControl").disabled = state.rightPanelHeadersHidden;
    $("#rightPanelHeaderHeightValue").value = `${state.rightPanelHeaderHeight}px`;
    $("#rightPanelHeaderHeightGroup").classList.toggle("is-disabled", state.rightPanelHeadersHidden);
    $("#msgChatVisibleControl").checked = state.msgChatVisible;
    $("#msgChatRowsControl").value = state.msgChatRows;
    $("#msgChatRowsControl").disabled = !state.msgChatVisible;
    $("#msgChatRowsValue").value = `${state.msgChatRows} rows`;
    $("#msgChatRowsGroup").classList.toggle("is-disabled", !state.msgChatVisible);
    $("#msgChatFontSizeControl").value = state.msgChatFontSize;
    $("#msgChatFontSizeControl").disabled = !state.msgChatVisible;
    $("#msgChatFontSizeValue").value = `${state.msgChatFontSize}px`;
    $("#msgChatFontSizeGroup").classList.toggle("is-disabled", !state.msgChatVisible);
    $("#rightPanelMessageModeControl").value = state.rightPanelMessageMode;
    $("#rightPanelMessageModeControl").disabled = !state.msgChatVisible;
    $("#rightPanelMessageModeGroup").classList.toggle("is-disabled", !state.msgChatVisible);
    $("#inventoryVisibleControl").checked = state.inventoryVisible;
    $("#inventoryFontSizeControl").value = state.inventoryFontSize;
    $("#inventoryFontSizeControl").disabled = !state.inventoryVisible;
    $("#inventoryFontSizeValue").value = `${state.inventoryFontSize}px`;
    $("#inventoryFontSizeGroup").classList.toggle("is-disabled", !state.inventoryVisible);
    $("#inventoryWindowFontSizeControl").value = state.inventoryWindowFontSize;
    $("#inventoryWindowFontSizeValue").value = `${state.inventoryWindowFontSize}px`;
    $("#equipmentVisibleControl").checked = state.equipmentVisible;
    $("#equipmentFontSizeControl").value = state.equipmentFontSize;
    $("#equipmentFontSizeControl").disabled = !state.equipmentVisible;
    $("#equipmentFontSizeValue").value = `${state.equipmentFontSize}px`;
    $("#equipmentFontSizeGroup").classList.toggle("is-disabled", !state.equipmentVisible);
    $("#bagsVisibleControl").checked = state.bagsVisible;
    $("#bagsFontSizeControl").value = state.bagsFontSize;
    $("#bagsFontSizeControl").disabled = !state.bagsVisible;
    $("#bagsFontSizeValue").value = `${state.bagsFontSize}px`;
    $("#bagsFontSizeGroup").classList.toggle("is-disabled", !state.bagsVisible);
    $("#bagsRowLimitControl").max = bagsCapacity;
    $("#bagsRowLimitControl").value = state.bagsRowLimit;
    $("#bagsRowLimitControl").disabled = !state.bagsVisible;
    $("#bagsRowLimitValue").value = `${state.bagsRowLimit} rows`;
    $("#bagsRowLimitGroup").classList.toggle("is-disabled", !state.bagsVisible);
    $("#characterVisibleControl").checked = state.characterVisible;
    $("#characterHeightControl").value = state.characterHeight;
    $("#characterHeightControl").disabled = !state.characterVisible;
    $("#characterHeightValue").value = `${state.characterHeight}%`;
    $("#characterHeightGroup").classList.toggle("is-disabled", !state.characterVisible);
    $("#characterFontSizeControl").value = state.characterFontSize;
    $("#characterFontSizeControl").disabled = !state.characterVisible;
    $("#characterFontSizeValue").value = `${state.characterFontSize}px`;
    $("#characterFontSizeGroup").classList.toggle("is-disabled", !state.characterVisible);
    $("#characterPageControl").value = state.characterPage;
    $("#characterPageControl").disabled = !state.characterVisible;
    $("#characterPageGroup").classList.toggle("is-disabled", !state.characterVisible);
    $("#characterResistsLegendHiddenControl").checked = state.characterResistsLegendHidden;
    $("#characterResistsLegendHiddenControl").disabled = !state.characterVisible;
    $("#characterResistsLegendGroup").classList.toggle("is-disabled", !state.characterVisible);
    layoutRightPanelWidgets(msgChatHeights);
  }

  function layoutRightPanelWidgets(msgChatHeights) {
    const panel = $(".configurable-right-panel");
    const msgChat = $("#msgChatWidget");
    const inventory = $("#inventoryWidget");
    const equipment = $("#equipmentWidget");
    const bags = $("#bagsWidget");
    const bagsList = $("#bagsList");
    const character = $("#characterWidget");
    const panelStyle = getComputedStyle(panel);
    const contentHeight = panel.clientHeight - parseFloat(panelStyle.paddingTop) - parseFloat(panelStyle.paddingBottom);
    const visibleCount = [state.msgChatVisible,state.inventoryVisible,state.equipmentVisible,state.bagsVisible,state.characterVisible].filter(Boolean).length;
    const gap = parseFloat(panelStyle.rowGap || panelStyle.gap) || 0;
    const gapsHeight = Math.max(0, visibleCount - 1) * gap;

    bags.style.height = "auto";
    bags.style.flexBasis = "auto";
    character.style.height = "auto";
    character.style.flexBasis = "auto";
    for (const messageWidget of [msgChat]) {
      messageWidget.style.height = "auto";
      messageWidget.style.flexBasis = "auto";
    }
    panel.classList.remove("is-overflowing");
    const inventoryHeight = state.inventoryVisible ? inventory.offsetHeight : 0;
    const equipmentHeight = state.equipmentVisible ? equipment.offsetHeight : 0;
    const bagsHeaderHeight = state.bagsVisible ? bags.querySelector(".right-widget-head").offsetHeight : 0;
    const bagsHeightForRows = rowLimit => {
      let remainingBagRows = rowLimit;
      let listHeight = 0;
      for (const section of bagsList.querySelectorAll(".bag-section")) {
        const sectionRows = [...section.querySelectorAll(".bag-item-row")];
        if (remainingBagRows <= 0) break;
        listHeight += section.querySelector(".bag-section-head").offsetHeight;
        const displayedRows = Math.min(remainingBagRows, sectionRows.length);
        listHeight += sectionRows.slice(0, displayedRows).reduce((sum, row) => sum + row.offsetHeight, 0);
        remainingBagRows -= displayedRows;
      }
      return bagsHeaderHeight + Math.min(bagsList.scrollHeight, listHeight) + 2;
    };
    let bagsHeight = state.bagsVisible ? bagsHeightForRows(state.bagsRowLimit) : 0;
    const minimumBagsHeight = state.bagsVisible ? bagsHeightForRows(Math.min(5, state.bagsRowLimit)) : 0;
    const messageLayouts = {
      msgChat:{widget:msgChat,visible:state.msgChatVisible,minimum:msgChatHeights.minimum,height:state.msgChatVisible ? Math.max(msgChatHeights.minimum,msgChatHeights.desired) : 0}
    };
    const characterHeaderHeight = state.characterVisible ? character.querySelector(".right-widget-head").offsetHeight : 0;
    const characterHeight = state.characterVisible
      ? Math.max(characterHeaderHeight + state.characterFontSize * 4, contentHeight * state.characterHeight / 100)
      : 0;

    let totalHeight = gapsHeight + inventoryHeight + equipmentHeight + bagsHeight + characterHeight
      + messageLayouts.msgChat.height;
    let excess = Math.max(0, totalHeight - contentHeight);
    for (const id of state.rightPanelOrder) {
      const messageLayout = messageLayouts[id];
      if (!messageLayout?.visible || excess <= 0) continue;
      const reduction = Math.min(excess, messageLayout.height - messageLayout.minimum);
      messageLayout.height -= reduction;
      excess -= reduction;
    }
    if (state.bagsVisible && excess > 0) {
      const reduction = Math.min(excess, bagsHeight - minimumBagsHeight);
      bagsHeight -= reduction;
      excess -= reduction;
    }

    const setWidgetHeight = (widget, height) => {
      if (!height) return;
      widget.style.height = `${Math.ceil(height)}px`;
      widget.style.flexBasis = `${Math.ceil(height)}px`;
    };
    setWidgetHeight(msgChat, messageLayouts.msgChat.height);
    setWidgetHeight(bags, bagsHeight);
    setWidgetHeight(character, characterHeight);
    panel.classList.toggle("is-overflowing", excess > 0);
  }

  function scrollMessagesToBottom(widgetId) {
    const feeds = widgetId ? $$(`#${widgetId} .message-feed`) : $$(".message-feed");
    for (const feed of feeds) feed.scrollTop = feed.scrollHeight;
  }

  return {applyLayout,applyRightPanel,scrollMessagesToBottom};
  };
})();
