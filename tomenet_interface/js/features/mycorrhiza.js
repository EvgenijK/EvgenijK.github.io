(() => {
  window.TomeNetPrototype.createMycorrhizaFeature=({
    state,windowManager,appendGameMessage,escapeHtml,applyCombatStatuses,getItemSelectorFeature,getAbilitiesFeature
  })=>{
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function activeName(){return state.mycorrhiza?.name||"";}
    function blockedReason(){
      if(state.xpLevel<7)return `You cannot undergo mycorrhiza before level 7 (current ${state.xpLevel}).`;
      if(["paralyzed","stasis","suspended"].includes(state.conditions?.activity)||state.conditions?.stun==="knocked")return "You cannot undergo or leave mycorrhiza while you cannot move.";
      return "";
    }
    function sourceLabel(){return "Ent racial ability · globally available prototype fixture";}
    function closeAbilities(){if(windowManager.has("abilities"))getAbilitiesFeature()?.closeWindow();}
    function enter(opener=document.activeElement){
      const reason=blockedReason();if(reason){append(`${reason} (prototype only)`);return true;}
      const selector=getItemSelectorFeature();if(!selector)return false;
      return selector.openItemSelector({
        title:"Use which Mushroom?",allowedSources:["inventory","bags"],preferredSource:"bags",opener,
        availability:selection=>selection.item.fungus?{enabled:true,reason:""}:{enabled:false,reason:"Only fungi can be used for mycorrhiza."},
        onSelect:selection=>{
          if(state.mycorrhiza)append("You end your current mycorrhiza and the previous fungus decays. (prototype only)");
          state.mycorrhiza={id:selection.item.fungusId||selection.item.subtype||selection.item.name,name:selection.item.name};
          applyCombatStatuses();
          append(`You plant ${selection.item.name} on your bark, to enter a new mycorrhiza. No item was consumed. (prototype only)`);
          closeAbilities();
        }
      });
    }
    function leave(){
      const reason=blockedReason();if(reason){append(`${reason} (prototype only)`);return true;}
      if(!state.mycorrhiza){append("You are not currently in a mycorrhiza. (prototype only)");return true;}
      state.mycorrhiza=null;applyCombatStatuses();
      append("You end your current mycorrhiza and the fungus decays. (prototype only)");
      closeAbilities();return true;
    }
    function resetSimulation(){state.mycorrhiza=null;applyCombatStatuses();}
    return{enter,leave,resetSimulation,isActive:()=>Boolean(state.mycorrhiza),activeName,sourceLabel};
  };
})();
