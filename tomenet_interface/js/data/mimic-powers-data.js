(() => {
  const power = (id,name,mana,fail,direction,description,result,source) => ({
    id,name,mana,fail,direction,description,result,source
  });

  const MIMIC_POWERS = [
    power("missile","Missile",3,9,true,"Fires a physical missile without requiring a bow or ammunition.","A spectral missile streaks toward the target.","RF4:7"),
    power("confusion","Confusion",6,20,true,"Attempts to confuse the selected creature.","Your gaze twists the target's senses.","RF5:29"),
    power("darkness","Darkness",6,10,false,"Unlights the nearby area around the current form.","Darkness gathers around you.","RF6:12"),
    power("teleport-to","Teleport To",15,25,true,"Attempts to teleport the selected creature toward you.","Space folds and draws the target closer.","RF6:8"),
    power("paralyze","Paralyze",10,30,true,"Attempts to place the selected creature into magical stasis.","A stilling force reaches for the target.","RF5:31"),
    power("scare","Scare",4,15,true,"Attempts to fill the selected creature with supernatural fear.","A wave of terror rushes toward the target.","RF5:27"),
    power("cause-wounds","Cause Wounds",6,20,true,"Invokes a hostile curse against the selected creature.","A malignant curse strikes at the target.","RF5:12")
  ];

  const MIMIC_FORMS = [
    {id:"player",code:0,name:"Player",glyph:"@",color:"#d8d5ca",level:0,fittingExtremities:true,powerIds:[],description:"Return to the character's natural player body."},
    {id:"giant-brown-bat",code:114,name:"Giant brown bat",glyph:"b",color:"#c79d55",level:6,fittingExtremities:false,powerIds:[],description:"A swift flying animal form without equipment-compatible extremities."},
    {id:"dark-elf",code:122,name:"Dark-elf",glyph:"h",color:"#666666",level:7,fittingExtremities:true,powerIds:["confusion","darkness","missile"],description:"A humanoid form with simple hostile magic and darkness powers."},
    {id:"brown-yeek",code:141,name:"Brown yeek",glyph:"y",color:"#c79d55",level:8,fittingExtremities:true,powerIds:[],description:"A small humanoid form with equipment-compatible extremities."},
    {id:"vampire",code:432,name:"Vampire",glyph:"V",color:"#cdcdcd",level:27,fittingExtremities:true,powerIds:["teleport-to","paralyze","scare","cause-wounds","darkness"],description:"A powerful undead humanoid form with curses, control and darkness powers."}
  ];

  const MIMIC_IMMUNITIES = ["Chaos","None","Electricity","Cold","Fire","Acid","Poison","Water"];

  Object.assign(window.TomeNetPrototype.data,{MIMIC_POWERS,MIMIC_FORMS,MIMIC_IMMUNITIES});
})();
