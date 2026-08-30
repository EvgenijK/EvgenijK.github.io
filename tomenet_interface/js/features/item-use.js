(() => {
  const ACTION_DEFAULTS = {
    quaff:{verb:"QUAFF COMPLETE",effect:"The potion takes effect.",message:item => `You quaff ${item.name}.`,resource:"quantity"},
    eat:{verb:"EAT COMPLETE",effect:"The food takes effect.",message:item => `You eat ${item.name}.`,resource:"quantity"},
    read:{verb:"READ COMPLETE",effect:"The scroll's magic is released.",message:item => `You read ${item.name}.`,resource:"quantity"},
    activate:{verb:"ACTIVATION COMPLETE",effect:"The item answers your will.",message:item => `You activate ${item.name}.`,resource:"cooldown"}
  };

  window.TomeNetPrototype.createItemUseFeature = ({escapeHtml,appendGameMessage}) => {
    function profileFor(action,item) {
      const fallback = ACTION_DEFAULTS[action.id] || {
        verb:`${action.label.toUpperCase()} COMPLETE`,effect:"The action succeeds.",
        message:current => `You use ${current.name}.`,resource:null
      };
      return {...fallback,...(item.useProfile || {})};
    }

    function resourcePreview(profile,item) {
      if (profile.resource === "quantity") {
        const before = Math.max(1,Number(item.quantity) || 1);
        return {label:"Stack",before,after:Math.max(0,before - 1)};
      }
      if (profile.resource === "charges") {
        const before = Math.max(0,Number(item.charges) || 0);
        return {label:"Charges",before,after:Math.max(0,before - 1)};
      }
      if (profile.resource === "cooldown") {
        return {label:"Activation",before:"Ready",after:profile.cooldown || item.activationCooldown || "charging"};
      }
      return null;
    }

    function complete(action,item,details = {}) {
      const profile = profileFor(action,item);
      const targetName = details.secondaryItem?.name;
      const message = typeof profile.message === "function" ? profile.message(item,details) : profile.message;
      appendGameMessage?.({type:"world",markup:`<b class="gold">You:</b> ${escapeHtml(message)}`});
      return {
        title:profile.verb,
        itemName:item.name,
        effect:targetName ? `${profile.effect} Target: ${targetName}.` : profile.effect,
        message,
        resource:resourcePreview(profile,item),
        target:details.target || null
      };
    }

    function resultMarkup(result) {
      const resource = result.resource
        ? `<dl class="item-use-resource"><dt>${escapeHtml(result.resource.label)}</dt><dd><span>${escapeHtml(result.resource.before)}</span><b>→</b><span>${escapeHtml(result.resource.after)}</span></dd></dl>`
        : "";
      const target = result.target
        ? `<p class="item-use-target">Target cell: ${result.target.worldX}, ${result.target.worldY}</p>`
        : "";
      return `<div class="item-use-result" role="status"><strong>${escapeHtml(result.title)}</strong><p class="item-use-name">${escapeHtml(result.itemName)}</p><p class="item-use-effect">${escapeHtml(result.effect)}</p>${resource}${target}<p class="item-use-message">${escapeHtml(result.message)}</p><small>Prototype result only — item data was not changed.</small></div>`;
    }

    return {complete,resultMarkup,profileFor};
  };
})();
