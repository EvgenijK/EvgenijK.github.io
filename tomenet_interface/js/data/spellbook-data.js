(() => {
  const spell = (id,name,school,skillId,requiredLevel,mana,fail,description,options={}) => ({
    id,name,school,skillId,requiredLevel,mana,fail,description,
    info:options.info || "",direction:Boolean(options.direction),minimumCharacterLevel:options.minimumCharacterLevel || 0
  });

  const SPELL_DEFINITIONS = [
    spell("manathrust-i","Manathrust I","Mana","mana-school",1,4,10,["Conjures up mana into a nearly irresistible bolt."],{info:"damage bolt",direction:true}),
    spell("globe-light-i","Globe of Light I","Fire","fire",2,4,10,["Creates a globe of magical light.","At spell level 10 it damages monsters susceptible to light."],{info:"light area"}),
    spell("phase-door","Phase Door","Conveyance","conveyance",2,3,10,["Teleports you on a small-scale range."],{info:"short teleport"}),
    spell("detect-monsters","Detect Monsters","Divination","divination",4,3,10,["Detects all nearby non-invisible creatures.","Automatically projects to nearby players."],{info:"detection"}),
    spell("sense-hidden-i","Sense Hidden I","Divination","divination",5,3,10,["Detects traps in a radius around you.","Automatically projects to nearby players."],{info:"trap radius"}),
    spell("ents-potion","Ent's Potion","Water","water",6,10,20,["Fills up your stomach.","At spell level 5 it removes fear; at spell level 12 it grants heroism.","Automatically projects to nearby players."],{info:"food / courage"}),

    spell("relocation","Relocation","Astral Knowledge","astral",22,20,10,["Recalls into the dungeon, back to the surface or across the world."],{info:"recall"}),
    spell("vengeance","Vengeance","Astral Knowledge","astral",30,80,95,["Enlightened: summons party members on your floor and monsters in sight.","Corrupted: damages all monsters in sight."],{info:"alignment effect"}),
    spell("power-bolt-iii","Power Bolt III","Astral Knowledge","astral",40,20,0,["Enlightened: conjures a powerful bolt of mana.","Corrupted: conjures a powerful dispelling bolt."],{info:"damage bolt",direction:true}),
    spell("power-ray-iii","Power Ray III","Astral Knowledge","astral",40,25,0,["Enlightened: conjures a powerful beam of light.","Corrupted: conjures a powerful darkness beam."],{info:"damage beam",direction:true}),
    spell("power-blast-iii","Power Blast III","Astral Knowledge","astral",45,35,0,["Enlightened: conjures a powerful ball of mana.","Corrupted: conjures a powerful dispelling ball."],{info:"damage ball",direction:true}),
    spell("empowerment","Empowerment","Astral Knowledge","astral",40,50,95,["Enlightened: incites self-fury.","Corrupted: temporarily increases hit points."],{info:"alignment buff"}),
    spell("gateway","Gateway","Astral Knowledge","astral",50,50,95,["Requires Astral Knowledge 50 and character level 62.","Enlightened: recalls every party member on the level.","Corrupted: creates a paired void gate."],{info:"party recall / void gate",minimumCharacterLevel:62}),
    spell("silent-force","The Silent Force","Astral Knowledge","astral",45,50,95,["Enlightened: slows monsters in sight and grants temporary mana resistance.","Corrupted: increases critical chance."],{info:"alignment control"}),
    spell("sphere-destruction","Sphere of Destruction","Astral Knowledge","astral",50,48,95,["Enlightened: conjures a storm of mana.","Corrupted: conjures a raging inferno."],{info:"storm",direction:true}),

    spell("power-bolt-i","Power Bolt I","Astral Knowledge","astral",1,3,5,["Enlightened: conjures a powerful bolt of mana.","Corrupted: conjures a powerful dispelling bolt.","Neutral: conjures a bolt of lightning."],{info:"alignment bolt",direction:true})
  ];

  const SPELLBOOK_SOURCES = [
    {id:"beginner-cantrips",name:"Handbook of Beginner Cantrips",color:"#62d8ff",spellIds:["manathrust-i","globe-light-i","phase-door","detect-monsters","sense-hidden-i","ents-potion"]},
    {id:"divine-race-tome",name:"Divine Race Tome",color:"#e59a3c",spellIds:["relocation","vengeance","power-bolt-iii","power-ray-iii","power-blast-iii","empowerment","gateway","silent-force","sphere-destruction"]},
    {id:"power-bolt-scroll",name:"Spell Scroll of Power Bolt I",color:"#e59a3c",spellIds:["power-bolt-i"]}
  ];

  window.TomeNetPrototype.data.SPELL_DEFINITIONS = SPELL_DEFINITIONS;
  window.TomeNetPrototype.data.SPELLBOOK_SOURCES = SPELLBOOK_SOURCES;
})();
