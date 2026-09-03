(() => {
  window.TomeNetPrototype.createRangedActionFeature = ({state,escapeHtml,appendGameMessage}) => {
    const launcherNames = {
      bow:"Long Bow of Extra Might",
      crossbow:"Crossbow",
      sling:"Sling",
      boomerang:"Boomerang"
    };
    const ammunitionNames = {
      bow:"Seeker Arrow",
      crossbow:"Seeker Bolt",
      sling:"Rounded Pebble"
    };

    function availability() {
      if (state.rangedDemoLauncher === "none") {
        return {allowed:false,reason:"You have nothing to fire with."};
      }
      if (state.rangedDemoLauncher !== "boomerang" && state.rangedDemoAmmo <= 0) {
        return {allowed:false,reason:"Your quiver is empty!"};
      }
      return {allowed:true,reason:""};
    }

    function subject() {
      const launcher = launcherNames[state.rangedDemoLauncher] || "Ranged weapon";
      const ammunition = ammunitionNames[state.rangedDemoLauncher];
      return {
        name:state.rangedDemoLauncher === "boomerang" ? launcher : `${ammunition || "Ammunition"} from ${launcher}`,
        launcher,
        ammunition
      };
    }

    function complete(target) {
      const item = subject();
      const boomerang = state.rangedDemoLauncher === "boomerang";
      const before = Math.max(0,Math.round(Number(state.rangedDemoAmmo) || 0));
      const message = boomerang
        ? `You fire your ${item.launcher} toward (${target.worldX}, ${target.worldY}).`
        : `You fire a ${item.ammunition} toward (${target.worldX}, ${target.worldY}).`;
      appendGameMessage?.({type:"combat",markup:`<b class="gold">You:</b> ${escapeHtml(message)}`});
      return {
        title:"FIRE COMPLETE",
        itemName:item.name,
        effect:boomerang ? "The returning weapon is launched toward the selected cell." : "One equipped projectile is launched toward the selected cell.",
        message,
        target,
        resource:boomerang ? null : {label:"Ammunition",before,after:Math.max(0,before - 1)}
      };
    }

    function resultMarkup(result) {
      const resource = result.resource
        ? `<dl class="item-use-resource"><dt>${escapeHtml(result.resource.label)}</dt><dd><span>${result.resource.before}</span><b>→</b><span>${result.resource.after}</span></dd></dl>`
        : '<p class="item-use-resource-note">Returning weapon · no ammunition consumed</p>';
      return `<div class="item-use-result" role="status"><strong>${escapeHtml(result.title)}</strong><p class="item-use-name">${escapeHtml(result.itemName)}</p><p class="item-use-effect">${escapeHtml(result.effect)}</p>${resource}<p class="item-use-target">Target cell: ${result.target.worldX}, ${result.target.worldY}</p><p class="item-use-message">${escapeHtml(result.message)}</p><small>Prototype result only — equipment, ammunition and map data were not changed.</small></div>`;
    }

    function reportUnavailable(reason) {
      appendGameMessage?.({type:"combat",markup:`<b class="gold">You:</b> ${escapeHtml(reason)} <span class="slate">(prototype only)</span>`});
    }

    return {availability,subject,complete,resultMarkup,reportUnavailable};
  };
})();
