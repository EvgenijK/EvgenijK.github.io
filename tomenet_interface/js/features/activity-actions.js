(() => {
  window.TomeNetPrototype.createActivityActionsFeature = ({state,persist,applyCombatStatuses,appendGameMessage,escapeHtml}) => {
    const ACTIVITY_ACTIONS = new Set(["search-once","search-mode","rest"]);
    const BLOCKING_ACTIVITY = new Set(["paralyzed","stasis","suspended"]);
    const MAX_HP = 1912;
    const MAX_MP = 275;
    const MAX_ST = 10;

    function currentActivity() {
      return state.conditions.activity || "none";
    }

    function appendResult(message,error = false) {
      appendGameMessage({
        type:"state",
        markup:`<b class="gold">You:</b> ${escapeHtml(message)} <span class="slate">(prototype only)</span>`,
        ...(error ? {danger:true} : {})
      });
    }

    function restBlockReason() {
      const activity = currentActivity();
      if (BLOCKING_ACTIVITY.has(activity)) return `You cannot rest while ${activity}.`;
      if (state.conditions.poison === "diseased") return "You cannot rest while diseased.";
      if (state.conditions.poison !== "none") return "You cannot rest while poisoned.";
      if (state.conditions.cut !== "none") return "You cannot rest while wounded.";
      if (state.hp >= MAX_HP && state.mp >= MAX_MP && state.st >= MAX_ST) return "You are already fully rested.";
      return "";
    }

    function setActivity(value) {
      state.conditions.activity = value;
      applyCombatStatuses();
      persist();
    }

    function activate(actionId) {
      if (!ACTIVITY_ACTIONS.has(actionId)) return false;
      if (actionId === "search-once") {
        appendResult("You carefully search the area around you.");
        return true;
      }
      if (actionId === "search-mode") {
        const active = currentActivity() === "searching";
        setActivity(active ? "none" : "searching");
        appendResult(active ? "You stop searching." : "You begin searching carefully each turn.");
        return true;
      }
      if (currentActivity() === "resting") {
        setActivity("none");
        appendResult("You stop resting.");
        return true;
      }
      const reason = restBlockReason();
      if (reason) {
        appendResult(reason,true);
        return true;
      }
      setActivity("resting");
      appendResult("You begin resting until fully recovered.");
      return true;
    }

    function syncContextMenu(menu) {
      const activity = currentActivity();
      [["search-mode",activity === "searching"],["rest",activity === "resting"]].forEach(([actionId,active]) => {
        const button = menu.querySelector(`[data-map-action="${actionId}"]`);
        if (!button) return;
        button.classList.toggle("is-active",active);
        button.setAttribute("aria-checked",active ? "true" : "false");
        const stateLabel = button.querySelector("small");
        if (stateLabel) stateLabel.textContent = active ? "ON" : "OFF";
      });
    }

    return {activate,syncContextMenu};
  };
})();
