(() => {
  window.TomeNetPrototype.createRunecraftWindowFeature=({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,runes,modes,types,enhancedTypes,calculate,skillsFeature,getTargetingFeature
  })=>{
    const overlay=$("#runecraftOverlay");const windowElement=$("#runecraftWindow");const list=$("#runecraftList");
    const runtime={step:0,cursorId:null,firstRune:null,secondRune:null,mode:null,type:null,parentKind:null,error:"",restoreAfterTarget:false};
    const progressSteps=[{label:"RUNES",returnStep:0},{label:"MODE",returnStep:2},{label:"TYPE",returnStep:3}];
    const byRune=new Map(runes.map(item=>[item.id,item]));const byMode=new Map(modes.map(item=>[item.id,item]));const byType=new Map(types.map(item=>[item.id,item]));
    function skillValues(){return skillsFeature.getSkillSnapshot();}
    function conditionContext(){return{blind:["blind","blind_hallu"].includes(state.conditions?.vision),stun:state.conditions?.stun||"none",confused:state.conditions?.confusion==="confused"};}
    function preview(type=runtime.type,mode=runtime.mode){
      if(!runtime.firstRune||!runtime.secondRune||!mode||!type)return null;
      return calculate({firstRune:runtime.firstRune,secondRune:runtime.secondRune,mode,type,skills:skillValues(),mp:state.mp,intStatIndex:33,dexStatIndex:29,...conditionContext()});
    }
    function candidates(){if(runtime.step<2)return runes;if(runtime.step===2)return modes;return types;}
    function candidateId(item){return item.id;}
    function ensureCursor(){const items=candidates();if(!items.some(item=>candidateId(item)===runtime.cursorId))runtime.cursorId=items[0]?.id||null;}
    function currentCandidate(){ensureCursor();return candidates().find(item=>candidateId(item)===runtime.cursorId)||null;}
    function elementFor(first,second){
      const probe=calculate({firstRune:first,secondRune:second,mode:modes[0],type:types[0],skills:skillValues(),mp:state.mp,intStatIndex:33,dexStatIndex:29,...conditionContext()});
      return probe.element;
    }
    function infoText(info){
      const type=info.type;
      if(type.id==="bolt")return`${info.dice}d${info.sides}`;
      if(type.id==="cloud")return`dam ${info.damage} · rad ${info.radius} · dur ${info.duration}`;
      if(type.id==="ball")return`dam ${info.damage} · rad ${info.radius}`;
      if(type.id==="storm")return`dam ${info.damage} · rad ${info.radius} · dur ${info.duration}`;
      if(type.id==="cone")return`${info.dice}d${info.sides}${info.mode.id==="enhanced"?" ×4":""} · rad ${info.radius}`;
      if(type.id==="surge")return info.mode.id==="enhanced"?`${info.dice}d${info.sides} · rad ${info.radius}`:`dam ${info.damage} ×3 · rad ${info.radius}`;
      return info.mode.id==="enhanced"?`dam ${state.mp} · dur ${info.duration} · backlash 20%`:`${info.dice}d${info.sides} ×2 · backlash 10%`;
    }
    function summaryPreview(){
      if(runtime.step===3)return preview(currentCandidate(),runtime.mode);
      if(runtime.firstRune&&runtime.secondRune&&runtime.mode)return preview(types[0],runtime.mode);
      return null;
    }
    function progressValue(index){
      if(index===0){
        if(runtime.step===0)return currentCandidate()?`${currentCandidate().name} + —`:null;
        const rune=runtime.step===1?currentCandidate():runtime.secondRune;
        if(!runtime.firstRune||!rune)return runtime.firstRune?.name||null;
        const element=elementFor(runtime.firstRune,rune);
        return `${runtime.firstRune.name} + ${rune.name} (${element.name})`;
      }
      if(index===1)return runtime.step===2?currentCandidate()?.name:runtime.mode?.name;
      const choice=runtime.step===3?currentCandidate():runtime.type;if(!choice)return null;
      return (runtime.mode?.id==="enhanced"?enhancedTypes:types).find(item=>item.id===choice.id)?.name||choice.name;
    }
    function progressMarkup(){const active=runtime.step<2?0:runtime.step-1;return progressSteps.map(({label,returnStep},index)=>{const value=progressValue(index);const complete=index<active;const tag=complete?"button":"span";const action=complete?` type="button" data-runecraft-step="${returnStep}" aria-label="Return to ${label}"`:"";return`<${tag} class="runecraft-progress-step${index===active?" is-active is-preview":""}${complete?" is-complete":""}"${action}><b>${index+1}</b><span><small>${label}</small><strong>${escapeHtml(value||"—")}</strong></span></${tag}>`;}).join("");}
    function runeMarkup(item,index,slot){
      const skill=(skillValues().get(item.skillId)||0)/1000;const active=slot===runtime.step;
      const selected=slot===0?(runtime.step===0?item.id===runtime.cursorId:item.id===runtime.firstRune?.id):(runtime.step===1&&item.id===runtime.cursorId);
      const first=slot===1?(runtime.firstRune||(runtime.step===0?currentCandidate():null)):null;const element=first?elementFor(first,item):null;const sampleFirst=first||item;
      const sample=calculate({firstRune:sampleFirst,secondRune:item,mode:modes[0],type:types[0],skills:skillValues(),mp:state.mp,intStatIndex:33,dexStatIndex:29,...conditionContext()});const low=sample.ability<1;
      const name=element?`${item.name} (${element.name})`:item.name;
      return `<button class="runecraft-row runecraft-rune-row${selected?" is-selected":""}${low?" is-low":""}" type="button" role="option" aria-selected="${selected}" data-runecraft-choice="${item.id}" data-runecraft-rune-slot="${slot}" tabindex="${active?"0":"-1"}"><span><kbd>${String.fromCharCode(97+index)})</kbd><i style="--rune-color:${item.color}"></i>${escapeHtml(name)}</span><span>${skill.toFixed(3)}</span></button>`;
    }
    function runePairMarkup(){return[0,1].map(slot=>`<div class="runecraft-rune-pane${slot===runtime.step?" is-active":""}" role="group" aria-label="Rune ${slot+1}">${runes.map((item,index)=>runeMarkup(item,index,slot)).join("")}</div>`).join("");}
    function runePairHeaders(){return["RUNE 1","RUNE 2"].map((label,index)=>`<span class="runecraft-rune-pane-head${index===runtime.step?" is-active":""}"><b>${label}</b><b>SKILL</b></span>`).join("");}
    function modeMarkup(item,index){
      const selected=item.id===runtime.cursorId;const sample=preview(types[0],item);const ability=sample?.ability||0;
      return `<button class="runecraft-row runecraft-mode-row${selected?" is-selected":""}${ability<1?" is-low":""}" type="button" role="option" aria-selected="${selected}" data-runecraft-choice="${item.id}"><span><kbd>${String.fromCharCode(97+index)})</kbd>${escapeHtml(item.name)}</span><span>+${item.level}</span><span>${item.cost*10}%</span><span>${item.fail>=0?"+":""}${item.fail}%</span><span>${item.damage*10}%</span><span>${item.radius>=0?"+":""}${item.radius}</span><span>${item.duration*10}%</span><span>${item.energy*10}%</span></button>`;
    }
    function typeMarkup(item,index){
      const selected=item.id===runtime.cursorId;const info=preview(item,runtime.mode);const profile=runtime.mode?.id==="enhanced"?enhancedTypes.find(candidate=>candidate.id===item.id):item;
      return `<button class="runecraft-row runecraft-type-row${selected?" is-selected":""}${info&&!info.usable?" is-low":""}" type="button" role="option" aria-selected="${selected}" data-runecraft-choice="${item.id}"><span><kbd>${String.fromCharCode(97+index)})</kbd>${escapeHtml(profile.name)}</span><span>${info.requiredLevel}</span><span>${info.cost}</span><span>${info.fail}%</span><span>${escapeHtml(infoText(info))}</span></button>`;
    }
    function headers(){
      if(runtime.step===2)return["MODE","LEVEL","COST","FAIL","DAMAGE","RADIUS","DURATION","ENERGY"];
      return["TYPE","LEVEL","COST","FAIL","INFO"];
    }
    function rowMarkup(item,index){if(runtime.step===2)return modeMarkup(item,index);return typeMarkup(item,index);}
    function renderPreview(){
      const info=summaryPreview();let text="Choose a component to continue.";
      if(runtime.step===0){const rune=currentCandidate();text=`Choose ${escapeHtml(rune.name)} as the first rune.`;}
      else if(runtime.step===1)text="Choose the same rune twice for a pure result.";
      else if(runtime.step===2)text=escapeHtml(currentCandidate().description);
      else if(info)text=`${escapeHtml(info.type.description)} <b>Estimated backlash up to ${info.backlash} damage.</b>`;
      $("#runecraftWarning").innerHTML=runtime.error?`<strong>${escapeHtml(runtime.error)}</strong>`:text;
    }
    function selectedRow(){const slot=runtime.step<2?`[data-runecraft-rune-slot="${runtime.step}"]`:"";return list.querySelector(`${slot}[data-runecraft-choice="${runtime.cursorId}"]`);}
    function render({focus=false}={}){
      ensureCursor();$("#runecraftProgress").innerHTML=progressMarkup();$("#runecraftStepTitle").textContent=runtime.step===0?"CHOOSE FIRST RUNE":runtime.step===1?"CHOOSE SECOND RUNE":runtime.step===2?"CHOOSE SPELL MODE":"CHOOSE SPELL TYPE";
      const classes=runtime.step<2?"is-runes":runtime.step===2?"is-modes":"is-types";list.className=`runecraft-list ${classes}`;
      $("#runecraftTableHead").className=`runecraft-table-head ${classes}`;
      if(runtime.step<2){$("#runecraftTableHead").innerHTML=runePairHeaders();list.innerHTML=runePairMarkup();}
      else{$("#runecraftTableHead").innerHTML=headers().map(item=>`<span>${item}</span>`).join("");list.innerHTML=candidates().map(rowMarkup).join("");}
      renderPreview();if(focus)requestAnimationFrame(()=>selectedRow()?.focus());
    }
    function move(delta){const items=candidates();const index=Math.max(0,items.findIndex(item=>item.id===runtime.cursorId));runtime.cursorId=items[(index+delta+items.length)%items.length].id;runtime.error="";render({focus:true});return true;}
    function returnToStep(step){
      if(step<0||step>=runtime.step)return false;runtime.error="";
      if(step===0){runtime.cursorId=runtime.firstRune?.id||runes[0]?.id||null;runtime.firstRune=null;runtime.secondRune=null;runtime.mode=null;runtime.type=null;}
      else if(step===1){runtime.cursorId=runtime.secondRune?.id||runes[0]?.id||null;runtime.secondRune=null;runtime.mode=null;runtime.type=null;}
      else{runtime.cursorId=runtime.mode?.id||modes[0]?.id||null;runtime.mode=null;runtime.type=null;}
      runtime.step=step;render({focus:true});return true;
    }
    function resetFlow(){runtime.step=0;runtime.cursorId=runes[0]?.id||null;runtime.firstRune=null;runtime.secondRune=null;runtime.mode=null;runtime.type=null;runtime.error="";}
    function parentKind(entry){return windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;}
    function closeUseStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("runecraft",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function cast(type){
      runtime.type=type;const info=preview(type,runtime.mode);if(!info.usable){runtime.error=info.reason;append(`${info.type.name}: ${info.reason} (prototype only)`);render({focus:true});return true;}
      const result=target=>{const targetText=target?` toward target ${target.worldX}, ${target.worldY}`:"";append(`You draw ${info.mode.name.toLowerCase()} ${info.element.name.toLowerCase()} ${info.type.name.toLowerCase()}${targetText}; level ${info.requiredLevel}, mana cost ${info.cost}, fail ${info.fail}%, ${infoText(info)}. No resources were changed. (prototype only)`);};
      if(!info.directional){result(null);closeUseStack();return true;}
      const wasAbilities=runtime.parentKind==="abilities";const targeter=getTargetingFeature();if(!targeter)return false;
      windowManager.closeKind("runecraft",{restoreFocus:false});if(wasAbilities)windowManager.closeKind("abilities",{restoreFocus:false});runtime.restoreAfterTarget=true;
      const reopen=()=>{const openRune=()=>openDraw(document.activeElement,{preserve:true});if(wasAbilities){windowManager.open("abilities",{},{opener:document.activeElement});requestAnimationFrame(openRune);}else requestAnimationFrame(openRune);};
      const started=Boolean(targeter.requestMapTarget({label:`${info.element.name} ${info.type.name}`,subject:`${info.mode.name.toLowerCase()} runespell`,opener:document.activeElement,onConfirm:target=>{runtime.restoreAfterTarget=false;result(target);},onCancel:()=>{runtime.restoreAfterTarget=false;reopen();}}));
      if(!started){runtime.restoreAfterTarget=false;reopen();}return true;
    }
    function choose(id){
      const item=candidates().find(candidate=>candidate.id===id);if(!item)return false;runtime.cursorId=id;runtime.error="";
      if(runtime.step===0){runtime.firstRune=byRune.get(id);runtime.step=1;runtime.cursorId=id;}
      else if(runtime.step===1){runtime.secondRune=byRune.get(id);runtime.step=2;runtime.cursorId=modes[0].id;}
      else if(runtime.step===2){runtime.mode=byMode.get(id);runtime.step=3;runtime.cursorId=types[0].id;}
      else return cast(byType.get(id));
      render({focus:true});return true;
    }
    function chooseRuneSlot(slot,id){
      const rune=byRune.get(id);if(!rune)return false;runtime.error="";
      if(slot===0){const secondCursor=runtime.step===1?runtime.cursorId:id;runtime.firstRune=rune;runtime.secondRune=null;runtime.mode=null;runtime.type=null;runtime.step=1;runtime.cursorId=secondCursor;render({focus:true});return true;}
      const first=runtime.firstRune||(runtime.step===0?currentCandidate():null);if(!first)return false;runtime.firstRune=first;runtime.secondRune=rune;runtime.mode=null;runtime.type=null;runtime.step=2;runtime.cursorId=modes[0].id;render({focus:true});return true;
    }
    function back(){
      if(runtime.step===0){closeWindow();return true;}runtime.error="";
      if(runtime.step===3){runtime.type=null;runtime.step=2;runtime.cursorId=runtime.mode?.id||modes[0].id;runtime.mode=null;}
      else if(runtime.step===2){runtime.mode=null;runtime.step=1;runtime.cursorId=runtime.secondRune?.id||runes[0].id;runtime.secondRune=null;}
      else{runtime.cursorId=runtime.firstRune?.id||runes[0].id;runtime.firstRune=null;runtime.step=0;}
      render({focus:true});return true;
    }
    function isOpen(){return windowManager.has("runecraft");}
    function show(entry){runtime.parentKind=parentKind(entry);overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");if(!runtime.restoreAfterTarget)runtime.parentKind=null;}
    windowManager.register({kind:"runecraft",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:()=>selectedRow()||list,onOpen:show,onClose:hide});
    function openDraw(opener=document.activeElement,{preserve=false}={}){if(isOpen())return false;if(!preserve)resetFlow();return windowManager.push("runecraft",{},{opener});}
    function closeWindow(){return windowManager.closeKind("runecraft");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="runecraft")return false;const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="Backspace")return back();if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);
      if(event.key==="Enter"||event.key===" ")return choose(runtime.cursorId);const max=candidates().length;const match=event.key.toLowerCase().match(/^[a-h]$/);if(match){const index=match[0].charCodeAt(0)-97;if(index<max)return choose(candidates()[index].id);return true;}return true;
    }
    function applyControls(){state.runecraftFontSize=clamp(Math.round(state.runecraftFontSize),8,20);windowElement.style.setProperty("--runecraft-font-size",`${state.runecraftFontSize}px`);$("#runecraftFontSizeControl").value=state.runecraftFontSize;$("#runecraftFontSizeValue").value=`${state.runecraftFontSize}px`;if(isOpen())render();}
    function resetSimulation(){resetFlow();if(isOpen())render({focus:true});}
    list.addEventListener("click",event=>{const row=event.target.closest("[data-runecraft-choice]");if(!row)return;const slot=row.dataset.runecraftRuneSlot;if(slot===undefined)choose(row.dataset.runecraftChoice);else chooseRuneSlot(Number(slot),row.dataset.runecraftChoice);});
    $("#runecraftProgress").addEventListener("click",event=>{const step=event.target.closest("[data-runecraft-step]");if(step)returnToStep(Number(step.dataset.runecraftStep));});
    $("#runecraftClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});skillsFeature.subscribeSkillChanges(()=>{if(isOpen())render();});
    return{openDraw,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,refreshPreview:()=>{if(isOpen())render();},restoreFocus:()=>isOpen()&&requestAnimationFrame(()=>selectedRow()?.focus())};
  };
})();
