(() => {
  window.TomeNetPrototype.createDragonBreathWindowFeature=({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,lineages,elements,getTargetingFeature
  })=>{
    const overlay=$("#dragonBreathOverlay");const windowElement=$("#dragonBreathWindow");const pane=$("#dragonBreathPane");
    const lineageById=new Map(lineages.map(lineage=>[lineage.id,lineage]));const elementById=new Map(elements.map(element=>[element.id,element]));
    const multiElementIds=["random","lightning","frost","fire","acid","poison"];
    const listeners=new Set();const runtime={selectedElementId:"random",elementCursorId:"random",parentKind:null};
    function lineage(){return lineageById.get(state.dragonDemoLineage)||lineageById.get("multi");}
    function isMulti(){return lineage().multi;}
    function currentElement(){return elementById.get(isMulti()?runtime.selectedElementId:lineage().elementId)||elementById.get("random");}
    function baseDamage(){return Math.max(0,Math.floor(state.hp/3));}
    function damageValue(element=currentElement()){
      if(element.id!=="random")return Math.min(baseDamage(),element.cap);
      const low=Math.min(baseDamage(),element.capRange[0]);const high=Math.min(baseDamage(),element.capRange[1]);return low===high?String(low):`${low}–${high}`;
    }
    function breathState(){
      if(state.xpLevel<8)return{usable:false,reason:`Requires character level 8 (current ${state.xpLevel}).`};
      if(state.conditions?.confusion==="confused")return{usable:false,reason:"Cannot use elemental breath while confused."};
      if(state.dragonDemoForm==="incompatible")return{usable:false,reason:"The current polymorph is neither a reptile nor a dragon."};
      if(state.st<3)return{usable:false,reason:`Requires 3 stamina (current ${state.st}).`};
      return{usable:true,reason:""};
    }
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function elementMarkup(id,index){
      const element=elementById.get(id);const selected=runtime.elementCursorId===id;const current=runtime.selectedElementId===id;
      return `<button class="dragon-element-row${selected?" is-selected":""}${current?" is-current":""}" type="button" role="option" aria-selected="${selected}" data-dragon-element="${id}" data-dragon-key="${String.fromCharCode(97+index)}"><span><kbd>${String.fromCharCode(97+index)})</kbd><i class="dragon-element-swatch" style="--breath-color:${element.color}"></i>${escapeHtml(element.name)}</span><span>${escapeHtml(damageValue(element))}</span><span>${current?"CURRENT":"SET"}</span></button>`;
    }
    function focusTarget(){return pane.querySelector(".dragon-element-row.is-selected")||pane;}
    function render({focus=false}={}){
      if(!multiElementIds.includes(runtime.elementCursorId))runtime.elementCursorId=runtime.selectedElementId;
      const current=elementById.get(runtime.selectedElementId);$("#dragonBreathContext").textContent=`MULTI-HUED · ${current.name.toUpperCase()}`;
      const pending=elementById.get(runtime.elementCursorId);
      pane.innerHTML=`<div class="dragon-element-head" aria-hidden="true"><span>ELEMENT</span><span>DAMAGE</span><span>STATE</span></div><div class="dragon-element-list" role="listbox" aria-label="Breath elements">${multiElementIds.map(elementMarkup).join("")}</div><div class="dragon-element-confirm"><span>Selected: ${escapeHtml(pending.name)}</span><button class="dragon-element-apply" type="button">SET ELEMENT · (Enter)</button></div>`;
      if(focus)requestAnimationFrame(()=>focusTarget()?.focus());
    }
    function moveElement(delta){const index=Math.max(0,multiElementIds.indexOf(runtime.elementCursorId));runtime.elementCursorId=multiElementIds[(index+delta+multiElementIds.length)%multiElementIds.length];render({focus:true});return true;}
    function selectElement(id){if(!multiElementIds.includes(id))return false;runtime.elementCursorId=id;render({focus:true});return true;}
    function closePickerStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("dragon-breath",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function setElement(id=runtime.elementCursorId){
      if(!isMulti()||!multiElementIds.includes(id))return false;runtime.selectedElementId=id;runtime.elementCursorId=id;
      append(`Draconian breath preference: ${elementById.get(id).name}. (prototype only)`);closePickerStack();return true;
    }
    function reopenAbilities(wasOpen){if(wasOpen)windowManager.open("abilities",{}, {opener:document.activeElement});}
    function openBreathe(opener=document.activeElement){
      const info=breathState();const element=currentElement();
      if(!info.usable){append(`Breathe element: ${info.reason} (prototype only)`);return true;}
      const abilitiesWasOpen=windowManager.has("abilities");const targeter=getTargetingFeature();
      if(!targeter)return false;if(abilitiesWasOpen)windowManager.closeKind("abilities",{restoreFocus:false});
      const subject=element.id==="random"?"random basic draconian breath":`${element.name.toLowerCase()} draconian breath`;
      const started=Boolean(targeter.requestMapTarget({label:"Breathe element",subject,opener,onConfirm:target=>append(`You breathe ${element.id==="random"?"a random basic element":element.name.toLowerCase()} toward target ${target.worldX}, ${target.worldY}; damage ${damageValue(element)}, radius 2. Stamina cost 3; no resources were changed. (prototype only)`),onCancel:()=>reopenAbilities(abilitiesWasOpen)}));
      if(!started)reopenAbilities(abilitiesWasOpen);return started;
    }
    function isOpen(){return windowManager.has("dragon-breath");}
    function show(entry){
      if(!isMulti()){windowManager.closeKind("dragon-breath");return;}
      runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;runtime.elementCursorId=runtime.selectedElementId;
      overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});
    }
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");runtime.parentKind=null;}
    windowManager.register({kind:"dragon-breath",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget,onOpen:show,onClose:hide});
    function openElementPicker(opener=document.activeElement){if(!isMulti())return false;return windowManager.push("dragon-breath",{},{opener});}
    function closeWindow(){return windowManager.closeKind("dragon-breath");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="dragon-breath")return false;const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return moveElement(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return moveElement(-1);if(event.key==="Enter"||event.key===" ")return setElement();
      if(/^[a-f]$/i.test(event.key)){const id=multiElementIds[event.key.toLowerCase().charCodeAt(0)-97];if(id)return setElement(id);}return true;
    }
    function hasBreatheAbility(){return Boolean(lineage());}
    function hasPickAbility(){return isMulti();}
    function notify(){listeners.forEach(listener=>listener({breathe:hasBreatheAbility(),pick:hasPickAbility()}));}
    function refreshAvailability(){notify();if(isOpen()){if(isMulti())render();else closeWindow();}}
    function applyControls(){
      state.dragonBreathFontSize=clamp(Math.round(state.dragonBreathFontSize),8,20);if(!lineageById.has(state.dragonDemoLineage))state.dragonDemoLineage="multi";if(!["native","reptile","dragon","incompatible"].includes(state.dragonDemoForm))state.dragonDemoForm="native";
      windowElement.style.setProperty("--dragon-breath-font-size",`${state.dragonBreathFontSize}px`);$("#dragonBreathFontSizeControl").value=state.dragonBreathFontSize;$("#dragonBreathFontSizeValue").value=`${state.dragonBreathFontSize}px`;$("#dragonDemoLineageControl").value=state.dragonDemoLineage;$("#dragonDemoFormControl").value=state.dragonDemoForm;$("#dragonBreathDemoOpen").disabled=!isMulti();refreshAvailability();
    }
    function resetSimulation(){runtime.selectedElementId="random";runtime.elementCursorId="random";notify();if(isOpen())render({focus:true});}
    pane.addEventListener("click",event=>{if(event.target.closest(".dragon-element-apply")){setElement();return;}const row=event.target.closest("[data-dragon-element]");if(row)selectElement(row.dataset.dragonElement);});
    $("#dragonBreathClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    return{openBreathe,openElementPicker,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,refreshAvailability,hasBreatheAbility,hasPickAbility,getSourceLabel:()=>`Draconian demo profile · ${lineage().name} lineage`,subscribeAvailability:listener=>{listeners.add(listener);return()=>listeners.delete(listener);},restoreFocus:()=>isOpen()&&requestAnimationFrame(()=>focusTarget()?.focus())};
  };
})();
