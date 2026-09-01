(() => {
  window.TomeNetPrototype.createGhostPowersFeature=({state,$})=>{
    const listeners=new Set();
    function isDemoGhost(){return state.ghostDemoState==="ghost";}
    function notify(){listeners.forEach(listener=>listener(isDemoGhost()));}
    function applyControls(){
      if(!["living","ghost"].includes(state.ghostDemoState))state.ghostDemoState="living";
      $("#ghostDemoStateControl").value=state.ghostDemoState;notify();
    }
    function resetSimulation(){state.ghostDemoState="living";applyControls();}
    return{isDemoGhost,applyControls,resetSimulation,getSourceLabel:()=>"Independent player-ghost demo state",subscribeAvailability:listener=>{listeners.add(listener);return()=>listeners.delete(listener);}};
  };
})();
