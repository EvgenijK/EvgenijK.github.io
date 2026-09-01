(() => {
  const ability = (id,mkey,label,order,options = {}) => ({
    id,mkey,label,order,
    description:options.description || label,
    sourceSkillIds:options.sourceSkillIds || [],
    builtin:Boolean(options.builtin),
    kind:options.kind || "placeholder",
    result:options.result || "",
    child:options.child || "",
    childDescription:options.childDescription || ""
  });

  window.TomeNetPrototype.data.ABILITY_DATA = [
    ability("parry-block",14,"Check parry/block chance",1,{
      sourceSkillIds:["combat"],kind:"message",
      description:"Review the defensive chances granted by Combat, shields and the currently wielded weapon.",
      result:"Your current parry chance is 18.4%; your block chance is 12.7%."
    }),
    ability("fire-till-kill",4,"Toggle fire-till-kill mode",13,{
      builtin:true,kind:"toggle",
      description:"Continue firing at the chosen target while it remains valid and visible."
    }),
    ability("aura-fear",15,"Control your aura of fear",28,{
      sourceSkillIds:["fear-aura"],kind:"toggle",
      description:"Enable or suppress the necromantic aura that may frighten attackers in close combat."
    }),
    ability("aura-shiver",16,"Control your shivering aura",29,{
      sourceSkillIds:["shiver-aura"],kind:"toggle",
      description:"Enable or suppress the shivering aura that may stun attackers in close combat."
    }),
    ability("aura-death",17,"Control your aura of death",30,{
      sourceSkillIds:["death-aura"],kind:"toggle",
      description:"Enable or suppress the aura that releases waves of plasma or ice when its bearer is struck."
    }),
    ability("fighting-techniques",5,"Fighting techniques",32,{
      kind:"melee-techniques",child:"Melee techniques",
      description:"Choose one of the special techniques unlocked by melee training.",
      childDescription:"Choose a learned class or skill-derived fighting technique."
    }),
    ability("shooting-techniques",6,"Shooting techniques",33,{
      kind:"ranged-techniques",child:"Ranged techniques",
      description:"Choose one of the special shooting techniques unlocked by Archery.",
      childDescription:"Choose a learned Archery technique for the current ranged loadout."
    }),
    ability("intercept",9,"Check intercept chance",41,{
      sourceSkillIds:["intercept"],kind:"message",
      description:"Review the chance to interfere with actions performed by adjacent opponents.",
      result:"Your current intercept chance is 23.6%."
    }),
    ability("dodge",8,"Check dodge chance",42,{
      sourceSkillIds:["dodge"],kind:"message",
      description:"Review the chance to evade attacks with the current armour and carried weight.",
      result:"Your current dodge chance is 31.2%."
    }),
    ability("set-trap",10,"Set trap",46,{
      sourceSkillIds:["trapping"],kind:"trapping",child:"Item selector",
      description:"Choose a trap kit and a compatible load, then assemble the monster trap beneath you."
    }),
    ability("cast-spell",11,"Cast a spell",48,{
      sourceSkillIds:["conveyance","mana-school","fire","air","water","nature","earth","divination","temporal","udun","holy-offense","holy-defense","holy-curing","holy-support","arcane-lore","physical-lore","astral","psycho-power","attunement","mental-intrusion","shadow","spirit","hereticism","unlife"],
      kind:"spellbook",child:"Spellbook",description:"Choose a learned spell from all schools currently available to the character.",
      childDescription:"Spellbook opens in cast mode and keeps carried books as the source of truth."
    }),
    ability("dual-mode",1,"Switch between main-hand and dual-hand",78,{
      sourceSkillIds:["dual"],kind:"dual-mode",
      description:"Switch whether dual-wield bonuses are enabled or only the main-hand weapon is used."
    }),
    ability("combat-stance",13,"Switch combat stance",79,{
      sourceSkillIds:["stances"],kind:"combat-stances",child:"Combat stances",
      description:"Choose the active armed-melee stance.",
      childDescription:"Choose Balanced, Defensive or Offensive stance with the current weapon loadout."
    }),
    ability("innate-power",3,"Use innate power",80,{
      sourceSkillIds:["mimicry"],kind:"mimic-powers",child:"Mimic powers",
      description:"Choose an innate power supplied by the current form.",
      childDescription:"Mimic powers opens with form controls and the powers supplied by the current body."
    }),
    ability("draw-rune",12,"Draw a rune",96,{
      sourceSkillIds:["r-light","r-dark","r-nexus","r-nether","r-chaos","r-mana"],kind:"runecraft",child:"Runecraft",
      description:"Combine two elemental runes with a spell mode and type, then draw the resulting runespell."
    }),
    ability("enter-mycorrhiza",20,"Enter Mycorrhiza",107,{
      kind:"mycorrhiza-enter",child:"Item selector",
      description:"Choose a fungus from Inventory or Bags and plant it on your bark to begin or replace a symbiosis."
    }),
    ability("leave-mycorrhiza",21,"Leave Mycorrhiza",108,{
      kind:"mycorrhiza-leave",
      description:"End the current fungal symbiosis and allow the implanted fungus to decay."
    }),
    ability("breathe",18,"Breathe element",110,{
      kind:"dragon-breathe",child:"Map targeting",
      description:"Immediately aim the current Draconian lineage breath at a map target.",
      childDescription:"Use the current Draconian lineage element against a selected map target."
    }),
    ability("pick-breath",19,"Pick breath element",111,{
      kind:"dragon-pick",child:"Pick breath element",
      description:"Choose the element used by a multi-coloured draconian breath.",
      childDescription:"Choose Random, Lightning, Frost, Fire, Acid or Poison for a Multi-hued lineage."
    }),
    ability("ghost-powers",null,"Ghost powers",112,{
      kind:"ghost-powers",child:"Unavailable",
      description:"Ghost powers were intended for player ghosts but are currently unavailable in TomeNET.",
      childDescription:"The dormant historical implementation permanently drained experience and could make a ghost fade away."
    })
  ];
})();
