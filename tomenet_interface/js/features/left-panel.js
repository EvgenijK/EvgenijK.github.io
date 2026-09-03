(() => {
  window.TomeNetPrototype.createLeftPanelFeature = ({state,$,LEFT_PANEL_WIDGETS,DEFAULT_LEFT_PANEL_ORDER,DEFAULT_LEFT_PANEL_VISIBILITY}) => {
    const widgetById = new Map(LEFT_PANEL_WIDGETS.map(widget => [widget.id,widget]));

    function normalizedOrder(order) {
      const normalized = [];
      for (const id of Array.isArray(order) ? order : []) {
        if (widgetById.has(id) && !normalized.includes(id)) normalized.push(id);
      }
      for (const id of DEFAULT_LEFT_PANEL_ORDER) {
        if (!normalized.includes(id)) normalized.push(id);
      }
      return normalized;
    }

    function normalizedVisibility(visibility) {
      const stored = visibility && typeof visibility === "object" ? visibility : {};
      return Object.fromEntries(LEFT_PANEL_WIDGETS.map(widget => [
        widget.id,
        typeof stored[widget.id] === "boolean" ? stored[widget.id] : DEFAULT_LEFT_PANEL_VISIBILITY[widget.id]
      ]));
    }

    function isWidgetVisible(id) {
      return state.leftPanelVisibility?.[id] !== false;
    }

    function isWidgetDisplayed(id) {
      if (!isWidgetVisible(id)) return false;
      if (id === "wideVitals") return Boolean(state.wideHp || state.wideMp || state.wideSanity);
      return true;
    }

    function applyLeftPanel() {
      const previousOrder = JSON.stringify(state.leftPanelOrder);
      const previousVisibility = JSON.stringify(state.leftPanelVisibility);
      state.leftPanelOrder = normalizedOrder(state.leftPanelOrder);
      state.leftPanelVisibility = normalizedVisibility(state.leftPanelVisibility);
      if (JSON.stringify(state.leftPanelOrder) !== previousOrder) {
        localStorage.setItem("tomenet.leftPanelOrder",JSON.stringify(state.leftPanelOrder));
      }
      if (JSON.stringify(state.leftPanelVisibility) !== previousVisibility) {
        localStorage.setItem("tomenet.leftPanelVisibility",JSON.stringify(state.leftPanelVisibility));
      }

      const panel = $(".left-panel > .panel-scroll");
      for (const id of state.leftPanelOrder) {
        const widget = widgetById.get(id);
        const element = $(`#${widget.elementId}`);
        panel.appendChild(element);
        element.hidden = !isWidgetDisplayed(id);
      }

      $("#leftPanelOrderControls").innerHTML = state.leftPanelOrder.map((id,index) => {
        const widget = widgetById.get(id);
        const checked = isWidgetVisible(id) ? "checked" : "";
        return `<div class="right-panel-order-row left-panel-order-row"><label><b>${index + 1}</b><input type="checkbox" data-left-panel-visible="${id}" ${checked}><span>${widget.label}</span></label><span class="right-panel-order-buttons"><button type="button" data-left-order-move="up" data-left-order-id="${id}" aria-label="Move ${widget.label} up" ${index === 0 ? "disabled" : ""}>▲</button><button type="button" data-left-order-move="down" data-left-order-id="${id}" aria-label="Move ${widget.label} down" ${index === state.leftPanelOrder.length - 1 ? "disabled" : ""}>▼</button></span></div>`;
      }).join("");
    }

    return {applyLeftPanel,isWidgetVisible};
  };
})();
