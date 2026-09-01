(() => {
  window.TomeNetPrototype.createMeleeTechniquesWindowFeature=({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,techniques,CHARACTER_DATA,skillsFeature
  })=>{
    const overlay=$("#meleeTechniquesOverlay");const windowElement=$("#meleeTechniquesWindow");const list=$("#meleeTechniquesList");
    const prompt=$("#meleeTechniquesPrompt");const promptInput=$("#meleeTechniquesPromptInput");const promptError=$("#meleeTechniquesPromptError");
    const listeners=new Set();const runtime={selectedId:null,parentKind:null};
    function skillSnapshot(){return skillsFeature.getSkillSnapshot();}
    function classLevel(technique){return technique.classLevels?.[CHARACTER_DATA.className]||0;}
    function relevantTechniques(){return techniques.filter(technique=>technique.enabled!==false&&(classLevel(technique)>0||technique.skillAny?.length)).sort((a,b)=>a.index-b.index);}
    function techniqueState(technique){
      const levelRequirement=classLevel(technique);const levelLearned=levelRequirement>0&&state.xpLevel>=levelRequirement;
      const skill=technique.skillAny?.find(requirement=>(skillSnapshot().get(requirement.id)||0)>=requirement.value);const skillLearned=Boolean(skill);
      const learned=levelLearned||skillLearned;let reason="";let status="LEARNED";
      if(!learned&&levelRequirement){status="LEVEL LOCKED";reason=`Requires ${CHARACTER_DATA.className} level ${levelRequirement} (current ${state.xpLevel}).`;}
      else if(!learned&&technique.skillAny?.length){status="SKILL LOCKED";reason=`Requires ${technique.skillAny.map(requirement=>`${requirement.label} ${(requirement.value/1000).toFixed(3)}`).join(" or ")}.`;}
      else if(technique.winnerOnly&&!CHARACTER_DATA.totalWinner){status="ROYAL LOCKED";reason="Requires king or queen status.";}
      else if(technique.cost!==null&&state.st<technique.cost){status="LOW STAMINA";reason=`Requires ${technique.cost} stamina (current ${state.st}).`;}
      else if(technique.id==="steam-blast"){status="ITEMS REQUIRED";reason="The current fixture has no !B-inscribed fumes trap kit or blast charge together with an !B-inscribed potion.";}
      return{learned,usable:learned&&!reason,status,reason,levelRequirement};
    }
    function hasLearnedTechniques(){return relevantTechniques().some(technique=>techniqueState(technique).learned);}
    function requirementLabel(technique){const level=classLevel(technique);if(level)return`LV ${level}`;return technique.skillAny?.map(requirement=>`${requirement.label.slice(0,4).toUpperCase()} ${(requirement.value/1000).toFixed(0)}`).join(" / ")||"—";}
    function techniqueMarkup(technique,index){
      const selected=runtime.selectedId===technique.id;const stateInfo=techniqueState(technique);const cost=technique.cost===null?"—":technique.cost;
      return `<div class="melee-technique-entry${selected?" is-selected":""}${stateInfo.usable?" is-usable":" is-blocked"}"><button class="melee-technique-row" type="button" role="option" aria-selected="${selected}" aria-expanded="${selected}" aria-disabled="${!stateInfo.usable}" data-melee-technique="${technique.id}" data-melee-key="${String.fromCharCode(97+index)}"><span><kbd>${String.fromCharCode(97+index)})</kbd> ${escapeHtml(technique.name)}</span><span>${cost}</span><span>${escapeHtml(requirementLabel(technique))}</span><span>${stateInfo.status}</span></button>${selected?`<div class="melee-technique-inline"><p>${escapeHtml(technique.description)}</p><dl><dt>Stamina</dt><dd>${cost}</dd><dt>Energy</dt><dd>${escapeHtml(technique.energy)}</dd></dl><button class="melee-technique-use" type="button"${stateInfo.usable?"":" disabled"}>USE · (Enter)</button>${stateInfo.reason?`<p class="melee-technique-reason">${escapeHtml(stateInfo.reason)}</p>`:""}</div>`:""}</div>`;
    }
    function entries(){return relevantTechniques();}
    function ensureSelection(){const available=entries();if(!available.some(technique=>technique.id===runtime.selectedId))runtime.selectedId=available[0]?.id||null;}
    function selectedTechnique(){return entries().find(technique=>technique.id===runtime.selectedId)||null;}
    function selectedRow(){return list.querySelector(`[data-melee-technique="${runtime.selectedId}"]`);}
    function render({focus=false}={}){ensureSelection();const available=entries();list.innerHTML=available.length?available.map(techniqueMarkup).join(""):'<div class="melee-techniques-empty">NO TECHNIQUES FOR THIS CLASS</div>';$("#meleeTechniquesContext").textContent=`${CHARACTER_DATA.className.toUpperCase()} · LEVEL ${state.xpLevel} · ST ${state.st}`;if(focus)requestAnimationFrame(()=>selectedRow()?.focus());}
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function closeUseStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("melee-techniques",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function use(technique=selectedTechnique()){
      if(!technique)return false;const stateInfo=techniqueState(technique);if(!stateInfo.usable){append(`${technique.name}: ${stateInfo.reason} (prototype only)`);render({focus:true});return true;}
      append(`${technique.result} Stamina cost ${technique.cost===null?"—":technique.cost}; ${technique.energy.toLowerCase()}. (prototype only)`);closeUseStack();return true;
    }
    function select(id,{focus=true}={}){if(!entries().some(technique=>technique.id===id))return false;runtime.selectedId=id;render({focus});return true;}
    function move(delta){const available=entries();if(!available.length)return true;const index=Math.max(0,available.findIndex(technique=>technique.id===runtime.selectedId));runtime.selectedId=available[(index+delta+available.length)%available.length].id;render({focus:true});return true;}
    function openPrompt(){prompt.hidden=false;promptError.textContent="";promptInput.value=selectedTechnique()?.name||"";requestAnimationFrame(()=>promptInput.select());return true;}
    function closePrompt(){prompt.hidden=true;promptError.textContent="";requestAnimationFrame(()=>selectedRow()?.focus());return true;}
    function applyPrompt(){const query=promptInput.value.trim().toLowerCase();const match=entries().find(technique=>technique.name.toLowerCase()===query);if(!match){promptError.textContent="No technique matches that exact name.";promptInput.select();return false;}runtime.selectedId=match.id;closePrompt();render({focus:true});return true;}
    function isOpen(){return windowManager.has("melee-techniques");}
    function show(entry){runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");prompt.hidden=true;runtime.parentKind=null;}
    windowManager.register({kind:"melee-techniques",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:()=>selectedRow()||list,onOpen:show,onClose:hide});
    function openUse(opener=document.activeElement){return windowManager.push("melee-techniques",{},{opener});}
    function closeWindow(){return windowManager.closeKind("melee-techniques");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="melee-techniques")return false;const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(!prompt.hidden){if(event.key==="Escape")return closePrompt();if(event.key==="Enter"){event.preventDefault();return applyPrompt();}return true;}
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);
      if(event.key==="Enter"||event.key===" ")return use();if(event.key==="@")return openPrompt();
      if(/^[a-z]$/i.test(event.key)){const row=list.querySelector(`[data-melee-key="${event.key.toLowerCase()}"]`);if(row){runtime.selectedId=row.dataset.meleeTechnique;render();return use();}return true;}return true;
    }
    function notify(){listeners.forEach(listener=>listener(hasLearnedTechniques()));}
    function refreshAvailability(){notify();if(isOpen())render();}
    function applyControls(){state.meleeTechniquesFontSize=clamp(Math.round(state.meleeTechniquesFontSize),8,20);windowElement.style.setProperty("--melee-techniques-font-size",`${state.meleeTechniquesFontSize}px`);$("#meleeTechniquesFontSizeControl").value=state.meleeTechniquesFontSize;$("#meleeTechniquesFontSizeValue").value=`${state.meleeTechniquesFontSize}px`;if(isOpen())render();}
    function resetSimulation(){runtime.selectedId=null;if(isOpen())render({focus:true});}
    list.addEventListener("click",event=>{if(event.target.closest(".melee-technique-use")){use();return;}const row=event.target.closest("[data-melee-technique]");if(row)select(row.dataset.meleeTechnique);});
    list.addEventListener("dblclick",event=>{const row=event.target.closest("[data-melee-technique]");if(row){runtime.selectedId=row.dataset.meleeTechnique;use();}});
    prompt.addEventListener("submit",event=>{event.preventDefault();applyPrompt();});$("#meleeTechniquesPromptCancel").addEventListener("click",closePrompt);$("#meleeTechniquesClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    skillsFeature.subscribeSkillChanges(refreshAvailability);
    return{openUse,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,refreshAvailability,hasLearnedTechniques,getSourceLabel:()=>`${CHARACTER_DATA.className} class / level`,subscribeTechniqueChanges:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},restoreFocus:()=>isOpen()&&requestAnimationFrame(()=>selectedRow()?.focus())};
  };
})();
