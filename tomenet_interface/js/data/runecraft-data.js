(() => {
  const rune = (id,name,skillId,color) => ({id,name,skillId,color});
  const RUNES = [
    rune("light","Light","r-light","#f2e58d"),
    rune("darkness","Darkness","r-dark","#9b8771"),
    rune("nexus","Nexus","r-nexus","#d08ae2"),
    rune("nether","Nether","r-nether","#9e755b"),
    rune("chaos","Chaos","r-chaos","#d35bc7"),
    rune("mana","Mana","r-mana","#84b8e8")
  ];
  const element = (runes,name,weight,color) => ({runes:[...runes].sort().join("+"),name,weight,color});
  const ELEMENTS = [
    element(["light","light"],"Light",400,"#f2e58d"),element(["darkness","darkness"],"Darkness",550,"#9b8771"),
    element(["nexus","nexus"],"Nexus",250,"#d08ae2"),element(["nether","nether"],"Nether",550,"#9e755b"),
    element(["chaos","chaos"],"Chaos",600,"#d35bc7"),element(["mana","mana"],"Mana",600,"#84b8e8"),
    element(["light","darkness"],"Confusion",400,"#e79ae9"),element(["light","nexus"],"Inertia",200,"#8eb7aa"),
    element(["light","nether"],"Electricity",1200,"#65aef0"),element(["light","chaos"],"Fire",1200,"#ef6748"),
    element(["light","mana"],"Water",300,"#70cfd9"),element(["darkness","nexus"],"Gravity",150,"#a991cf"),
    element(["darkness","nether"],"Cold",1200,"#c6e6ed"),element(["darkness","chaos"],"Acid",1200,"#8bd15e"),
    element(["darkness","mana"],"Poison",800,"#73b852"),element(["nexus","nether"],"Time",150,"#79bcc3"),
    element(["nexus","chaos"],"Sound",400,"#e3bf63"),element(["nexus","mana"],"Shards",400,"#d4d2c8"),
    element(["nether","chaos"],"Hellfire",400,"#d54d39"),element(["nether","mana"],"Force",250,"#d8aa70"),
    element(["chaos","mana"],"Disenchantment",500,"#b38bc7")
  ];
  const mode = (id,name,level,cost,fail,damage,radius,duration,energy,description) => ({id,name,level,cost,fail,damage,radius,duration,energy,description});
  const MODES = [
    mode("minimized","Minimized",0,6,-20,6,-1,8,10,"Best efficiency, worst damage, poor size and duration."),
    mode("lengthened","Lengthened",2,8,-10,8,0,14,10,"Good efficiency, poor damage, best duration."),
    mode("compressed","Compressed",3,7,-5,9,-2,12,10,"Good efficiency and duration, worst size."),
    mode("moderate","Moderate",5,10,0,10,0,10,10,"Balanced spell parameters."),
    mode("enhanced","Enhanced",5,10,5,10,0,10,10,"Changes the runespell type into its enhanced form."),
    mode("expanded","Expanded",7,14,10,8,2,8,10,"Poor efficiency and duration, best size."),
    mode("brief","Brief",8,7,20,6,0,6,5,"Poor efficiency, good damage, worst duration and half energy."),
    mode("maximized","Maximized",10,18,40,14,1,12,10,"Worst efficiency, best damage, good size and duration.")
  ];
  const type = (id,name,level,cost,maxCost,diceMin,diceMax,sidesMin,sidesMax,radiusMin,radiusMax,durationMin,durationMax,description,directional=true) => ({id,name,level,cost,maxCost,diceMin,diceMax,sidesMin,sidesMax,radiusMin,radiusMax,durationMin,durationMax,description,directional});
  const TYPES = [
    type("bolt","Bolt",5,2,15,4,46,2,26,0,0,0,0,"Fires a single-target missile which may be deflected."),
    type("cloud","Cloud",10,4,20,0,0,3,75,2,2,3,7,"Engulfs an area for a few turns."),
    type("ball","Ball",15,8,25,0,0,90,450,3,3,0,0,"Fires a large explosion that diminishes with radius."),
    type("storm","Storm",20,16,30,0,0,20,135,1,1,7,27,"Engulfs a small area around the caster for many turns.",false),
    type("cone","Cone",25,16,40,4,46,2,26,3,3,0,0,"Sweeps a beam across a narrow contiguous arc."),
    type("surge","Surge",30,24,50,0,0,30,240,7,13,0,0,"Engulfs a quickly expanding area around the caster.",false),
    type("flare","Flare",35,25,25,4,46,2,26,0,0,2,2,"Briefly engulfs a target for high damage and always risks backlash.")
  ];
  const ENHANCED_TYPES = [
    type("bolt","Beam",10,4,20,4,46,2,26,0,0,0,0,"Fires a penetrating ray through every grid in a line."),
    type("cloud","Wall",15,6,30,0,0,20,135,0,0,8,20,"Engulfs a line of grids for several turns."),
    type("ball","Burst",20,16,40,0,0,90,450,2,2,0,0,"Fires an explosion that deals full damage across its radius."),
    type("storm","Nimbus",25,25,25,0,0,16,40,1,1,30,75,"Channels explosive energy and an elemental shield.",false),
    type("cone","Shot",30,6,42,4,46,2,15,9,9,0,0,"Fires four brief bolts at one or more targets in an arc."),
    type("surge","Glyph",35,40,40,4,25,2,20,1,1,0,0,"Traces an explosive glyph of warding onto the floor.",false),
    type("flare","Nova",40,99,99,4,46,2,26,0,0,7,7,"Channels mana in a star-shaped cloud and always risks backlash.")
  ];
  const ADJ_MAG_FAIL=[99,99,99,99,99,50,30,20,15,12,11,10,9,8,7,6,6,5,5,5,4,4,4,4,3,3,2,2,2,2,1,1,1,1,1,0,0,0];
  const ADJ_MAG_STAT=[0,0,0,1,1,1,2,2,3,3,4,4,5,6,7,8,9,10,11,12,13,14,16,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60];
  const elementKey=(first,second)=>[first,second].sort().join("+");
  const byElementKey=new Map(ELEMENTS.map(item=>[item.runes,item]));
  const scale=(skill,low,high)=>low+(high-low)*skill/50;
  const trunc=value=>Math.trunc(value);
  function calculateRuneSpell({firstRune,secondRune,mode,type,skills,mp=0,intStatIndex=33,dexStatIndex=29,blind=false,stun="none",confused=false}){
    const element=byElementKey.get(elementKey(firstRune.id,secondRune.id));
    const effectiveSkill=Math.min((skills.get(firstRune.skillId)||0)/1000,(skills.get(secondRune.skillId)||0)/1000);
    const enhanced=mode.id==="enhanced";const profile=(enhanced?ENHANCED_TYPES:TYPES).find(item=>item.id===type.id);
    const requiredLevel=mode.level+type.level;const ability=effectiveSkill-requiredLevel+1;
    const cost=scale(effectiveSkill,profile.cost,profile.maxCost)*mode.cost/10;
    let fail=100;
    if(ability>=1&&mp>=cost){
      fail=(15-Math.min(ability,15))*3-13+mode.fail;
      const stat=(ADJ_MAG_STAT[intStatIndex]*65+ADJ_MAG_STAT[dexStatIndex]*35)/100;
      const minimum=(ADJ_MAG_FAIL[intStatIndex]*65+ADJ_MAG_FAIL[dexStatIndex]*35)/100;
      fail=Math.max(fail-(stat-3),minimum);
      if(blind)fail+=10;if(stun==="heavy"||stun==="knocked")fail+=25;else if(stun!=="none")fail+=15;
      fail=Math.min(fail,95);
    }
    let weight=(element.weight*33+600*67)/100;if(element.weight<600)weight=element.weight;
    const dice=scale(effectiveSkill,profile.diceMin,profile.diceMax*weight/600);
    const sides=scale(effectiveSkill,profile.sidesMin,profile.sidesMax*mode.damage/10);
    let damage=scale(effectiveSkill,profile.sidesMin,profile.sidesMax*weight/600*mode.damage/10);
    const radius=Math.max(1,scale(effectiveSkill,profile.radiusMin,profile.radiusMax)+mode.radius);
    const duration=Math.max(3,scale(effectiveSkill,profile.durationMin,profile.durationMax)*mode.duration/10);
    if(enhanced&&profile.id==="flare"&&mp>cost)damage=mp;
    const usable=!confused&&ability>=1&&mp>=cost;
    const reason=confused?"Cannot draw a runespell while confused.":ability<1?`Requires effective rune skill ${requiredLevel}.000 (current ${effectiveSkill.toFixed(3)}).`:mp<cost?`Requires ${trunc(cost)} mana (current ${mp}).`:"";
    return{element,mode,type:profile,effectiveSkill,requiredLevel,ability,cost:trunc(cost),fail:trunc(fail),dice:trunc(dice),sides:trunc(sides),damage:trunc(damage),radius:trunc(radius),duration:trunc(duration),energy:mode.energy*10,usable,reason,directional:profile.directional,backlash:trunc(Math.max(damage,dice*sides)/5+1)};
  }
  window.TomeNetPrototype.data.RUNES=RUNES;
  window.TomeNetPrototype.data.RUNE_ELEMENTS=ELEMENTS;
  window.TomeNetPrototype.data.RUNE_MODES=MODES;
  window.TomeNetPrototype.data.RUNE_TYPES=TYPES;
  window.TomeNetPrototype.data.RUNE_ENHANCED_TYPES=ENHANCED_TYPES;
  window.TomeNetPrototype.data.calculateRuneSpell=calculateRuneSpell;
})();
