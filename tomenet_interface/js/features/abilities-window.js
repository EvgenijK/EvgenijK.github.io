(() => {
  window.TomeNetPrototype.createAbilitiesWindowFeature = ({
    state,$,$$,clamp,persist,windowManager,appendGameMessage,escapeHtml,applyCombatStatuses,abilitiesData,skillsFeature,spellbookFeature,mimicPowersFeature,combatStancesFeature,meleeTechniquesFeature,rangedTechniquesFeature,dragonBreathFeature,runecraftFeature,ghostPowersFeature,mycorrhizaFeature,trappingFeature
  }) => {
    const overlay = $("#abilitiesWindowOverlay");
    const abilitiesWindow = $("#abilitiesWindow");
    const shortcut = $("#abilitiesShortcut");
    const list = $("#abilitiesList");
    const prompt = $("#abilitiesPrompt");
    const promptInput = $("#abilitiesPromptInput");
    const promptError = $("#abilitiesPromptError");
    const placeholderOverlay = $("#abilityPlaceholderOverlay");
    const PAGE_SIZE = 20;
    const runtime = {selectedId:null,page:0,active:new Map(),placeholder:null};

    function values() { return skillsFeature.getSkillSnapshot(); }
    function qualifyingSources(ability,snapshot=values()) {
      return ability.sourceSkillIds.filter(id => (snapshot.get(id) || 0) >= 1000);
    }
    function availableAbilities() {
      const snapshot=values();
      return abilitiesData.filter(ability => ability.builtin || ability.kind.startsWith("mycorrhiza-") || ability.kind==="melee-techniques"&&meleeTechniquesFeature.hasLearnedTechniques() || ability.kind==="ranged-techniques"&&rangedTechniquesFeature.hasLearnedTechniques() || ability.kind==="dragon-breathe"&&dragonBreathFeature.hasBreatheAbility() || ability.kind==="dragon-pick"&&dragonBreathFeature.hasPickAbility() || ability.kind==="ghost-powers"&&ghostPowersFeature.isDemoGhost() || qualifyingSources(ability,snapshot).length).sort((a,b)=>a.order-b.order);
    }
    function selectedAbility(items=availableAbilities()) {
      return items.find(ability=>ability.id===runtime.selectedId) || null;
    }
    function ensureSelection(items) {
      if (!items.some(ability=>ability.id===runtime.selectedId)) runtime.selectedId=items[0]?.id || null;
      const index=Math.max(0,items.findIndex(ability=>ability.id===runtime.selectedId));
      runtime.page=Math.min(Math.floor(index/PAGE_SIZE),Math.max(0,Math.ceil(items.length/PAGE_SIZE)-1));
    }
    function pageItems(items) { return items.slice(runtime.page*PAGE_SIZE,(runtime.page+1)*PAGE_SIZE); }
    function isUnavailable(ability){return ability.kind==="ghost-powers";}
    function rowMarkup(ability,index) {
      const key=String.fromCharCode(97+index);
      const active=ability.kind==="dual-mode"?state.dualWieldMode!=="main-hand":ability.kind==="mycorrhiza-enter"?mycorrhizaFeature.isActive():runtime.active.get(ability.id)===true;
      const unavailable=isUnavailable(ability);
      return `<button class="ability-row${ability.id===runtime.selectedId?" is-selected":""}${active?" is-active":""}${unavailable?" is-unavailable":""}" type="button" role="option" aria-selected="${ability.id===runtime.selectedId}" aria-disabled="${unavailable}" data-ability-id="${ability.id}" data-ability-key="${key}"><kbd>${key})</kbd><span class="ability-row-copy"><span class="ability-row-name">${escapeHtml(ability.label)}</span><span class="ability-row-hint">${escapeHtml(ability.description)}</span></span><span class="ability-row-state" aria-hidden="true"></span></button>`;
    }
    function render({focus=false}={}) {
      const items=availableAbilities();ensureSelection(items);
      const visible=pageItems(items);
      list.innerHTML=visible.length?visible.map(rowMarkup).join(""):'<div class="abilities-empty"><div><strong>NO ACTIVABLE SKILLS</strong><span>Train an actionable skill to at least 1.000.</span></div></div>';
      const unavailableCount=items.filter(isUnavailable).length;const availableCount=items.length-unavailableCount;
      $("#abilitiesWindowCount").textContent=`${availableCount} AVAILABLE${unavailableCount?` · ${unavailableCount} UNAVAILABLE`:""}`;
      const pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));
      $("#abilitiesPages").hidden=pages<=1;
      $("#abilitiesPageStatus").textContent=`PAGE ${runtime.page+1} / ${pages}`;
      abilitiesWindow.classList.toggle("is-compact",!state.abilitiesExpanded);
      if(focus)requestAnimationFrame(()=>selectedRow()?.focus());
    }
    function selectedRow(){return list.querySelector(`[data-ability-id="${runtime.selectedId}"]`);}
    function select(id,{focus=true}={}){if(!availableAbilities().some(item=>item.id===id))return false;runtime.selectedId=id;render({focus});return true;}
    function move(delta){const items=availableAbilities();if(!items.length)return true;const index=Math.max(0,items.findIndex(item=>item.id===runtime.selectedId));runtime.selectedId=items[(index+delta+items.length)%items.length].id;render({focus:true});return true;}
    function changePage(delta){const items=availableAbilities();const pages=Math.max(1,Math.ceil(items.length/PAGE_SIZE));runtime.page=(runtime.page+delta+pages)%pages;runtime.selectedId=items[runtime.page*PAGE_SIZE]?.id||items[0]?.id||null;render({focus:true});return true;}
    function flashInputError(){abilitiesWindow.classList.remove("has-input-error");void abilitiesWindow.offsetWidth;abilitiesWindow.classList.add("has-input-error");setTimeout(()=>abilitiesWindow.classList.remove("has-input-error"),260);}
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function toggleDualMode({focus=false}={}){
      const dualHand=state.dualWieldMode!=="main-hand";
      state.dualWieldMode=dualHand?"main-hand":"dual-hand";
      append(dualHand?"Dual-wield mode: Main-hand. (This disables all dual-wield boni.) (prototype only)":"Dual-wield mode: Dual-hand. (prototype only)");
      applyCombatStatuses();if(isOpen())render({focus});return true;
    }
    function activate(ability=selectedAbility()) {
      if(!ability)return false;
      if(isUnavailable(ability))return true;
      if(ability.id==="cast-spell")return Boolean(spellbookFeature.openCast(selectedRow()||list));
      if(ability.kind==="mimic-powers")return Boolean(mimicPowersFeature.openUse(selectedRow()||list));
      if(ability.kind==="combat-stances")return Boolean(combatStancesFeature.openUse(selectedRow()||list));
      if(ability.kind==="melee-techniques")return Boolean(meleeTechniquesFeature.openUse(selectedRow()||list));
      if(ability.kind==="ranged-techniques")return Boolean(rangedTechniquesFeature.openUse(selectedRow()||list));
      if(ability.kind==="dragon-breathe")return Boolean(dragonBreathFeature.openBreathe(selectedRow()||list));
      if(ability.kind==="dragon-pick")return Boolean(dragonBreathFeature.openElementPicker(selectedRow()||list));
      if(ability.kind==="runecraft")return Boolean(runecraftFeature.openDraw(selectedRow()||list));
      if(ability.kind==="trapping")return Boolean(trappingFeature.open(selectedRow()||list));
      if(ability.kind==="mycorrhiza-enter")return Boolean(mycorrhizaFeature.enter(selectedRow()||list));
      if(ability.kind==="mycorrhiza-leave")return Boolean(mycorrhizaFeature.leave());
      if(ability.kind==="dual-mode")return toggleDualMode({focus:true});
      if(ability.kind==="message")append(ability.result);
      else if(ability.kind==="toggle"){
        const active=!runtime.active.get(ability.id);runtime.active.set(ability.id,active);
        append(`${ability.label}: ${active?"active":"inactive"}.`);
      }else openPlaceholder(ability);
      render({focus:ability.kind!=="placeholder"});return true;
    }
    function showPlaceholder(entry){
      const ability=entry.payload.ability;runtime.placeholder=ability;
      $("#abilityPlaceholderTitle").textContent=ability.child||ability.label;
      $("#abilityPlaceholderText").textContent=ability.childDescription||"This child scenario is not implemented in the prototype yet.";
      placeholderOverlay.hidden=false;placeholderOverlay.setAttribute("aria-hidden","false");
      requestAnimationFrame(()=>$("#abilityPlaceholderReturn").focus());
    }
    function hidePlaceholder(){placeholderOverlay.hidden=true;placeholderOverlay.setAttribute("aria-hidden","true");runtime.placeholder=null;}
    windowManager.register({kind:"ability-placeholder",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:()=>$("#abilityPlaceholderReturn"),onOpen:showPlaceholder,onClose:hidePlaceholder});
    function openPlaceholder(ability){return windowManager.push("ability-placeholder",{ability},{opener:selectedRow()||list});}
    function closePlaceholder(){return windowManager.closeKind("ability-placeholder");}
    function setExpanded(expanded){state.abilitiesExpanded=Boolean(expanded);persist();render({focus:true});applyControls();}
    function openPrompt(){prompt.hidden=false;promptError.textContent="";promptInput.value="";requestAnimationFrame(()=>promptInput.focus());}
    function closePrompt(){prompt.hidden=true;promptError.textContent="";requestAnimationFrame(()=>selectedRow()?.focus());}
    function applyPrompt(){
      const query=promptInput.value.trim();const normalized=query.toLowerCase();const items=availableAbilities();
      const match=items.find(ability=>(ability.mkey!==null&&ability.mkey!==undefined&&String(ability.mkey)===query)||ability.label.toLowerCase()===normalized);
      if(!match){promptError.textContent="No listed ability matches that name or mkey.";promptInput.select();return false;}
      runtime.selectedId=match.id;runtime.page=Math.floor(items.indexOf(match)/PAGE_SIZE);closePrompt();render({focus:true});return true;
    }
    function isOpen(){return windowManager.has("abilities");}
    function show(){overlay.hidden=false;overlay.setAttribute("aria-hidden","false");shortcut.setAttribute("aria-expanded","true");render();requestAnimationFrame(()=>selectedRow()?.focus()||list.focus());}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");shortcut.setAttribute("aria-expanded","false");prompt.hidden=true;}
    windowManager.register({kind:"abilities",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:()=>selectedRow()||list,onOpen:show,onClose:hide});
    function openWindow(opener=document.activeElement){if(isOpen())return false;return windowManager.open("abilities",{},{opener});}
    function closeWindow(){return windowManager.closeKind("abilities");}
    function restoreFocus(){if(isOpen())requestAnimationFrame(()=>selectedRow()?.focus()||list.focus());}
    function activateLetter(key){const row=list.querySelector(`[data-ability-key="${key}"]`);if(!row){flashInputError();return true;}runtime.selectedId=row.dataset.abilityId;render();return activate();}
    function handleKeydown(event){
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      const openShortcut=event.key==="m"&&!event.ctrlKey&&!event.altKey&&!event.metaKey&&!event.shiftKey;
      if(windowManager.has("ability-placeholder")){
        if(event.key==="Escape"||event.key==="Enter"||event.key===" ")closePlaceholder();
        return true;
      }
      if(windowManager.top()?.kind==="item-selector")return false;
      if(openShortcut&&!isOpen()&&!editing){
        const blocked=windowManager.snapshot().some(entry=>["context","dialog","target","system","technical"].includes(entry.layer));
        if(blocked)return false;openWindow(document.activeElement);return true;
      }
      if(!isOpen())return false;
      if(!prompt.hidden){if(event.key==="Escape"){closePrompt();return true;}if(event.key==="Enter"){applyPrompt();return true;}return true;}
      if(event.key===":"&&!editing)return false;
      if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}
      if(event.ctrlKey&&event.code==="KeyT"){append("Screenshot saved as 'screenshot????'. (prototype only)");return true;}
      if(editing)return false;
      if(event.key==="ArrowDown"||event.key==="2")return move(1);
      if(event.key==="ArrowUp"||event.key==="8")return move(-1);
      if(event.key==="Enter")return activate();
      if(event.key==="+"||event.key==="=")return changePage(1);
      if(event.key==="-")return changePage(-1);
      if(event.key==="@"){openPrompt();return true;}
      if(event.key==="*"||event.key==="?"||event.key===" "){setExpanded(!state.abilitiesExpanded);return true;}
      if(/^[a-t]$/i.test(event.key))return activateLetter(event.key.toLowerCase());
      return true;
    }
    function applyControls(){state.abilitiesWindowFontSize=clamp(Math.round(state.abilitiesWindowFontSize),8,20);abilitiesWindow.style.setProperty("--abilities-font-size",`${state.abilitiesWindowFontSize}px`);$("#abilitiesWindowFontSizeControl").value=state.abilitiesWindowFontSize;$("#abilitiesWindowFontSizeValue").value=`${state.abilitiesWindowFontSize}px`;$("#abilitiesExpandedControl").checked=state.abilitiesExpanded;if(isOpen())render();}
    function resetSimulation(){runtime.active.clear();runtime.page=0;runtime.selectedId=null;state.dualWieldMode="dual-hand";applyCombatStatuses();if(isOpen())render();}

    shortcut.addEventListener("click",event=>isOpen()?closeWindow():openWindow(event.currentTarget));
    $("#abilitiesWindowClose").addEventListener("click",closeWindow);
    $("#abilitiesPagePrevious").addEventListener("click",()=>changePage(-1));
    $("#abilitiesPageNext").addEventListener("click",()=>changePage(1));
    list.addEventListener("click",event=>{const row=event.target.closest("[data-ability-id]");if(row){select(row.dataset.abilityId,{focus:false});activate();}});
    prompt.addEventListener("submit",event=>{event.preventDefault();applyPrompt();});
    $("#abilitiesPromptCancel").addEventListener("click",closePrompt);
    $("#abilityPlaceholderClose").addEventListener("click",closePlaceholder);
    $("#abilityPlaceholderReturn").addEventListener("click",closePlaceholder);
    placeholderOverlay.addEventListener("click",event=>{if(event.target===placeholderOverlay)closePlaceholder();});
    overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    skillsFeature.subscribeSkillChanges(()=>{if(isOpen())render();});
    meleeTechniquesFeature.subscribeTechniqueChanges(()=>{if(isOpen())render();});
    rangedTechniquesFeature.subscribeTechniqueChanges(()=>{if(isOpen())render();});
    dragonBreathFeature.subscribeAvailability(()=>{if(isOpen())render();});
    ghostPowersFeature.subscribeAvailability(()=>{if(isOpen())render({focus:true});});

    return {openWindow,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,toggleDualMode,restoreFocus,getAvailableAbilities:availableAbilities};
  };
})();
