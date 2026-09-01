(() => {
  const technique=(id,index,name,cost,archery,options={})=>({id,index,name,cost,archery,...options});
  const RANGED_TECHNIQUES=[
    technique("flare-missile",0,"Flare Missile",2,4000,{energy:"Full turn",description:"Prepare an oil-drenched projectile. The next shot lights its landing area or deals extra fire damage to the monster it hits.",result:"You prepare an oil-drenched shot."}),
    technique("precision-shot",1,"Precision Shot",7,8000,{energy:"Full turn",description:"Aim the next shot carefully for a strong damage bonus, especially against a fleeing opponent.",result:"You aim carefully for a precise shot."}),
    technique("craft-ammunition",2,"Craft Ammunition",null,10000,{energy:"Full turn",description:"Create ammunition for the equipped launcher from bones or broken sticks, or create sling shots from nearby rubble.",result:"You craft a new stack of ammunition from the available materials."}),
    technique("double-shot",3,"Double Shot","1*",16000,{energy:"No additional shooting energy",description:"Toggle double-shot mode. Each attack fires two weaker projectiles; while actively used it has a 20% chance per turn to drain 1 stamina.",result:"You switch to shooting double shots."}),
    technique("barrage",4,"Barrage",9,25000,{energy:"Half turn when fired",description:"Prepare six projectiles for one powerful multi-shot against a single target, primarily intended to stun it.",result:"You prepare a powerful multi-shot barrage."})
  ];
  window.TomeNetPrototype.data.RANGED_TECHNIQUES=RANGED_TECHNIQUES;
})();
