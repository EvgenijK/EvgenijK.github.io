(() => {
  window.TomeNetPrototype.createMimicPowersWindowFeature = ({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,
    forms,powers,immunities,CHARACTER_DATA,renderCharacter,getTargetingFeature
  }) => {
    const overlay=$("#mimicPowersOverlay");
    const windowElement=$("#mimicPowersWindow");
    const actionsPane=$("#mimicActionsPane");
    const powersPane=$("#mimicPowersPane");
    const actionsElement=$("#mimicActions");
    const powersElement=$("#mimicPowersList");
    const prompt=$("#mimicPowersPrompt");
    const promptInput=$("#mimicPowersPromptInput");
    const promptError=$("#mimicPowersPromptError");
    const pickerOverlay=$("#mimicPickerOverlay");
    const pickerList=$("#mimicPickerList");
    const pickerSearch=$("#mimicPickerSearch");
    const pickerSearchInput=$("#mimicPickerSearchInput");
    const pickerHelp=$("#mimicPickerHelp");
    const pickerConfirm=$("#mimicPickerConfirm");
    const pickerConfirmButton=$("#mimicPickerConfirmButton");
    const byFormId=new Map(forms.map(entry=>[entry.id,entry]));
    const byPowerId=new Map(powers.map(entry=>[entry.id,entry]));
    const formActions=[
      {id:"next-form",key:"a",name:"Next known form",status:"FORM CHANGE",description:"Polymorph into the next learned monster form."},
      {id:"next-fitting",key:"b",name:"Next fitting form",status:"FORM CHANGE",description:"Polymorph into the next learned form with equipment-compatible extremities."},
      {id:"specific-form",key:"c",name:"Choose specific form",status:"OPENS FORM LIST",description:"Choose any learned form by name or monster code."},
      {id:"preferred-immunity",key:"d",name:"Set preferred immunity",status:"OPENS IMMUNITY LIST",description:"Choose the immunity preferred when a suitable mimic form can supply one."}
    ];
    const PICKER_PAGE_SIZE=17;
    const runtime={currentFormId:"vampire",previousFormId:"player",preferredImmunity:"None",activePane:"powers",selectedActionId:"next-form",selectedPowerId:null,parentKind:null,picker:null,pickerIndex:0,pickerQuery:"",pickerPage:0,lastClickId:null,lastClickAt:0};
    const listeners=new Set();

    function currentForm(){return byFormId.get(runtime.currentFormId)||forms[0];}
    function currentPowers(){return currentForm().powerIds.map(id=>byPowerId.get(id)).filter(Boolean);}
    function powerHotkey(index){return String.fromCharCode(97+formActions.length+index);}
    function powerForHotkey(key){const index=key.charCodeAt(0)-97-formActions.length;return index>=0?currentPowers()[index]||null:null;}
    function selectedAction(){return formActions.find(action=>action.id===runtime.selectedActionId)||formActions[0];}
    function selectedPower(){return currentPowers().find(power=>power.id===runtime.selectedPowerId)||null;}
    function ensureSelection(){
      const available=currentPowers();
      if(!available.some(power=>power.id===runtime.selectedPowerId))runtime.selectedPowerId=available[0]?.id||null;
      if(!available.length&&runtime.activePane==="powers")runtime.activePane="actions";
    }
    function actionMarkup(action){const selected=runtime.activePane==="actions"&&action.id===runtime.selectedActionId;return `<button class="mimic-action${selected?" is-selected":""}" type="button" role="option" aria-selected="${selected}" data-mimic-action="${action.id}" data-mimic-key="${action.key}"><kbd>${action.key})</kbd><span>${escapeHtml(action.name)}</span></button>`;}
    function powerMarkup(power,index){const selected=runtime.activePane==="powers"&&power.id===runtime.selectedPowerId;const key=powerHotkey(index);return `<div class="mimic-power-entry"><button class="mimic-power-row${selected?" is-selected":""}" type="button" role="option" aria-selected="${selected}" aria-expanded="${selected}" data-mimic-power="${power.id}" data-mimic-key="${key}"><span><kbd>${key})</kbd> ${escapeHtml(power.name)}</span><span>${power.mana}</span><span>${power.fail}%</span><span>${power.direction?"GRID":"SELF"}</span></button>${selected?`<div class="mimic-power-inline"><p>${escapeHtml(power.description)}</p><button class="mimic-inline-use" type="button">USE · (Enter)</button></div>`:""}</div>`;}
    function formSummary(){const form=currentForm();return `<span class="mimic-form-glyph" style="--form-color:${form.color}" aria-hidden="true">${escapeHtml(form.glyph)}</span><strong>${escapeHtml(form.name)}</strong><span>Monster code <b>${form.code}</b> · level <b>${form.level}</b></span><span>Mimicry <b>30.000</b></span><small>Preferred immunity: <b>${escapeHtml(runtime.preferredImmunity)}</b></small>`;}
    function render({focus=false}={}){
      ensureSelection();const form=currentForm();const available=currentPowers();
      $("#mimicPowersFormLabel").textContent=form.name.toUpperCase();
      $("#mimicFormSummary").innerHTML=formSummary();
      actionsElement.innerHTML=formActions.map(actionMarkup).join("");
      powersElement.innerHTML=available.length?available.map(powerMarkup).join(""):'<div class="mimic-empty"><div><strong>NO INNATE POWERS</strong><span>Choose another learned form.</span></div></div>';
      actionsPane.classList.toggle("is-active-pane",runtime.activePane==="actions");
      powersPane.classList.toggle("is-active-pane",runtime.activePane==="powers");
      if(focus)requestAnimationFrame(focusActive);
    }
    function activeElement(){return runtime.activePane==="actions"?actionsElement.querySelector(`[data-mimic-action="${runtime.selectedActionId}"]`):powersElement.querySelector(`[data-mimic-power="${runtime.selectedPowerId}"]`);}
    function focusActive(){(activeElement()||actionsElement)?.focus();}
    function setPane(pane){if(pane==="powers"&&!currentPowers().length)pane="actions";runtime.activePane=pane;render({focus:true});return true;}
    function move(delta){const entries=runtime.activePane==="actions"?formActions:currentPowers();if(!entries.length)return true;const current=runtime.activePane==="actions"?runtime.selectedActionId:runtime.selectedPowerId;const index=Math.max(0,entries.findIndex(entry=>entry.id===current));const next=entries[(index+delta+entries.length)%entries.length];if(runtime.activePane==="actions")runtime.selectedActionId=next.id;else runtime.selectedPowerId=next.id;render({focus:true});return true;}
    function notifyForm(){CHARACTER_DATA.body=currentForm().name;renderCharacter();listeners.forEach(listener=>listener(currentForm()));}
    function transformTo(id){if(!byFormId.has(id)||id===runtime.currentFormId)return false;runtime.previousFormId=runtime.currentFormId;runtime.currentFormId=id;runtime.selectedPowerId=null;notifyForm();appendGameMessage({markup:escapeHtml(`You polymorph into ${currentForm().name}. (prototype only)`) });render({focus:true});return true;}
    function cycleForm(fittingOnly){const candidates=fittingOnly?forms.filter(form=>form.fittingExtremities):forms;const index=Math.max(0,candidates.findIndex(form=>form.id===runtime.currentFormId));return transformTo(candidates[(index+1)%candidates.length].id);}
    function formPickerOptions(){
      const query=runtime.pickerQuery.trim();
      if(!query)return forms.slice();
      if(query.startsWith("#")){const code=query.slice(1).trim();return code?forms.filter(form=>String(form.code)===code):forms.slice();}
      if(query.startsWith("!")){const glyph=query.slice(1);return glyph?forms.filter(form=>form.glyph===glyph):forms.slice();}
      const needle=query.toLocaleLowerCase();
      return forms.map((form,index)=>{const name=form.name.toLocaleLowerCase();const rank=name===needle?0:name.startsWith(needle)?1:name.includes(needle)?2:3;return{form,index,rank};}).filter(entry=>entry.rank<3).sort((a,b)=>a.rank-b.rank||a.index-b.index).map(entry=>entry.form);
    }
    function pickerOptions(){return runtime.picker==="forms"?formPickerOptions():immunities.map((name,index)=>({id:name,name,code:index+1,level:""}));}
    function formOptionMarkup(option,index){const absolute=runtime.pickerPage*PICKER_PAGE_SIZE+index;return `<button class="mimic-picker-option${absolute===runtime.pickerIndex?" is-selected":""}" type="button" role="option" aria-selected="${absolute===runtime.pickerIndex}" data-mimic-picker-index="${absolute}"><span class="mimic-picker-glyph" style="--form-color:${option.color}" aria-hidden="true">${escapeHtml(option.glyph)}</span><span>#${option.code}</span><span>${escapeHtml(option.name)}</span><small>LV ${option.level}</small></button>`;}
    function immunityOptionMarkup(option,index){return `<button class="mimic-picker-option is-immunity${index===runtime.pickerIndex?" is-selected":""}" type="button" role="option" aria-selected="${index===runtime.pickerIndex}" data-mimic-picker-index="${index}"><kbd>${String.fromCharCode(97+index)})</kbd><span>${escapeHtml(option.name)}</span></button>`;}
    function renderPicker({focus=false}={}){
      const options=pickerOptions();const isForms=runtime.picker==="forms";
      runtime.pickerIndex=options.length?Math.max(0,Math.min(runtime.pickerIndex,options.length-1)):0;
      const pages=Math.max(1,Math.ceil(options.length/PICKER_PAGE_SIZE));runtime.pickerPage=Math.max(0,Math.min(runtime.pickerPage,pages-1));
      if(options.length&&Math.floor(runtime.pickerIndex/PICKER_PAGE_SIZE)!==runtime.pickerPage)runtime.pickerPage=Math.floor(runtime.pickerIndex/PICKER_PAGE_SIZE);
      $("#mimicPickerTitle").textContent=isForms?"CHOOSE SPECIFIC FORM":"PREFERRED IMMUNITY";pickerSearch.hidden=!isForms;pickerConfirm.hidden=isForms;
      if(isForms){const start=runtime.pickerPage*PICKER_PAGE_SIZE;const page=options.slice(start,start+PICKER_PAGE_SIZE);pickerList.innerHTML=page.length?page.map(formOptionMarkup).join(""):'<div class="mimic-picker-empty">NO LEARNED FORM MATCHES THIS SEARCH</div>';pickerHelp.textContent=`↑/↓ or 2/8 move · PgUp/PgDn page · Enter choose · Esc clear/cancel · ${options.length} match${options.length===1?"":"es"} · ${runtime.pickerPage+1}/${pages}`;}
      else{pickerList.innerHTML=options.map(immunityOptionMarkup).join("");pickerHelp.textContent="2/8 move · letters set now · button/Enter confirm · Esc cancel";}
      const selected=pickerList.querySelector(".is-selected");selected?.scrollIntoView({block:"nearest"});
      if(focus)requestAnimationFrame(()=>isForms?pickerSearchInput.focus():selected?.focus());
    }
    function openPicker(kind){runtime.picker=kind;runtime.pickerQuery="";runtime.pickerPage=0;pickerSearchInput.value="";runtime.pickerIndex=kind==="forms"?Math.max(0,forms.findIndex(form=>form.id===runtime.currentFormId)):Math.max(0,immunities.indexOf(runtime.preferredImmunity));pickerOverlay.hidden=false;pickerOverlay.setAttribute("aria-hidden","false");renderPicker({focus:true});return true;}
    function closePicker(){runtime.picker=null;pickerOverlay.hidden=true;pickerOverlay.setAttribute("aria-hidden","true");requestAnimationFrame(focusActive);return true;}
    function choosePicker(){const option=pickerOptions()[runtime.pickerIndex];if(!option)return false;if(runtime.picker==="forms")transformTo(option.id);else{runtime.preferredImmunity=option.name;appendGameMessage({markup:escapeHtml(`Preferred mimic immunity: ${option.name}. (prototype only)`) });render();}return closePicker();}
    function executeAction(){switch(selectedAction().id){case"next-form":return cycleForm(false);case"next-fitting":return cycleForm(true);case"specific-form":return openPicker("forms");case"preferred-immunity":return openPicker("immunities");default:return false;}}
    function closeUseStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("mimic-powers",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function reopenAfterTarget(parentWasAbilities){if(parentWasAbilities)windowManager.open("abilities",{}, {opener:document.activeElement});requestAnimationFrame(()=>windowManager.push("mimic-powers",{pane:"powers"},{opener:document.activeElement}));}
    function usePower(){
      const power=selectedPower();if(!power)return false;
      if(!power.direction){appendGameMessage({markup:escapeHtml(`${power.result} You use ${power.name}. (prototype only)`) });closeUseStack();return true;}
      const parentWasAbilities=runtime.parentKind==="abilities";const targeter=getTargetingFeature();
      windowManager.closeKind("mimic-powers",{restoreFocus:false});if(parentWasAbilities)windowManager.closeKind("abilities",{restoreFocus:false});
      return Boolean(targeter?.requestMapTarget({label:power.name,subject:`mimic power ${power.name}`,opener:document.activeElement,onConfirm:target=>appendGameMessage({markup:escapeHtml(`${power.result} Target ${target.worldX}, ${target.worldY}. (prototype only)`) }),onCancel:()=>reopenAfterTarget(parentWasAbilities)}));
    }
    function execute(){return runtime.activePane==="actions"?executeAction():usePower();}
    function openPrompt(){prompt.hidden=false;promptError.textContent="";promptInput.value="";requestAnimationFrame(()=>promptInput.focus());return true;}
    function closePrompt(){prompt.hidden=true;promptError.textContent="";requestAnimationFrame(focusActive);return true;}
    function applyPrompt(){const query=promptInput.value.trim().toLowerCase();const action=formActions.find(entry=>entry.name.toLowerCase()===query);const power=currentPowers().find(entry=>entry.name.toLowerCase()===query);if(!action&&!power){promptError.textContent="No current action or power matches that name.";promptInput.select();return false;}if(action){runtime.activePane="actions";runtime.selectedActionId=action.id;}else{runtime.activePane="powers";runtime.selectedPowerId=power.id;}closePrompt();render({focus:true});return true;}
    function isOpen(){return windowManager.has("mimic-powers");}
    function show(entry){runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;runtime.activePane=entry.payload.pane||"powers";overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");prompt.hidden=true;closePicker();}
    windowManager.register({kind:"mimic-powers",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:activeElement,onOpen:show,onClose:hide});
    function openUse(opener=document.activeElement){return windowManager.push("mimic-powers",{pane:"powers"},{opener});}
    function closeWindow(){return windowManager.closeKind("mimic-powers");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="mimic-powers")return false;
      if(runtime.picker){
        const options=pickerOptions();const isForms=runtime.picker==="forms";
        if(event.key==="Escape"){if(isForms&&runtime.pickerQuery){runtime.pickerQuery="";runtime.pickerPage=0;runtime.pickerIndex=Math.max(0,forms.findIndex(form=>form.id===runtime.currentFormId));pickerSearchInput.value="";renderPicker({focus:true});return true;}return closePicker();}
        if(isForms){
          const emptyQuery=!runtime.pickerQuery;const down=event.key==="ArrowDown"||event.code==="Numpad2"||(emptyQuery&&event.key==="2");const up=event.key==="ArrowUp"||event.code==="Numpad8"||(emptyQuery&&event.key==="8");
          if(down&&options.length)runtime.pickerIndex=(runtime.pickerIndex+1)%options.length;
          else if(up&&options.length)runtime.pickerIndex=(runtime.pickerIndex-1+options.length)%options.length;
          else if(event.key==="PageDown"||event.code==="Numpad3"||(emptyQuery&&event.key==="3")){runtime.pickerIndex=Math.min(options.length-1,runtime.pickerIndex+PICKER_PAGE_SIZE);}
          else if(event.key==="PageUp"||event.code==="Numpad9"||(emptyQuery&&event.key==="9")){runtime.pickerIndex=Math.max(0,runtime.pickerIndex-PICKER_PAGE_SIZE);}
          else if(event.key==="Home"||event.code==="Numpad7"||(emptyQuery&&event.key==="7")){runtime.pickerIndex=0;runtime.pickerPage=0;}
          else if(event.key==="Enter")return choosePicker();
          else if(event.key===" "&&!runtime.pickerQuery)return true;
          else return false;
          runtime.pickerPage=Math.floor(runtime.pickerIndex/PICKER_PAGE_SIZE);renderPicker({focus:true});return true;
        }
        if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")runtime.pickerIndex=(runtime.pickerIndex+1)%options.length;else if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")runtime.pickerIndex=(runtime.pickerIndex-1+options.length)%options.length;else if(event.key==="Enter"||event.key===" ")return choosePicker();else if(/^[a-h]$/i.test(event.key)){const index=event.key.toLowerCase().charCodeAt(0)-97;if(index<options.length){runtime.pickerIndex=index;return choosePicker();}}renderPicker({focus:true});return true;
      }
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(!prompt.hidden){if(event.key==="Escape")return closePrompt();if(event.key==="Enter"){event.preventDefault();return applyPrompt();}return true;}
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="Tab"){event.preventDefault();return setPane(runtime.activePane==="actions"?"powers":"actions");}if(event.key==="ArrowLeft")return setPane("actions");if(event.key==="ArrowRight")return setPane("powers");
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);if(event.key==="Enter"||event.key===" ")return execute();if(event.key==="@")return openPrompt();
      if(/^[a-z]$/i.test(event.key)){const key=event.key.toLowerCase();const action=formActions.find(entry=>entry.key===key);if(action){runtime.activePane="actions";runtime.selectedActionId=action.id;render();return executeAction();}const power=powerForHotkey(key);if(power){runtime.activePane="powers";runtime.selectedPowerId=power.id;render();return usePower();}return true;}return true;
    }
    function applyControls(){state.mimicPowersFontSize=clamp(Math.round(state.mimicPowersFontSize),8,20);windowElement.style.setProperty("--mimic-font-size",`${state.mimicPowersFontSize}px`);$("#mimicPowersFontSizeControl").value=state.mimicPowersFontSize;$("#mimicPowersFontSizeValue").value=`${state.mimicPowersFontSize}px`;if(isOpen())render();}
    function resetSimulation(){runtime.currentFormId="vampire";runtime.previousFormId="player";runtime.preferredImmunity="None";runtime.activePane="powers";runtime.selectedActionId="next-form";runtime.selectedPowerId=null;notifyForm();if(isOpen())render({focus:true});}
    function repeatedClick(id){const now=performance.now();const repeated=runtime.lastClickId===id&&now-runtime.lastClickAt<450;runtime.lastClickId=id;runtime.lastClickAt=now;return repeated;}
    actionsElement.addEventListener("click",event=>{const row=event.target.closest("[data-mimic-action]");if(row){runtime.activePane="actions";runtime.selectedActionId=row.dataset.mimicAction;render();executeAction();}});
    powersElement.addEventListener("click",event=>{if(event.target.closest(".mimic-inline-use")){usePower();return;}const row=event.target.closest("[data-mimic-power]");if(row){const id=row.dataset.mimicPower;runtime.activePane="powers";runtime.selectedPowerId=id;if(repeatedClick(`power:${id}`))usePower();else render({focus:true});}});
    prompt.addEventListener("submit",event=>{event.preventDefault();applyPrompt();});$("#mimicPowersPromptCancel").addEventListener("click",closePrompt);
    pickerList.addEventListener("click",event=>{const row=event.target.closest("[data-mimic-picker-index]");if(row){runtime.pickerIndex=+row.dataset.mimicPickerIndex;if(runtime.picker==="forms")choosePicker();else renderPicker({focus:true});}});pickerConfirmButton.addEventListener("click",choosePicker);$("#mimicPickerClose").addEventListener("click",closePicker);
    pickerSearchInput.addEventListener("input",()=>{const value=pickerSearchInput.value.replace(/^\s+/,"").slice(0,20);if(value!==pickerSearchInput.value)pickerSearchInput.value=value;runtime.pickerQuery=value;runtime.pickerPage=0;runtime.pickerIndex=0;renderPicker();});
    $("#mimicPowersClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    notifyForm();
    return{openUse,closeWindow,isOpen,handleKeydown,restoreFocus:()=>isOpen()&&requestAnimationFrame(focusActive),applyControls,resetSimulation,getCurrentForm:currentForm,subscribeFormChanges:listener=>{listeners.add(listener);return()=>listeners.delete(listener);}};
  };
})();
