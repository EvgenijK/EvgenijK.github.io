(() => {
  window.TomeNetPrototype.createHudFeature = ({root,state,$,$$,clamp,formatNumber,PLAYER_EXP,PY_MAX_EXP,STATUS_ICONS,STATUS_INDICATORS,STATUS_SLOTS,SHIELD_OPTIONS,CONDITION_DEFINITIONS,renderCharacter}) => {
  function pingColor(ms) {
    const ratio = clamp((ms - 100) / 900, 0, 1);
    const greenBlue = Math.round(255 - 245 * Math.sqrt(ratio));
    return `rgb(255 ${greenBlue} ${greenBlue})`;
  }

  function pingBand(ms) {
    const index = Math.min(9, Math.floor(clamp(ms, 0, 1000) / 100));
    return {lower:index * 100,upper:(index + 1) * 100};
  }

  function renderWideVitalTicks(id, max) {
    const layer = $(`#wide${id}Ticks`);
    if (!layer || layer.dataset.max === String(max)) return;
    const ticks = [];
    for (let value = 100; value < max; value += 100) {
      ticks.push(`<i style="--wide-vital-tick-position:${value / max * 100}%"></i>`);
    }
    layer.innerHTML = ticks.join("");
    layer.dataset.max = max;
  }

  function applyVitals() {
    state.ping = clamp(Math.round(state.ping), 0, 1000);
    state.hp = clamp(Math.round(state.hp), 0, 1912);
    state.mp = clamp(Math.round(state.mp), 0, 275);
    state.st = clamp(Math.round(state.st), 0, 10);
    state.sanity = clamp(Math.round(state.sanity), 0, 100);
    const pingRange = pingBand(state.ping);
    const pingPct = pingRange.upper / 1000 * 100;
    $("#pingFill").style.width = `${pingPct}%`;
    $("#pingFill").style.setProperty("--ping-color", pingColor(pingRange.upper));
    $("#pingValue").textContent = `${pingRange.lower}–${pingRange.upper} ms`;
    $(".ping-meter").setAttribute("aria-valuenow", state.ping);
    $(".ping-meter").setAttribute("aria-valuetext", `${pingRange.lower}–${pingRange.upper} ms`);

    $("#hpText").textContent = `${state.hp} / 1912`;
    $("#hpFill").style.width = `${state.hp / 1912 * 100}%`;
    $("#mpText").textContent = `${state.mp} / 275`;
    $("#mpFill").style.width = `${state.mp / 275 * 100}%`;
    $("#stText").textContent = `${state.st} / 10`;
    $("#stFill").style.width = `${state.st / 10 * 100}%`;

    if (!["word","bar","percent","exact"].includes(state.sanityDisplay)) state.sanityDisplay = "word";
    const sanityLabel = state.sanity >= 90 ? "Sound" : state.sanity >= 75 ? "Sane" : state.sanity >= 50 ? "Weird" : state.sanity >= 25 ? "Crazy" : state.sanity >= 10 ? "Insane" : "MAD";
    const sanityColor = state.sanity >= 75 ? "#51d848" : state.sanity >= 50 ? "#d2c24d" : state.sanity >= 25 ? "#dc8b39" : "#e34b3e";
    const sanityText = $("#sanityText");
    const sanityInlineMeter = $("#sanityInlineMeter");
    sanityText.hidden = state.sanityDisplay === "bar";
    sanityInlineMeter.hidden = state.sanityDisplay !== "bar";
    sanityText.textContent = state.sanityDisplay === "percent"
      ? `${state.sanity}%`
      : state.sanityDisplay === "exact"
        ? `${state.sanity} / 100`
        : sanityLabel;
    sanityText.style.color = sanityColor;
    sanityInlineMeter.style.setProperty("--sanity-color", sanityColor);
    $("#sanityInlineFill").style.width = `${state.sanity}%`;
    sanityInlineMeter.setAttribute("aria-valuenow", state.sanity);

    $("#wideMpFill").style.height = `${state.mp / 275 * 100}%`;
    $("#wideSnFill").style.height = `${state.sanity}%`;
    $("#wideHpFill").style.height = `${state.hp / 1912 * 100}%`;
    const wideValues = [
      {id:"Mp",current:state.mp,max:275},
      {id:"Sn",current:state.sanity,max:100},
      {id:"Hp",current:state.hp,max:1912}
    ];
    wideValues.forEach(({id,current,max}) => {
      const formattedCurrent = formatNumber.format(current);
      const formattedMax = formatNumber.format(max);
      $(`#wide${id}Value`).textContent = formattedCurrent;
      $(`#wide${id}Max`).textContent = `/ ${formattedMax}`;
      const meter = $(`#wide${id}Meter`);
      meter.setAttribute("aria-valuenow", current);
      meter.setAttribute("aria-valuetext", `${formattedCurrent} / ${formattedMax}`);
      renderWideVitalTicks(id, max);
    });
    const wideVitalsCount = [state.wideMp,state.wideSanity,state.wideHp].filter(Boolean).length;
    const standardVitalsCount = 3 - Number(state.wideHp) - Number(state.wideMp);
    $("#healthResource").hidden = state.wideHp;
    $("#manaResource").hidden = state.wideMp;
    $("#sanityLine").hidden = state.wideSanity;
    $("#wideMpBar").hidden = !state.wideMp;
    $("#wideSnBar").hidden = !state.wideSanity;
    $("#wideHpBar").hidden = !state.wideHp;
    $("#wideVitals").hidden = wideVitalsCount === 0;
    $("#wideVitals").style.setProperty("--wide-vital-count", wideVitalsCount);
    $$(".wide-vital-value").forEach(value => { value.hidden = !state.wideVitalValues; });
    $(".vitals").style.setProperty("--standard-vitals-height", `${11 + standardVitalsCount * 36}px`);
    $(".vitals").classList.toggle("wide-vitals-active", state.wideHp || state.wideMp);
    $(".sanity-armor").classList.toggle("wide-vitals-active", state.wideSanity);
    $(".panel-scroll").classList.toggle("wide-vitals-layout", wideVitalsCount > 0);

    $("#pingControl").value = state.ping;
    $("#pingControlValue").value = `${state.ping} ms`;
    $("#hpControl").value = state.hp; $("#hpControlValue").value = state.hp;
    $("#mpControl").value = state.mp; $("#mpControlValue").value = state.mp;
    $("#stControl").value = state.st; $("#stControlValue").value = state.st;
    $("#sanityControl").value = state.sanity; $("#sanityControlValue").value = `${state.sanity}% · ${sanityLabel}`;
    $("#sanityDisplayControl").value = state.sanityDisplay;
    $("#sanityDisplayControl").disabled = state.wideSanity;
    $("#sanityDisplayGroup").classList.toggle("is-disabled", state.wideSanity);
    $("#wideHpControl").checked = state.wideHp;
    $("#wideMpControl").checked = state.wideMp;
    $("#wideSanityControl").checked = state.wideSanity;
    $("#wideVitalValuesControl").checked = state.wideVitalValues;
    renderCharacter();
  }

  function applyEnemyHealth() {
    state.enemyHealth = clamp(Math.round(state.enemyHealth), 0, 100);
    const card = $("#enemyHealthCard");
    const meter = $("#enemyHealthMeter");
    card.hidden = false;
    card.classList.toggle("is-inactive", !state.enemyPresent);
    $("#enemyHealthFill").style.width = `${state.enemyHealth}%`;
    meter.setAttribute("aria-valuenow", state.enemyHealth);
    meter.setAttribute("aria-disabled", state.enemyPresent ? "false" : "true");
    meter.setAttribute("aria-label", state.enemyPresent ? "Enemy health" : "Enemy health: no target");
    $("#enemyPresentControl").checked = state.enemyPresent;
    $("#enemyHealthControl").value = state.enemyHealth;
    $("#enemyHealthControl").disabled = !state.enemyPresent;
    $("#enemyHealthControlValue").value = `${state.enemyHealth}%`;
    $("#enemyHealthControlGroup").classList.toggle("is-disabled", !state.enemyPresent);
  }

  function statusTile(slot) {
    return `<span class="status-icon-tile inactive severity-0" data-status-slot="${slot.id}" data-active="false" style="--status-color:${slot.color}" title="${slot.label}: inactive" role="img" aria-label="${slot.label}: inactive">${STATUS_ICONS[slot.icon]}</span>`;
  }

  function updateStatusTile(slot, presentation, active) {
    const tile = $(`[data-status-slot="${slot.id}"]`);
    if (!tile) return;
    const current = {...slot,...presentation};
    const severity = active ? clamp(current.severity || 0, 0, 4) : 0;
    const critical = active && (current.critical || severity >= 3);
    const inactiveState = current.label && current.label !== slot.label ? current.label : "inactive";
    const description = active ? current.label : `${slot.label}: ${inactiveState}`;
    tile.className = `status-icon-tile ${active ? "active" : "inactive"} severity-${severity}${critical ? " is-critical" : ""}`;
    tile.dataset.active = active ? "true" : "false";
    tile.style.setProperty("--status-color", current.color || slot.color);
    tile.title = description;
    tile.setAttribute("aria-label", description);
    tile.innerHTML = `${STATUS_ICONS[current.icon] || STATUS_ICONS[slot.icon]}${active && current.mark ? `<span class="status-shield-mark" aria-hidden="true">${current.mark}</span>` : ""}`;
  }

  function buildStatusUi() {
    $("#speedIcon").innerHTML = STATUS_ICONS.speed;
    $("#bprIcon").innerHTML = STATUS_ICONS.bpr;
    $("#statusIconGrid").innerHTML = STATUS_SLOTS.map(statusTile).join("");
    $("#statusIndicatorControls").innerHTML = STATUS_INDICATORS.map(status => `
      <label class="status-toggle-control" style="--status-color:${status.color}">
        <span class="status-control-icon">${STATUS_ICONS[status.icon]}</span><span>${status.label}</span>
        <input type="checkbox" data-indicator-control="${status.id}">
      </label>`).join("");
    $("#shieldControl").innerHTML = SHIELD_OPTIONS.map(option => `<option value="${option.value}">${option.label}</option>`).join("");
    $("#conditionControls").innerHTML = CONDITION_DEFINITIONS.map(condition => `
      <label>${condition.label}
        <select data-condition-control="${condition.id}">${condition.options.map(option => `<option value="${option.value}">${option.label}</option>`).join("")}</select>
      </label>`).join("");
  }

  function applyCombatStatuses() {
    state.speed = clamp(Math.round(state.speed), -50, 100);
    state.bpr = clamp(Math.round(state.bpr), 0, 31);
    if (!["numeric","wraith","wstep","pbtrav"].includes(state.bprMode)) state.bprMode = "numeric";
    if (!SHIELD_OPTIONS.some(option => option.value === state.shield)) state.shield = "none";

    let speedText = state.speed > 0 ? `Fast +${state.speed}` : state.speed < 0 ? `Slow ${state.speed}` : "Normal";
    let speedColor = state.speed > 0 ? "#62d354" : state.speed < 0 ? "#b69262" : "#a9ada8";
    if (state.speedBoosted) speedColor = "#5ccbe4";
    if (state.noTele) {
      speedColor = "#626963";
      if (state.speed === 0 && !state.speedBoosted) speedText = "No-Tele";
    }
    $("#speedValue").textContent = speedText;
    $("#speedCard").style.setProperty("--metric-color", speedColor);
    $("#speedCard").title = state.noTele ? `${speedText} · No-Tele grid` : speedText;

    const bprLabels = {wraith:"Wraith",wstep:"WStep",pbtrav:"PbTrav"};
    const bprText = state.bprMode === "numeric" ? `${state.bpr} BpR` : bprLabels[state.bprMode];
    const bprColor = state.bprMode !== "numeric" ? (state.bprMode === "wraith" ? "#e8e8df" : state.bprMode === "wstep" ? "#b79165" : "#5ccbe4") : state.bprBoosted ? "#5ccbe4" : state.bpr ? "#62d354" : "#df4d40";
    $("#bprValue").textContent = bprText;
    $("#bprCard").style.setProperty("--metric-color", bprColor);
    $("#bprCard").title = bprText;
    const stanceMeta={balanced:{short:"Bl",name:"Balanced stance",color:"#9d9d9d"},defensive:{short:"Df",name:"Defensive stance",color:"#5ccbe4"},offensive:{short:"Of",name:"Offensive stance",color:"#ff8d00"}};
    const stance=stanceMeta[state.combatStance]||stanceMeta.balanced;
    const stanceRank=state.combatStanceRank||"STANDARD";
    const stanceBadge=$("#combatStanceBadge");
    stanceBadge.textContent=stance.short;stanceBadge.style.setProperty("--badge-color",stance.color);stanceBadge.title=`${stance.name} · ${stanceRank} · Click to switch`;stanceBadge.setAttribute("aria-label",`${stance.name}, ${stanceRank}. Switch combat stance`);
    const dualHand=state.dualWieldMode!=="main-hand";
    state.dualWieldMode=dualHand?"dual-hand":"main-hand";
    const dualBadge=$("#dualWieldBadge");
    dualBadge.textContent=dualHand?"DH":"MH";
    dualBadge.style.setProperty("--badge-color",dualHand?"#62d354":"#d5b75d");
    const dualLabel=dualHand?"Dual-hand mode":"Main-hand mode";
    dualBadge.title=`${dualLabel} · Click to switch`;
    dualBadge.setAttribute("aria-label",`${dualLabel}. Switch hand mode`);

    STATUS_INDICATORS.forEach(status => updateStatusTile(status, status, Boolean(state.indicators[status.id])));
    const shieldSlot = STATUS_SLOTS.find(slot => slot.kind === "shield");
    const shield = SHIELD_OPTIONS.find(option => option.value === state.shield) || SHIELD_OPTIONS[0];
    updateStatusTile(shieldSlot, shield.value === "none" ? {label:"None",icon:"shield",color:shieldSlot.color} : {...shield,icon:"shield"}, shield.value !== "none");
    CONDITION_DEFINITIONS.forEach(condition => {
      const slot = STATUS_SLOTS.find(item => item.conditionId === condition.id);
      const selected = condition.options.find(option => option.value === state.conditions[condition.id]) || condition.options[0];
      state.conditions[condition.id] = selected.value;
      updateStatusTile(slot, selected.icon ? selected : {label:selected.label,icon:slot.icon,color:slot.color}, Boolean(selected.icon));
    });
    const mycorrhizaSlot=STATUS_SLOTS.find(slot=>slot.kind==="mycorrhiza");
    const mycorrhiza=state.mycorrhiza;
    updateStatusTile(mycorrhizaSlot,mycorrhiza?{label:`Mycorrhiza: ${mycorrhiza.name}`,icon:"mushroom",color:"#69bd66"}:mycorrhizaSlot,Boolean(mycorrhiza));

    $("#speedControl").value = state.speed;
    $("#speedControlValue").value = state.speed > 0 ? `+${state.speed}` : state.speed;
    $("#speedBoostedControl").checked = state.speedBoosted;
    $("#noTeleControl").checked = state.noTele;
    $("#bprControl").value = state.bpr;
    $("#bprControl").disabled = state.bprMode !== "numeric";
    $("#bprControlValue").value = state.bprMode === "numeric" ? state.bpr : bprLabels[state.bprMode];
    $("#bprBoostedControl").checked = state.bprBoosted;
    $("#bprBoostedControl").disabled = state.bprMode !== "numeric";
    $("#bprModeControl").value = state.bprMode;
    STATUS_INDICATORS.forEach(status => {
      const control = $(`[data-indicator-control="${status.id}"]`);
      if (control) control.checked = Boolean(state.indicators[status.id]);
    });
    $("#shieldControl").value = state.shield;
    CONDITION_DEFINITIONS.forEach(condition => {
      const control = $(`[data-condition-control="${condition.id}"]`);
      if (control) control.value = state.conditions[condition.id];
    });
    renderCharacter();
  }

  function experienceRange(level) {
    const safeLevel = clamp(Math.round(level), 1, 100);
    return {
      start: safeLevel === 1 ? 0 : PLAYER_EXP[safeLevel - 2],
      next: safeLevel === 100 ? PY_MAX_EXP : PLAYER_EXP[safeLevel - 1],
    };
  }

  function applyExperience() {
    state.xpLevel = clamp(Math.round(state.xpLevel), 1, 100);
    state.xpProgress = clamp(Math.round(state.xpProgress), 0, 100);
    const range = experienceRange(state.xpLevel);
    const span = Math.max(1, range.next - range.start);
    const current = Math.round(range.start + span * state.xpProgress / 100);
    const remaining = Math.max(0, range.next - current);
    const maxDrainPercent = Math.max(0, 100 - state.xpProgress);

    if (state.xpDrained && maxDrainPercent === 0) state.xpDrained = false;
    if (state.xpDrained) {
      state.xpDrainPercent = clamp(Math.round(state.xpDrainPercent), 1, maxDrainPercent);
    }

    const drainedPoints = state.xpDrained ? Math.round(span * state.xpDrainPercent / 100) : 0;
    const maxExperience = Math.min(range.next, current + drainedPoints);
    const bar = $(".progress.xp");
    const value = $("#xpValue");
    const drainedSegment = $("#xpDrainedSegment");

    $("#xpFill").style.width = `${state.xpProgress}%`;
    $(".xp-level span").textContent = state.xpLevel;
    $(".xp-level").setAttribute("aria-label", `Уровень ${state.xpLevel} — открыть навыки`);
    value.hidden = state.xpHideNumber;
    value.classList.toggle("remaining", state.xpRemainingOnly);
    value.textContent = state.xpRemainingOnly
      ? (remaining ? `−${formatNumber.format(remaining)} XP` : "0 XP")
      : `${formatNumber.format(current)} / ${formatNumber.format(range.next)}`;

    bar.classList.toggle("is-drained", state.xpDrained);
    bar.classList.toggle("is-high", state.xpProgress >= 90);
    bar.setAttribute("aria-label", `Уровень ${state.xpLevel}, опыт ${formatNumber.format(current)} из ${formatNumber.format(range.next)}`);
    drainedSegment.hidden = !state.xpDrained;
    drainedSegment.style.left = `${state.xpProgress}%`;
    drainedSegment.style.width = `${state.xpDrained ? state.xpDrainPercent : 0}%`;
    $("#levelControl").value = state.xpLevel;
    $("#levelControlValue").value = state.xpLevel;
    $("#xpProgressControl").value = state.xpProgress;
    $("#xpProgressControlValue").value = `${state.xpProgress}%`;
    $("#hideXpNumber").checked = state.xpHideNumber;
    $("#xpDrained").checked = state.xpDrained;
    $("#xpDrained").disabled = maxDrainPercent === 0;
    $("#xpDrained").closest(".toggle-control").classList.toggle("is-disabled", maxDrainPercent === 0);
    $("#xpRemainingOnly").checked = state.xpRemainingOnly;
    $("#drainedAmountGroup").hidden = !state.xpDrained;
    $("#drainedAmountControl").disabled = !state.xpDrained;
    $("#drainedAmountControl").max = Math.max(1, maxDrainPercent);
    $("#drainedAmountControl").value = state.xpDrainPercent;
    $("#drainedAmountControlValue").value = `${formatNumber.format(maxExperience - current)} XP`;
    $("#xpThresholds").textContent = `${formatNumber.format(range.start)} → ${formatNumber.format(range.next)} XP`;
    renderCharacter();
  }

  return {applyVitals,applyEnemyHealth,buildStatusUi,applyCombatStatuses,experienceRange,applyExperience};
  };
})();
