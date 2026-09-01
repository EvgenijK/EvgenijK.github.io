(() => {
  window.TomeNetPrototype.createRangedTechniquesWindowFeature=({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,techniques,skillsFeature
  })=>{
    const overlay=$("#rangedTechniquesOverlay");const windowElement=$("#rangedTechniquesWindow");const list=$("#rangedTechniquesList");
    const prompt=$("#rangedTechniquesPrompt");const promptInput=$("#rangedTechniquesPromptInput");const promptError=$("#rangedTechniquesPromptError");
    const listeners=new Set();const runtime={selectedId:null,parentKind:null};
    const launcherNames={bow:"BOW",crossbow:"CROSSBOW",sling:"SLING",boomerang:"BOOMERANG",none:"NO LAUNCHER"};
    function archery(){return skillsFeature.getSkillSnapshot().get("archery")||0;}
    function learned(technique){return archery()>=technique.archery;}
    function conditionReason(){
      if(state.conditions?.confusion==="confused")return["CONFUSED","Cannot use ranged techniques while confused."];
      if(state.conditions?.vision==="blind"||state.conditions?.vision==="blind_hallu")return["BLINDED","Cannot use ranged techniques while blinded."];
      return null;
    }
    function loadoutReason(technique){
      if(state.rangedDemoShield)return["SHIELD EQUIPPED","Ranged techniques cannot be used with a shield equipped."];
      if(state.rangedDemoLauncher==="boomerang")return["BOOMERANG","Ranged techniques cannot be used with a boomerang."];
      if(state.rangedDemoLauncher==="none")return["NO LAUNCHER","Equip a bow, crossbow or sling first."];
      if(technique.id==="craft-ammunition"){
        if(state.rangedDemoLauncher==="sling"&&state.rangedDemoMaterials!=="rubble")return["MATERIALS REQUIRED","A sling requires nearby rubble for crafting ammunition."];
        if((state.rangedDemoLauncher==="bow"||state.rangedDemoLauncher==="crossbow")&&state.rangedDemoMaterials!=="inventory")return["MATERIALS REQUIRED","A bow or crossbow requires bones, skeletons or broken sticks."];
        return null;
      }
      if(state.rangedDemoAmmo<=0)return["NO AMMUNITION","No ammunition is equipped."];
      if(state.rangedDemoAmmoCondition==="charred")return["BRITTLE AMMO","Charred ammunition is too brittle to use."];
      if(technique.id==="flare-missile"&&state.rangedDemoAmmoProtected)return["AMMO PROTECTED","The !k inscription prevents using this ammunition for a flare missile."];
      if(technique.id==="flare-missile"&&!state.rangedDemoOil)return["OIL REQUIRED","A flask of oil is required to prepare a flare missile."];
      if(technique.id==="double-shot"&&state.rangedDemoAmmo<2)return["AMMO ×2 REQUIRED","Double Shot requires at least 2 projectiles."];
      if(technique.id==="barrage"&&state.rangedDemoAmmo<6)return["AMMO ×6 REQUIRED","Barrage requires at least 6 projectiles."];
      return null;
    }
    function techniqueState(technique){
      if(!learned(technique))return{learned:false,usable:false,status:"ARCHERY LOCKED",reason:`Requires Archery ${(technique.archery/1000).toFixed(3)} (current ${(archery()/1000).toFixed(3)}).`};
      const condition=conditionReason();if(condition)return{learned:true,usable:false,status:condition[0],reason:condition[1]};
      const loadout=loadoutReason(technique);if(loadout)return{learned:true,usable:false,status:loadout[0],reason:loadout[1]};
      const stamina=typeof technique.cost==="number"?technique.cost:0;
      if(stamina&&state.st<stamina)return{learned:true,usable:false,status:"LOW STAMINA",reason:`Requires ${stamina} stamina (current ${state.st}).`};
      return{learned:true,usable:true,status:"LEARNED",reason:""};
    }
    function hasLearnedTechniques(){return techniques.some(learned);}
    function costLabel(technique){return technique.cost===null?"—":String(technique.cost);}
    function requirementLabel(technique){return`ARCH ${(technique.archery/1000).toFixed(0)}`;}
    function techniqueMarkup(technique,index){
      const selected=runtime.selectedId===technique.id;const info=techniqueState(technique);const key=String.fromCharCode(97+index);
      return `<div class="ranged-technique-entry${selected?" is-selected":""}${info.usable?" is-usable":" is-blocked"}"><button class="ranged-technique-row" type="button" role="option" aria-selected="${selected}" aria-expanded="${selected}" aria-disabled="${!info.usable}" data-ranged-technique="${technique.id}" data-ranged-key="${key}"><span><kbd>${key})</kbd> ${escapeHtml(technique.name)}</span><span>${escapeHtml(costLabel(technique))}</span><span>${requirementLabel(technique)}</span><span>${escapeHtml(info.status)}</span></button>${selected?`<div class="ranged-technique-inline"><p>${escapeHtml(technique.description)}</p><dl><dt>Stamina</dt><dd>${escapeHtml(costLabel(technique))}</dd><dt>Energy</dt><dd>${escapeHtml(technique.energy)}</dd></dl><button class="ranged-technique-use" type="button"${info.usable?"":" disabled"}>USE · (Enter)</button>${info.reason?`<p class="ranged-technique-reason">${escapeHtml(info.reason)}</p>`:""}</div>`:""}</div>`;
    }
    function ensureSelection(){if(!techniques.some(technique=>technique.id===runtime.selectedId))runtime.selectedId=techniques[0]?.id||null;}
    function selectedTechnique(){return techniques.find(technique=>technique.id===runtime.selectedId)||null;}
    function selectedRow(){return list.querySelector(`[data-ranged-technique="${runtime.selectedId}"]`);}
    function render({focus=false}={}){
      ensureSelection();list.innerHTML=techniques.map(techniqueMarkup).join("");
      $("#rangedTechniquesContext").textContent=`ARCHERY ${(archery()/1000).toFixed(3)} · ST ${state.st}`;
      $("#rangedTechniquesLoadout").textContent=`${launcherNames[state.rangedDemoLauncher]||"BOW"} · ${state.rangedDemoAmmo} AMMO${state.rangedDemoShield?" · SHIELD":""}`;
      if(focus)requestAnimationFrame(()=>selectedRow()?.focus());
    }
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function closeUseStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("ranged-techniques",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function use(technique=selectedTechnique()){
      if(!technique)return false;const info=techniqueState(technique);
      if(!info.usable){append(`${technique.name}: ${info.reason} (prototype only)`);render({focus:true});return true;}
      append(`${technique.result} Stamina cost ${costLabel(technique)}; ${technique.energy.toLowerCase()}. No resources or preparation state were changed. (prototype only)`);closeUseStack();return true;
    }
    function select(id,{focus=true}={}){if(!techniques.some(technique=>technique.id===id))return false;runtime.selectedId=id;render({focus});return true;}
    function move(delta){if(!techniques.length)return true;const index=Math.max(0,techniques.findIndex(technique=>technique.id===runtime.selectedId));runtime.selectedId=techniques[(index+delta+techniques.length)%techniques.length].id;render({focus:true});return true;}
    function openPrompt(){prompt.hidden=false;promptError.textContent="";promptInput.value=selectedTechnique()?.name||"";requestAnimationFrame(()=>promptInput.select());return true;}
    function closePrompt(){prompt.hidden=true;promptError.textContent="";requestAnimationFrame(()=>selectedRow()?.focus());return true;}
    function applyPrompt(){const query=promptInput.value.trim().toLowerCase();const match=techniques.find(technique=>technique.name.toLowerCase()===query);if(!match){promptError.textContent="No technique matches that exact name.";promptInput.select();return false;}runtime.selectedId=match.id;closePrompt();render({focus:true});return true;}
    function isOpen(){return windowManager.has("ranged-techniques");}
    function show(entry){runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");prompt.hidden=true;runtime.parentKind=null;}
    windowManager.register({kind:"ranged-techniques",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:()=>selectedRow()||list,onOpen:show,onClose:hide});
    function openUse(opener=document.activeElement){return windowManager.push("ranged-techniques",{},{opener});}
    function closeWindow(){return windowManager.closeKind("ranged-techniques");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="ranged-techniques")return false;const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(!prompt.hidden){if(event.key==="Escape")return closePrompt();if(event.key==="Enter"){event.preventDefault();return applyPrompt();}return true;}
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);
      if(event.key==="Enter"||event.key===" ")return use();if(event.key==="@")return openPrompt();
      if(/^[a-e]$/i.test(event.key)){const row=list.querySelector(`[data-ranged-key="${event.key.toLowerCase()}"]`);if(row){runtime.selectedId=row.dataset.rangedTechnique;render();return use();}return true;}return true;
    }
    function notify(){listeners.forEach(listener=>listener(hasLearnedTechniques()));}
    function refreshAvailability(){notify();if(isOpen())render();}
    function applyControls(){
      state.rangedTechniquesFontSize=clamp(Math.round(state.rangedTechniquesFontSize),8,20);state.rangedDemoAmmo=clamp(Math.round(state.rangedDemoAmmo),0,99);
      windowElement.style.setProperty("--ranged-techniques-font-size",`${state.rangedTechniquesFontSize}px`);
      $("#rangedTechniquesFontSizeControl").value=state.rangedTechniquesFontSize;$("#rangedTechniquesFontSizeValue").value=`${state.rangedTechniquesFontSize}px`;
      $("#rangedDemoLauncherControl").value=state.rangedDemoLauncher;$("#rangedDemoShieldControl").checked=state.rangedDemoShield;$("#rangedDemoAmmoControl").value=state.rangedDemoAmmo;$("#rangedDemoAmmoValue").value=state.rangedDemoAmmo;
      $("#rangedDemoAmmoConditionControl").value=state.rangedDemoAmmoCondition;$("#rangedDemoAmmoProtectedControl").checked=state.rangedDemoAmmoProtected;$("#rangedDemoOilControl").checked=state.rangedDemoOil;$("#rangedDemoMaterialsControl").value=state.rangedDemoMaterials;
      if(isOpen())render();
    }
    function resetSimulation(){runtime.selectedId=null;if(isOpen())render({focus:true});}
    list.addEventListener("click",event=>{if(event.target.closest(".ranged-technique-use")){use();return;}const row=event.target.closest("[data-ranged-technique]");if(row)select(row.dataset.rangedTechnique);});
    list.addEventListener("dblclick",event=>{const row=event.target.closest("[data-ranged-technique]");if(row){runtime.selectedId=row.dataset.rangedTechnique;use();}});
    prompt.addEventListener("submit",event=>{event.preventDefault();applyPrompt();});$("#rangedTechniquesPromptCancel").addEventListener("click",closePrompt);$("#rangedTechniquesClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    skillsFeature.subscribeSkillChanges(refreshAvailability);
    return{openUse,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,refreshAvailability,hasLearnedTechniques,getSourceLabel:()=>`Archery ${(archery()/1000).toFixed(3)}`,subscribeTechniqueChanges:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},restoreFocus:()=>isOpen()&&requestAnimationFrame(()=>selectedRow()?.focus())};
  };
})();
