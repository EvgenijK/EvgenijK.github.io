(() => {
  const COMBAT_STANCES = [
    {id:"balanced",key:"a",short:"Bl",name:"Balanced stance",color:"#9d9d9d",description:"The normal fighting stance. It applies no special combat bonuses or penalties."},
    {id:"defensive",key:"b",short:"Df",name:"Defensive stance",color:"#5ccbe4",description:"Trade melee damage and ranged physical damage for stronger interception, blocking or parrying."},
    {id:"offensive",key:"c",short:"Of",name:"Offensive stance",color:"#ff8d00",description:"Commit to a two-handed assault with improved interception and a chance to stun, at the cost of defence."}
  ];
  window.TomeNetPrototype.data.COMBAT_STANCES = COMBAT_STANCES;
})();
