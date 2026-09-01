(() => {
  const KIT_RULES={
    catapult:{label:"sling ammunition",accepts:item=>item.trapAmmoType==="shot"},
    arrow:{label:"arrows",accepts:item=>item.trapAmmoType==="arrow"},
    bolt:{label:"bolts",accepts:item=>item.trapAmmoType==="bolt"},
    fumes:{label:"potions or flasks",accepts:item=>item.type==="potion"||item.type==="fuel"},
    magic:{label:"scrolls or runes",accepts:item=>item.type==="scroll"||item.type==="rune"},
    device:{label:"wands, staves or rods",accepts:item=>["wand","staff","rod"].includes(item.type)}
  };

  window.TomeNetPrototype.createTrappingFeature=({
    state,windowManager,appendGameMessage,escapeHtml,getItemSelectorFeature,getAbilitiesFeature
  })=>{
    const runtime={kit:null,opener:null};
    function append(text){appendGameMessage({markup:escapeHtml(text)});}
    function blockedReason(){
      if(["blind","blind_hallu"].includes(state.conditions?.vision))return "You can't see anything.";
      if(state.conditions?.confusion==="confused")return "You are too confused!";
      return "";
    }
    function closeAbilities(){if(windowManager.has("abilities"))getAbilitiesFeature()?.closeWindow();}
    function kitAvailability(selection){
      if(selection.item.type!=="trap"||!KIT_RULES[selection.item.subtype])return{enabled:false,reason:"A trap kit is required."};
      if(selection.source==="bag"&&selection.bagSlot!=="d")return{enabled:false,reason:"Trap Kit Bags are the only eligible containers."};
      return{enabled:true,reason:""};
    }
    function loadAvailability(selection){
      const rule=KIT_RULES[runtime.kit?.item.subtype];
      return rule?.accepts(selection.item)?{enabled:true,reason:""}:{enabled:false,reason:`This kit requires ${rule?.label||"a compatible load"}.`};
    }
    function complete(load){
      const kit=runtime.kit;runtime.kit=null;
      append(`You set ${kit.item.name} loaded with ${load.item.name} beneath you. The original action would take half a turn; no items or map state were changed. (prototype only)`);
      closeAbilities();
    }
    function openLoad(){
      const selector=getItemSelectorFeature();if(!selector||!runtime.kit)return false;
      return selector.openItemSelector({
        title:`Load ${runtime.kit.item.name} with what?`,allowedSources:["inventory","equipment","bags"],preferredSource:"inventory",opener:runtime.opener,
        bagsEscapeSource:"inventory",availability:loadAvailability,onSelect:complete,
        onCancel:()=>requestAnimationFrame(()=>openKit())
      });
    }
    function openKit(){
      const selector=getItemSelectorFeature();if(!selector)return false;
      runtime.kit=null;
      return selector.openItemSelector({
        title:"Use which trapping kit?",allowedSources:["inventory","bags"],preferredSource:"inventory",bagsEscapeSource:"inventory",opener:runtime.opener,
        availability:kitAvailability,onSelect:selection=>{runtime.kit=selection;openLoad();}
      });
    }
    function open(opener=document.activeElement){
      const reason=blockedReason();if(reason){append(`${reason} (prototype only)`);return true;}
      runtime.opener=opener;return openKit();
    }
    function resetSimulation(){runtime.kit=null;runtime.opener=null;}
    return{open,resetSimulation,getSourceLabel:()=>"Trapping skill · 10.000"};
  };
})();
