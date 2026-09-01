(() => {
  window.TomeNetPrototype.createCombatStancesWindowFeature = ({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,stances,CHARACTER_DATA,applyCombatStatuses
  }) => {
    const overlay=$("#combatStancesOverlay");
    const windowElement=$("#combatStancesWindow");
    const list=$("#combatStancesList");
    const byId=new Map(stances.map(stance=>[stance.id,stance]));
    const runtime={selectedId:"balanced",currentId:"balanced",previousId:"balanced",parentKind:null};

    function isWinner(){return Boolean(CHARACTER_DATA.totalWinner);}
    function rankFor(stance){
      if(stance.id==="balanced")return 0;
      const level=Math.max(1,Math.round(state.xpLevel));
      if(isWinner()&&level>=45)return 4;
      const thresholds=stance.id==="defensive"?[10,20,40]:[15,25,40];
      return thresholds.reduce((rank,threshold)=>level>=threshold?rank+1:rank,0);
    }
    function rankLabel(stance){const rank=rankFor(stance);return stance.id==="balanced"?"STANDARD":rank===4?"ROYAL":rank?`RANK ${["","I","II","III"][rank]}`:"LOCKED";}
    function availability(stance){
      if(stance.id==="balanced")return{allowed:true,reason:""};
      if(!rankFor(stance))return{allowed:false,reason:`Requires Mimic level ${stance.id==="defensive"?10:15}.`};
      if(stance.id==="offensive"&&state.stanceDemoLoadout!=="two-handed")return{allowed:false,reason:"Requires no shield and a weapon that can be wielded with both hands."};
      return{allowed:true,reason:""};
    }
    function effects(stance){
      const rank=rankFor(stance);
      if(stance.id==="balanced")return["No combat modifiers.","Available with either demo loadout."];
      if(stance.id==="defensive"){
        const melee=[0,60,70,70,70][rank];
        const intercept=[0,-50,-45,-40,-35][rank];
        const defence=state.stanceDemoLoadout==="shield"?`Shield block +${[0,9,11,13,15][rank]}% · self-stun ×${["","7/8","5/6","3/4","2/3"][rank]}`:`Parry +${[0,30,30,40,50][rank]}% (shieldless mode)`;
        return[`Melee damage ${melee}% · ranged physical damage 50%.`,`${defence}.`,`Interception modifier ${intercept}%.`];
      }
      return[`Interception +${[0,4,7,10,15][rank]}% · chance to stun.`,`Parry and dodge ${[0,-100,-90,-80,-70][rank]}% · AC −30.`,`Requires the two-handed demo loadout.`];
    }
    function stanceMarkup(stance){
      const selected=stance.id===runtime.selectedId;const active=stance.id===runtime.currentId;const access=availability(stance);
      const status=active?"ACTIVE":access.allowed?"READY":access.reason.startsWith("Requires Mimic")?"LOCKED":"LOADOUT BLOCKED";
      return `<div class="combat-stance-entry${selected?" is-selected":""}${active?" is-active":""}${access.allowed?"":" is-blocked"}"><button class="combat-stance-row" type="button" role="option" aria-selected="${selected}" aria-expanded="${selected}" aria-disabled="${!access.allowed}" data-combat-stance="${stance.id}"><span><kbd>${stance.key})</kbd> ${escapeHtml(stance.name)}</span><span>${rankLabel(stance)}</span><span>${status}</span></button>${selected?`<div class="combat-stance-inline"><p>${escapeHtml(stance.description)}</p><ul>${effects(stance).map(effect=>`<li>${escapeHtml(effect)}</li>`).join("")}${access.reason?`<li class="is-warning">${escapeHtml(access.reason)}</li>`:""}</ul><button class="combat-stance-apply" type="button"${access.allowed?"":" disabled"}>${active?"CURRENT":"APPLY"} · (Enter)</button></div>`:""}</div>`;
    }
    function selectedStance(){return byId.get(runtime.selectedId)||stances[0];}
    function render({focus=false}={}){
      state.combatStance=runtime.currentId;state.combatStanceRank=rankLabel(byId.get(runtime.currentId));
      $("#combatStancesCurrent").textContent=`${byId.get(runtime.currentId).short} · ${byId.get(runtime.currentId).name.toUpperCase()}`;
      $("#combatStancesLoadout").textContent=state.stanceDemoLoadout==="shield"?"SWORD + SHIELD":"TWO-HANDED WEAPON";
      list.innerHTML=stances.map(stanceMarkup).join("");applyCombatStatuses();
      if(focus)requestAnimationFrame(()=>list.querySelector(`[data-combat-stance="${runtime.selectedId}"]`)?.focus());
    }
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function closeUseStack(){const closeParent=runtime.parentKind==="abilities";windowManager.closeKind("combat-stances",{restoreFocus:!closeParent});if(closeParent)windowManager.closeKind("abilities");}
    function apply(id=runtime.selectedId,{closeStack=true,focus=true}={}){
      const stance=byId.get(id);if(!stance)return false;runtime.selectedId=id;
      const access=availability(stance);if(!access.allowed){append(`${stance.name}: ${access.reason} (prototype only)`);render({focus:true});return true;}
      if(runtime.currentId===id){append(`${stance.name} is already active. (prototype only)`);render({focus:true});return true;}
      runtime.previousId=runtime.currentId;runtime.currentId=id;state.combatStance=id;state.combatStanceRank=rankLabel(stance);
      append(`You enter ${stance.name}. Switching costs half a turn. (prototype only)`);applyCombatStatuses();
      if(closeStack)closeUseStack();else if(isOpen())render({focus});return true;
    }
    function applyPrevious(){if(runtime.previousId===runtime.currentId){append("No previous combat stance is available. (prototype only)");return true;}return apply(runtime.previousId);}
    function cycleFromHud(){
      const currentIndex=Math.max(0,stances.findIndex(stance=>stance.id===runtime.currentId));
      const next=Array.from({length:stances.length-1},(_,offset)=>stances[(currentIndex+offset+1)%stances.length]).find(stance=>availability(stance).allowed);
      return next?apply(next.id,{closeStack:false,focus:false}):true;
    }
    function move(delta){const index=Math.max(0,stances.findIndex(stance=>stance.id===runtime.selectedId));runtime.selectedId=stances[(index+delta+stances.length)%stances.length].id;render({focus:true});return true;}
    function isOpen(){return windowManager.has("combat-stances");}
    function show(entry){runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;runtime.selectedId=runtime.currentId;overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");}
    windowManager.register({kind:"combat-stances",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:()=>list.querySelector(`[data-combat-stance="${runtime.selectedId}"]`)||list,onOpen:show,onClose:hide});
    function openUse(opener=document.activeElement){return windowManager.push("combat-stances",{},{opener});}
    function closeWindow(){return windowManager.closeKind("combat-stances");}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="combat-stances")return false;
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if(event.key===":"&&!editing)return false;if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}if(editing)return false;
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);
      if(event.key==="Enter"||event.key===" ")return apply();if(event.key==="-")return applyPrevious();
      if(/^[a-c]$/i.test(event.key)){const stance=stances.find(entry=>entry.key===event.key.toLowerCase());return stance?apply(stance.id):true;}return true;
    }
    function reconcile({announce=false}={}){
      const active=byId.get(runtime.currentId);if(active&&availability(active).allowed)return;
      runtime.previousId=runtime.currentId;runtime.currentId="balanced";runtime.selectedId="balanced";state.combatStance="balanced";
      if(announce)append("Your current loadout or level no longer supports that stance; Balanced stance is restored. (prototype only)");
    }
    function applyControls({announce=false}={}){
      state.combatStancesFontSize=clamp(Math.round(state.combatStancesFontSize),8,20);if(!["shield","two-handed"].includes(state.stanceDemoLoadout))state.stanceDemoLoadout="shield";
      windowElement.style.setProperty("--combat-stances-font-size",`${state.combatStancesFontSize}px`);$("#combatStancesFontSizeControl").value=state.combatStancesFontSize;$("#combatStancesFontSizeValue").value=`${state.combatStancesFontSize}px`;$("#stanceDemoLoadoutControl").value=state.stanceDemoLoadout;
      reconcile({announce});state.combatStanceRank=rankLabel(byId.get(runtime.currentId));applyCombatStatuses();if(isOpen())render();
    }
    function refreshLevel(){reconcile({announce:true});state.combatStanceRank=rankLabel(byId.get(runtime.currentId));applyCombatStatuses();if(isOpen())render();}
    function resetSimulation(){runtime.selectedId="balanced";runtime.currentId="balanced";runtime.previousId="balanced";state.combatStance="balanced";state.combatStanceRank="STANDARD";applyCombatStatuses();if(isOpen())render({focus:true});}
    list.addEventListener("click",event=>{if(event.target.closest(".combat-stance-apply")){apply();return;}const row=event.target.closest("[data-combat-stance]");if(row){runtime.selectedId=row.dataset.combatStance;render({focus:true});}});
    list.addEventListener("dblclick",event=>{const row=event.target.closest("[data-combat-stance]");if(row)apply(row.dataset.combatStance);});
    $("#combatStancesClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    return{openUse,closeWindow,isOpen,handleKeydown,applyControls,refreshLevel,resetSimulation,cycleFromHud,restoreFocus:()=>isOpen()&&requestAnimationFrame(()=>list.querySelector(`[data-combat-stance="${runtime.selectedId}"]`)?.focus())};
  };
})();
