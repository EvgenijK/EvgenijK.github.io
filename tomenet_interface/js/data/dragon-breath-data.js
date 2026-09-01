(() => {
  const element=(id,name,cap,color,description)=>({id,name,cap,color,description});
  const DRAGON_BREATH_ELEMENTS=[
    {id:"random",name:"Random",cap:null,capRange:[450,500],color:"#c680e8",description:"Choose one of the five basic elements independently for every breath."},
    element("lightning","Lightning",500,"#62a7ff","A crackling electrical breath with the highest damage cap."),
    element("frost","Frost",500,"#e6edf4","A cone of killing cold with the highest damage cap."),
    element("fire","Fire",500,"#ff674b","A searing cone of dragon fire with the highest damage cap."),
    element("acid","Acid",500,"#c4a487","A corrosive breath that dissolves its target area."),
    element("poison","Poison",450,"#62dc69","A poisonous cloud with a slightly lower damage cap."),
    element("confusion","Confusion",350,"#c879db","A disorienting breath intended to confuse its victims."),
    element("inertia","Inertia",500,"#d4d4cf","A heavy breath that slows motion through raw inertia."),
    element("sound","Sound",350,"#e3c84f","A concussive wave of sound with a lower damage cap."),
    element("shards","Shards",350,"#b9a997","A storm of cutting shards with a lower damage cap."),
    element("chaos","Chaos",450,"#b66ce0","An unstable chaos breath with a moderate damage cap."),
    element("disenchantment","Disenchantment",400,"#d8873f","A breath that strips magical power from its victims.")
  ];
  const lineage=(id,name,elementId,description)=>({id,name,elementId,description,multi:id==="multi"});
  const DRAGON_LINEAGES=[
    lineage("blue","Blue","lightning","Blue draconians inherit lightning breath."),
    lineage("white","White","frost","White draconians inherit frost breath."),
    lineage("red","Red","fire","Red draconians inherit fire breath."),
    lineage("black","Black","acid","Black draconians inherit acid breath."),
    lineage("green","Green","poison","Green draconians inherit poison breath."),
    lineage("multi","Multi-hued","random","Multi-hued draconians may select any of the five basic elements or leave each breath random."),
    lineage("bronze","Bronze","confusion","Bronze draconians inherit confusion breath."),
    lineage("silver","Silver","inertia","Silver draconians inherit inertia breath."),
    lineage("gold","Gold","sound","Gold draconians inherit sound breath."),
    lineage("law","Law","shards","Law draconians inherit shards breath."),
    lineage("chaos","Chaos","chaos","Chaos draconians inherit chaos breath."),
    lineage("balance","Balance","disenchantment","Balance draconians inherit disenchantment breath.")
  ];
  Object.assign(window.TomeNetPrototype.data,{DRAGON_BREATH_ELEMENTS,DRAGON_LINEAGES});
})();
