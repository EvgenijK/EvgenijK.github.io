(() => {
  const DEVICE_PROFILES = {
    "wand:wall-creation":{
      actionId:"aim",title:"AIM WAND COMPLETE",target:true,
      effect:"A wall of stone rises at the selected location.",
      success:"The wand releases a pulse of shaping magic."
    },
    "rod:disarming":{
      actionId:"zap",title:"ZAP ROD COMPLETE",target:true,
      effect:"Traps and locked doors along the selected line are disarmed.",
      success:"A precise spark runs from the rod toward the target."
    },
    "rod:drain-life":{
      actionId:"zap",title:"ZAP ROD COMPLETE",target:true,
      effect:"The selected target is struck by life-draining power.",
      success:"A dark current leaps from the rod toward the target."
    },
    "rod:healing":{
      actionId:"zap",title:"ZAP ROD COMPLETE",target:false,
      effect:"Restorative power closes wounds and renews the body.",
      success:"A warm light flows from the rod."
    },
    "staff:genocide":{
      actionId:"use-staff",title:"USE STAFF COMPLETE",target:false,
      effect:"The staff invokes genocide across the surrounding area.",
      success:"The staff glows with a terrible green light."
    }
  };

  const TYPE_ACTION = {wand:"aim",staff:"use-staff",rod:"zap"};
  const FAILURE_COPY = {
    failure:{title:"DEVICE USE FAILED",message:item => `You failed to use the ${item.type} properly.`,effect:"The device does not release its power."},
    antimagic:{title:"ANTI-MAGIC DISRUPTION",message:() => "Your anti-magic shell disrupts your attempt.",effect:"The attempt is disrupted before the device can answer."}
  };

  window.TomeNetPrototype.createItemDeviceFeature = ({state,escapeHtml,appendGameMessage}) => {
    function profileFor(item) {
      const profile = DEVICE_PROFILES[`${item.type}:${item.subtype}`];
      if (profile) return profile;
      return {
        actionId:TYPE_ACTION[item.type],
        title:`${item.type === "wand" ? "AIM WAND" : item.type === "rod" ? "ZAP ROD" : "USE STAFF"} COMPLETE`,
        target:item.type === "rod" ? true : Boolean(item.usesDirection),
        effect:"The device releases an unidentified magical effect.",
        success:"The device answers your will."
      };
    }

    function resourceFor(item,successful = true) {
      if (item.type === "rod") {
        const ready = Math.max(0,Number(item.readyCount) || 0);
        const charging = Math.max(0,Number(item.chargingCount) || 0);
        return {
          kind:"rod",label:"Rod readiness",
          before:`${ready} ready · ${charging} charging`,
          after:successful ? `${Math.max(0,ready - 1)} ready · ${charging + 1} charging` : `${ready} ready · ${charging} charging`
        };
      }
      const charges = Math.max(0,Number(item.charges) || 0);
      return {kind:"charges",label:"Charges",before:String(charges),after:String(successful ? Math.max(0,charges - 1) : charges)};
    }

    function availability(actionId,item,source,bag = null) {
      if (!TYPE_ACTION[item?.type] || TYPE_ACTION[item.type] !== actionId)
        return {enabled:false,reason:"This item does not support the selected device command."};
      if (source === "bag" && bag?.subtype === "device-wrap" && state.deviceWrappingSkill === "insufficient")
        return {enabled:false,reason:"Antistatic Wrapping requires 15.000 Magic Device or Trapping skill."};
      if (state.deviceReadiness === "empty") {
        return {enabled:false,reason:item.type === "rod" ? "The rods are still charging." : `The ${item.type} has no charges left.`};
      }
      if (item.type === "rod" && Math.max(0,Number(item.readyCount) || 0) <= 0)
        return {enabled:false,reason:"The rods are still charging."};
      if (item.type !== "rod" && Math.max(0,Number(item.charges) || 0) <= 0)
        return {enabled:false,reason:`The ${item.type} has no charges left.`};
      return {enabled:true,reason:""};
    }

    function complete(action,item,details = {}) {
      const profile = profileFor(item);
      const failure = FAILURE_COPY[state.deviceOutcome];
      const successful = !failure;
      const message = successful ? profile.success : failure.message(item);
      appendGameMessage?.({type:"world",markup:escapeHtml(message)});
      return {
        title:successful ? profile.title : failure.title,
        successful,itemName:item.name,
        effect:successful ? profile.effect : failure.effect,
        message,resource:resourceFor(item,successful),target:details.target || null
      };
    }

    function resultMarkup(result) {
      const target = result.target
        ? `<p class="item-use-target">Target cell: ${result.target.worldX}, ${result.target.worldY}</p>` : "";
      return `<div class="item-use-result item-device-result ${result.successful ? "is-success" : "is-failure"}" role="status"><strong>${escapeHtml(result.title)}</strong><p class="item-use-name">${escapeHtml(result.itemName)}</p><p class="item-use-effect">${escapeHtml(result.effect)}</p><dl class="item-use-resource"><dt>${escapeHtml(result.resource.label)}</dt><dd><span>${escapeHtml(result.resource.before)}</span><b>→</b><span>${escapeHtml(result.resource.after)}</span></dd></dl>${target}<p class="item-use-message">${escapeHtml(result.message)}</p><small>Prototype result only — item data was not changed.</small></div>`;
    }

    function inspectLines(item) {
      const profile = profileFor(item);
      const resource = resourceFor(item,false);
      return {
        effect:profile.effect,
        target:profile.target,
        resource:item.type === "rod"
          ? `${resource.before}. Rods recharge automatically after use.`
          : `It has ${resource.before} charges remaining.`
      };
    }

    return {profileFor,availability,complete,resultMarkup,inspectLines};
  };
})();
